/* Decision engine.
   Turns noisy / incomplete sensor + weather data into ONE recommendation,
   plus an honest statement of how sure we are and why.

   Steps:
   1. Clean each sensor: drop impossible values, reject outliers (median/MAD).
   2. Judge each sensor: ok / noisy / stale / offline.
   3. Fuse sensors (inverse-variance weighting) and widen the uncertainty
      when data is old, sensors disagree, or few sensors are left.
   4. Optionally add the farmer's own "feel the soil" check as another sensor.
   5. Project tomorrow's soil water using the weather forecast (or a cautious
      default when the forecast is missing).
   6. Compute the probability the soil will be below the crop's refill point,
      and turn that probability into Water / Probably water / Wait / Check. */

var CROPS = {
  tomato: { refill: 30, full: 42, minPerPct: 4 },
  ragi:   { refill: 24, full: 38, minPerPct: 3 },
  maize:  { refill: 28, full: 40, minPerPct: 4 }
};

var SENSOR_ACCURACY = 1.5;   // % points, typical capacitive probe
var DRY_PER_HOUR = 0.12;     // used to age stale readings
var STALE_HOURS = 6;
var UNUSABLE_HOURS = 36;
var MANUAL_VALUES = { dry: { v: 22, u: 5 }, damp: { v: 34, u: 5 }, wet: { v: 46, u: 5 } };

function median(a) {
  if (!a.length) return null;
  var s = a.slice().sort(function (x, y) { return x - y; });
  var m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function stdev(a) {
  if (a.length < 2) return 0;
  var m = a.reduce(function (x, y) { return x + y; }, 0) / a.length;
  return Math.sqrt(a.reduce(function (s, x) { return s + (x - m) * (x - m); }, 0) / (a.length - 1));
}
function normCdf(z) {
  // Abramowitz-Stegun approximation
  var t = 1 / (1 + 0.2316419 * Math.abs(z));
  var d = 0.3989423 * Math.exp(-z * z / 2);
  var p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}
function isPlausible(v) { return v !== null && v !== undefined && v >= 1 && v <= 60; }

function robustFilter(values) {
  var med = median(values);
  var mad = median(values.map(function (x) { return Math.abs(x - med); }));
  var limit = Math.max(3, 3 * 1.4826 * mad);
  return values.filter(function (x) { return Math.abs(x - med) <= limit; });
}

function countOutliers(values) {
  var n = 0;
  for (var i = 2; i < values.length - 2; i++) {
    var neigh = [values[i - 2], values[i - 1], values[i + 1], values[i + 2]];
    if (Math.abs(values[i] - median(neigh)) > 6) n++;
  }
  return n;
}

function analyseSensor(sensor, now) {
  var readings = sensor.readings;
  var valid = readings.filter(function (r) { return isPlausible(r.v); });
  var last = valid.length ? valid[valid.length - 1] : null;
  var ageH = last ? (now - last.t) / HOUR : Infinity;

  // window = last 8 hours of the sensor's own valid data
  var windowStart = last ? last.t - 8 * HOUR : 0;
  var win = valid.filter(function (r) { return r.t >= windowStart; }).map(function (r) { return r.v; });
  var clean = win.length ? robustFilter(win) : [];
  // Spike count over the last 24h of the sensor's life (impossible values + outliers)
  var dayStart = last ? last.t - 24 * HOUR : 0;
  var rawDay = readings.filter(function (r) { return r.t >= dayStart && r.v !== null; });
  var dayVals = rawDay.map(function (r) { return r.v; });
  var plausibleDay = dayVals.filter(isPlausible);
  var rejected = (dayVals.length - plausibleDay.length) + countOutliers(plausibleDay);
  var noise = stdev(clean);

  var status;
  if (!last || ageH > UNUSABLE_HOURS) status = "offline";
  else if (ageH > STALE_HOURS) status = "stale";
  else if (noise > 1.8 || rejected >= 3) status = "noisy";
  else status = "ok";

  var estimate = null, unc = null;
  if (last && ageH <= UNUSABLE_HOURS) {
    estimate = median(clean) - Math.max(0, ageH - 1) * DRY_PER_HOUR;
    unc = Math.sqrt(SENSOR_ACCURACY * SENSOR_ACCURACY + noise * noise + Math.pow(Math.max(0, ageH - 1) * 0.12, 2));
    if (status === "noisy") unc += 1;
  }

  return {
    id: sensor.id, status: status, ageH: ageH, lastT: last ? last.t : null,
    estimate: estimate, unc: unc, noise: noise, rejected: rejected
  };
}

function fuse(sources) {
  var usable = sources.filter(function (s) { return s.estimate !== null; });
  if (!usable.length) return { estimate: null, unc: null };
  var wSum = 0, vSum = 0;
  usable.forEach(function (s) { var w = 1 / (s.unc * s.unc); wSum += w; vSum += w * s.estimate; });
  var est = vSum / wSum;
  var fusedSd = Math.sqrt(1 / wSum);
  var spread = stdev(usable.map(function (s) { return s.estimate; }));
  var unc = Math.sqrt(fusedSd * fusedSd + spread * spread);
  if (usable.length === 1) unc = Math.max(unc, 2.5); // a single source can't cross-check itself
  return { estimate: est, unc: unc };
}

/* Main entry point. */
function decide(data, opts) {
  var now = data.now;
  var crop = CROPS[opts.crop] || CROPS.tomato;
  var reasons = [];

  var sensors = data.sensors.map(function (s) { return analyseSensor(s, now); });
  var sources = sensors.slice();

  // Farmer's hand check counts as an extra (less precise) sensor for 24h.
  if (opts.manual && now - opts.manual.t < 24 * HOUR) {
    var mv = MANUAL_VALUES[opts.manual.level];
    sources.push({ id: "manual", estimate: mv.v, unc: mv.u });
  }

  var fused = fuse(sources);

  // A logged watering newer than the freshest reading overrides old data.
  var freshest = Math.max.apply(null, sensors.map(function (s) { return s.lastT || 0; }));
  var lastWater = (opts.log || []).filter(function (l) { return l <= now; }).sort().pop();
  var wateredRecently = lastWater && now - lastWater < 24 * HOUR;
  if (wateredRecently && lastWater >= freshest) {
    fused = { estimate: crop.full - 2, unc: 4 };
  }

  // Data quality reasons
  var off = sensors.filter(function (s) { return s.status === "offline"; }).length;
  var noisy = sensors.filter(function (s) { return s.status === "noisy"; }).length;
  var minAge = Math.min.apply(null, sensors.map(function (s) { return s.ageH; }));

  // Weather projection
  var fc = data.forecast;
  var loss, gain = 0, rainSoon = 0, rainMm = 0, extraUnc = 0;
  if (fc) {
    loss = Math.min(5, Math.max(1, 2 + 0.15 * (fc[0].tMax - 25)));
    rainSoon = Math.max(fc[0].p, fc[1].p);
    rainMm = Math.max(fc[0].mm, fc[1].mm);
    gain = Math.min(12, (fc[0].p / 100) * fc[0].mm * 0.5);
  } else {
    loss = 3; extraUnc = 2;
  }

  var result = {
    sensors: sensors,
    estimate: fused.estimate,
    unc: fused.unc,
    crop: crop,
    forecast: fc,
    reasons: reasons,
    manualUsed: !!(opts.manual && now - opts.manual.t < 24 * HOUR)
  };

  if (fused.estimate === null) {
    result.decision = "check";
    result.confidence = "low";
    reasons.push({ key: "r.noSoil", icon: "sensorOff", tone: "warn" });
    if (off) reasons.push({ key: "r.sensorOff", vars: { n: off, m: sensors.length }, icon: "sensorOff", tone: "warn" });
    if (!fc) reasons.push({ key: "r.noWeather", icon: "cloudOff", tone: "warn" });
    return result;
  }

  var projected = fused.estimate - loss + gain;
  var unc = Math.sqrt(fused.unc * fused.unc + extraUnc * extraUnc);
  var pDry = normCdf((crop.refill - projected) / unc);
  result.projected = projected;
  result.unc = unc;
  result.pDry = pDry;

  var sureness = Math.max(pDry, 1 - pDry);
  var conf = sureness >= 0.85 ? "high" : sureness >= 0.65 ? "med" : "low";
  // Data problems cap how confident we are allowed to sound.
  if ((off >= 1 || noisy >= 1 || !fc) && conf === "high") conf = "med";
  if (sources.filter(function (s) { return s.estimate !== null; }).length === 0) conf = "low";

  var heavyRain = fc && rainSoon >= 70 && rainMm >= 8;

  if (pDry >= 0.5 && !heavyRain) {
    result.decision = conf === "low" ? "maybe" : "water";
    var deficit = crop.full - projected;
    var lo = Math.max(5, Math.round((deficit - unc) * crop.minPerPct / 5) * 5);
    var hi = Math.max(lo + 5, Math.round((deficit + unc) * crop.minPerPct / 5) * 5);
    result.pump = { n: Math.round(deficit * crop.minPerPct / 5) * 5, lo: lo, hi: hi };
    reasons.push({ key: "r.soilDry", icon: "soilDry", tone: "bad" });
  } else {
    result.decision = "wait";
    if (fused.estimate > crop.full + 3) reasons.push({ key: "r.soilWet", icon: "soilWet", tone: "info" });
    else if (pDry < 0.5) reasons.push({ key: "r.soilOk", icon: "soilOk", tone: "good" });
    else reasons.push({ key: "r.soilDry", icon: "soilDry", tone: "neutral" });
    if (heavyRain) result.rainWait = true;
  }
  result.confidence = conf;

  if (fc) {
    if (rainSoon >= 50) reasons.push({ key: "r.rainComing", vars: { p: rainSoon }, icon: "rain", tone: "info" });
    else reasons.push({ key: "r.noRain", icon: "sun", tone: "neutral" });
    if (fc[0].tMax >= 33) reasons.push({ key: "r.hot", icon: "thermo", tone: "neutral" });
  } else {
    reasons.push({ key: "r.noWeather", icon: "cloudOff", tone: "warn" });
  }
  if (wateredRecently) reasons.push({ key: "r.watered", icon: "check", tone: "good" });
  if (result.manualUsed) reasons.push({ key: "r.manual", icon: "hand", tone: "neutral" });
  if (off) reasons.push({ key: "r.sensorOff", vars: { n: off, m: sensors.length }, icon: "sensorOff", tone: "warn" });
  if (noisy) reasons.push({ key: "r.noisy", icon: "wave", tone: "warn" });
  if (minAge > STALE_HOURS && minAge !== Infinity) reasons.push({ key: "r.oldData", vars: { h: Math.round(minAge) }, icon: "clock", tone: "warn" });

  return result;
}

/* Hourly fused history for the chart: value + band, or null for a gap. */
function buildHistory(data) {
  var n = data.sensors[0].readings.length;
  var out = [];
  for (var i = 0; i < n; i++) {
    var vals = [];
    data.sensors.forEach(function (s) {
      // 3-hour rolling median per sensor suppresses single spikes
      var w = s.readings.slice(Math.max(0, i - 1), i + 2).map(function (r) { return r.v; }).filter(isPlausible);
      if (isPlausible(s.readings[i].v) && w.length) vals.push(median(w));
    });
    var tms = data.sensors[0].readings[i].t;
    if (!vals.length) { out.push({ t: tms, v: null }); continue; }
    var v = vals.reduce(function (a, b) { return a + b; }, 0) / vals.length;
    var band = Math.sqrt(SENSOR_ACCURACY * SENSOR_ACCURACY / vals.length + Math.pow(stdev(vals), 2)) + (vals.length === 1 ? 1 : 0);
    out.push({ t: tms, v: v, band: band, n: vals.length });
  }
  return out;
}
