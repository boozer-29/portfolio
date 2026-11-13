/* Simulated field data.
   A real deployment would read from the sensor gateway / weather API.
   For the prototype we generate realistic, repeatable data for several
   situations, including the hard ones from the brief: noisy readings,
   missing readings, dead sensors and no weather/internet. */

var HOUR = 3600 * 1000;

function seededRandom(seed) {
  var s = seed >>> 0;
  return function () {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function gaussian(rand) {
  var u = Math.max(rand(), 1e-9), v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/* Scenario definitions.
   start   = soil water % (volumetric) 7 days ago
   rate    = average drying per hour
   events  = water added (irrigation or rain) at N hours ago
   sensors = per-sensor faults: deadAt (hours ago it stopped), spikes, offset */
var SCENARIOS = {
  normal: {
    start: 33, rate: 0.1, events: [{ h: 110, add: 10 }],
    sensors: [{ offset: 0.4 }, { offset: -0.6 }, { offset: 0.2 }],
    forecast: [{ p: 10, mm: 0, tMax: 34 }, { p: 15, mm: 1, tMax: 35 }, { p: 30, mm: 3, tMax: 33 }],
    online: true
  },
  rain: {
    start: 40, rate: 0.1, events: [{ h: 80, add: 8 }],
    sensors: [{ offset: 0.3 }, { offset: -0.4 }, { offset: 0.1 }],
    forecast: [{ p: 85, mm: 18, tMax: 27 }, { p: 70, mm: 10, tMax: 26 }, { p: 40, mm: 4, tMax: 29 }],
    online: true
  },
  noisy: {
    start: 34, rate: 0.1, events: [{ h: 112, add: 10 }],
    sensors: [{ offset: 0.5 }, { offset: 0, spikes: true }, { offset: -0.3, noise: 2.2 }],
    forecast: [{ p: 10, mm: 0, tMax: 32 }, { p: 20, mm: 1, tMax: 33 }, { p: 25, mm: 2, tMax: 33 }],
    online: true
  },
  offline: {
    start: 38, rate: 0.1, events: [{ h: 100, add: 9 }],
    sensors: [{ offset: 0.2, deadAt: 30 }, { offset: -0.5, noise: 1.6 }, { offset: 0.4, deadAt: 50 }],
    forecast: [{ p: 20, mm: 1, tMax: 31 }, { p: 35, mm: 3, tMax: 30 }, { p: 50, mm: 6, tMax: 29 }],
    online: true
  },
  allDown: {
    start: 38, rate: 0.1, events: [{ h: 120, add: 8 }],
    sensors: [{ offset: 0.2, deadAt: 40 }, { offset: -0.5, deadAt: 60 }, { offset: 0.4, deadAt: 75 }],
    forecast: null,
    online: false
  },
  wet: {
    start: 40, rate: 0.1, events: [{ h: 20, add: 23 }],
    sensors: [{ offset: 0.3 }, { offset: -0.2 }, { offset: 0.5 }],
    forecast: [{ p: 40, mm: 4, tMax: 28 }, { p: 25, mm: 2, tMax: 30 }, { p: 15, mm: 0, tMax: 31 }],
    online: true
  }
};

/* True (hidden) soil moisture curve for a scenario. */
function trueCurve(sc, hoursAgo) {
  var v = sc.start;
  for (var h = 168; h > hoursAgo; h--) {
    var hourOfDay = (24 + new Date(Date.now() - h * HOUR).getHours()) % 24;
    var dayFactor = hourOfDay >= 9 && hourOfDay <= 17 ? 1.7 : 0.45; // dries faster in the day
    v -= sc.rate * dayFactor;
    sc.events.forEach(function (e) { if (e.h === h) v += e.add; });
  }
  return Math.max(5, Math.min(55, v));
}

function generateScenario(name, now) {
  var sc = SCENARIOS[name] || SCENARIOS.normal;
  now = now || Date.now();
  var rand = seededRandom(name.length * 7919 + 17);
  var base = [];
  for (var h = 168; h >= 0; h--) base.push({ h: h, v: trueCurve(sc, h) });

  var sensors = sc.sensors.map(function (cfg, i) {
    var readings = base.map(function (b) {
      var tms = now - b.h * HOUR;
      if (cfg.deadAt !== undefined && b.h < cfg.deadAt) return { t: tms, v: null };
      if (rand() < 0.04) return { t: tms, v: null }; // lost radio packet
      var v = b.v + cfg.offset + gaussian(rand) * (cfg.noise || 0.6);
      if (cfg.spikes && rand() < 0.3) {
        v = rand() < 0.3 ? (rand() < 0.5 ? 0 : 99) : v + (rand() - 0.5) * 30;
      }
      return { t: tms, v: Math.round(v * 10) / 10 };
    });
    return { id: i + 1, readings: readings };
  });

  return {
    name: name,
    now: now,
    sensors: sensors,
    forecast: sc.forecast ? sc.forecast.map(function (f) { return Object.assign({}, f); }) : null,
    online: sc.online,
    fetchedAt: sc.online ? now - 4 * 60 * 1000 : now - 41 * HOUR
  };
}
