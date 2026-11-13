/* UI layer: renders the engine's result for a low-literacy, outdoor user. */
(function () {
  var STORE_KEY = "smartIrrigation.v1";
  var state = load() || {};
  state.lang = state.lang || "en";
  state.crop = state.crop || "tomato";
  state.numbers = !!state.numbers;
  state.log = state.log || [];
  state.manual = state.manual || null;
  state.scenario = new URLSearchParams(location.search).get("scenario") || state.scenario || "normal";

  var data, result, speaking = false;
  var $ = function (id) { return document.getElementById(id); };

  function load() { try { return JSON.parse(localStorage.getItem(STORE_KEY)); } catch (e) { return null; } }
  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* private mode */ } }
  function T(key, vars) { return t(state.lang, key, vars); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function ago(ms) {
    if (ms === null || ms === undefined || !isFinite(ms)) return T("never");
    var m = Math.round((data.now - ms) / 60000);
    if (m < 2) return T("justNow");
    if (m < 60) return T("minAgo", { n: m });
    var h = Math.round(m / 60);
    if (h < 48) return T("hoursAgo", { n: h });
    return T("daysAgo", { n: Math.round(h / 24) });
  }

  /* ---------- render ---------- */
  function render() {
    data = generateScenario(state.scenario, data && data.scenarioName === state.scenario ? data.now : Date.now());
    data.scenarioName = state.scenario;
    result = decide(data, { crop: state.crop, manual: state.manual, log: state.log });
    document.documentElement.lang = state.lang;
    document.body.dataset.numbers = state.numbers ? "on" : "off";
    document.body.dataset.decision = result.decision;

    document.querySelectorAll("[data-t]").forEach(function (el) { el.textContent = T(el.dataset.t); });
    document.querySelectorAll(".lang button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.lang === state.lang); });
    $("numbersToggle").checked = state.numbers;

    $("updated").textContent = T("updated", { t: ago(data.fetchedAt) });
    $("offline").hidden = data.online;

    renderHero(); renderWhy(); renderSoil(); renderWeather(); renderFeel();
    renderSensors(); renderHistory(); renderLog(); renderCrops(); renderDemo();
  }

  var HERO = {
    water: { icon: "drop", cls: "water" },
    maybe: { icon: "dropQ", cls: "maybe" },
    wait:  { icon: "sprout", cls: "wait" },
    check: { icon: "hand", cls: "check" }
  };

  function heroText() {
    var r = result, lines = [T("d." + r.decision)];
    if (r.decision === "water" || r.decision === "maybe") {
      lines.push(T("s.pump", { n: r.pump.n }) + " (" + T("s.pumpRange", { a: r.pump.lo, b: r.pump.hi }) + ")");
      if (r.decision === "maybe") lines.push(T("s.maybe"));
      else lines.push(T("bestTime"));
    } else if (r.decision === "wait") {
      lines.push(r.rainWait ? T("s.waitRain") : T("s.wait"));
    } else {
      lines.push(T("s.check"));
    }
    return lines;
  }

  function renderHero() {
    var r = result, h = HERO[r.decision], lines = heroText();
    var hero = $("hero");
    hero.className = "hero " + h.cls;
    $("heroIcon").innerHTML = icon(h.icon);
    $("heroTitle").textContent = lines[0];
    var sub = "";
    if (r.pump) {
      sub = '<p class="pump">' + icon("pump") + "<span><strong>" + esc(T("s.pump", { n: r.pump.n })) + "</strong>" +
        '<span class="range">' + esc(T("s.pumpRange", { a: r.pump.lo, b: r.pump.hi })) + "</span></span></p>";
      sub += '<p class="hint">' + icon(r.decision === "maybe" ? "hand" : "sun") + "<span>" + esc(lines[2]) + "</span></p>";
    } else {
      sub = '<p class="hint">' + icon(r.decision === "check" ? "sensorOff" : r.rainWait ? "rain" : "clock") + "<span>" + esc(lines[1]) + "</span></p>";
    }
    $("heroSub").innerHTML = sub;

    var level = { high: 3, med: 2, low: 1 }[r.confidence];
    var dots = "";
    for (var i = 1; i <= 3; i++) dots += '<span class="seg' + (i <= level ? " on" : "") + '"></span>';
    $("conf").innerHTML = '<span class="conf-label">' + esc(T("confidence")) + "</span>" +
      '<span class="meter lvl' + level + '" role="img" aria-label="' + esc(T("c." + r.confidence)) + " (" + level + '/3)">' + dots + "</span>" +
      '<strong class="conf-word">' + esc(T("c." + r.confidence)) + "</strong>";

    $("listen").innerHTML = icon(speaking ? "stop" : "speaker") + "<span>" + esc(T(speaking ? "stop" : "listen")) + "</span>";
  }

  function renderWhy() {
    $("whyList").innerHTML = result.reasons.map(function (re) {
      return '<li class="chip ' + re.tone + '">' + icon(re.icon) + "<span>" + esc(T(re.key, re.vars)) + "</span></li>";
    }).join("");
  }

  /* Soil gauge: zones + uncertainty band + marker */
  function renderSoil() {
    var r = result, c = r.crop, W = 320, X0 = 10, X1 = 310, max = 55;
    var x = function (v) { return X0 + (Math.max(0, Math.min(max, v)) / max) * (X1 - X0); };
    var plant = "unknown", zone = "";
    var svg = '<svg viewBox="0 0 ' + W + ' 86" class="gauge" role="img" aria-labelledby="gaugeDesc">';
    svg += '<defs><pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" stroke-width="3"/></pattern></defs>';
    svg += '<rect x="' + X0 + '" y="22" width="' + (x(c.refill) - X0) + '" height="26" rx="6" class="z-dry"/>';
    svg += '<rect x="' + x(c.refill) + '" y="22" width="' + (x(c.full + 3) - x(c.refill)) + '" height="26" class="z-good"/>';
    svg += '<rect x="' + x(c.full + 3) + '" y="22" width="' + (X1 - x(c.full + 3)) + '" height="26" rx="6" class="z-wet"/>';
    svg += '<text x="' + ((X0 + x(c.refill)) / 2) + '" y="16" class="zl">' + esc(T("tooDry")) + "</text>";
    svg += '<text x="' + ((x(c.refill) + x(c.full + 3)) / 2) + '" y="16" class="zl">' + esc(T("good")) + "</text>";
    svg += '<text x="' + ((x(c.full + 3) + X1) / 2) + '" y="16" class="zl">' + esc(T("tooWet")) + "</text>";

    var desc;
    if (r.estimate !== null) {
      var lo = r.estimate - r.unc, hi = r.estimate + r.unc;
      svg += '<rect x="' + x(lo) + '" y="18" width="' + Math.max(4, x(hi) - x(lo)) + '" height="34" rx="4" class="band"/>';
      svg += '<rect x="' + x(lo) + '" y="18" width="' + Math.max(4, x(hi) - x(lo)) + '" height="34" rx="4" class="band-hatch" fill="url(#hatch)"/>';
      svg += '<path d="M' + x(r.estimate) + ' 56 l-9 14 h18z" class="marker"/>';
      svg += '<line x1="' + x(r.estimate) + '" y1="18" x2="' + x(r.estimate) + '" y2="52" class="marker-line"/>';
      svg += '<text x="' + x(r.estimate) + '" y="83" class="num marker-num">' + Math.round(r.estimate) + "%</text>";
      zone = r.estimate < c.refill ? "tooDry" : r.estimate > c.full + 3 ? "tooWet" : r.estimate < c.refill + 3 ? "nearDry" : "good";
      plant = zone === "tooDry" ? "dry" : zone === "tooWet" ? "wet" : zone === "nearDry" ? "near" : "ok";
      desc = T(zone) + ". " + T("soilBetween", { a: Math.round(lo), b: Math.round(hi) });
    } else {
      svg += '<text x="160" y="70" class="zl nodata">' + esc(T("noData")) + "</text>";
      desc = T("noData");
    }
    [0, c.refill, c.full + 3, 50].forEach(function (v) {
      svg += '<text x="' + x(v) + '" y="62" class="num tick">' + v + "</text>";
    });
    svg += '<desc id="gaugeDesc">' + esc(desc) + "</desc></svg>";
    $("gauge").innerHTML = svg;
    $("plant").innerHTML = plantSvg(plant === "near" ? "ok" : plant);
    $("plant").className = "plant " + plant;
    $("soilWord").textContent = zone ? T(zone) : T("noData");
    $("soilWord").className = "soil-word " + plant;
    $("soilRange").textContent = r.estimate !== null
      ? T("soilBetween", { a: Math.round(r.estimate - r.unc), b: Math.round(r.estimate + r.unc) }) + " · " + T("soilBest", { v: Math.round(r.estimate) })
      : "";
  }

  function plantSvg(kind) {
    var stem = '<path d="M50 88 V48" class="stem"/>';
    var leaves = {
      ok: '<path d="M50 62 C34 60 26 48 26 36 C40 38 50 48 50 62z" class="leaf"/><path d="M50 54 C64 52 74 40 74 28 C60 30 50 40 50 54z" class="leaf"/><path d="M50 48 C46 38 48 28 54 20 C58 30 56 40 50 48z" class="leaf"/>',
      dry: '<path d="M50 60 C40 66 30 78 30 88 C40 82 48 72 50 60z" class="leaf dry"/><path d="M50 54 C60 60 70 72 72 84 C62 78 52 68 50 54z" class="leaf dry"/><path d="M50 48 C42 46 36 52 34 58 C42 58 48 54 50 48z" class="leaf dry"/>',
      wet: '<path d="M50 62 C36 62 28 54 26 44 C38 44 48 52 50 62z" class="leaf wet"/><path d="M50 56 C62 56 72 48 74 38 C62 38 52 46 50 56z" class="leaf wet"/>',
      unknown: '<path d="M50 62 C36 62 28 52 28 42 C40 42 50 50 50 62z" class="leaf unk"/><path d="M50 56 C62 56 72 46 72 36 C60 36 50 44 50 56z" class="leaf unk"/><text x="50" y="30" class="q">?</text>'
    }[kind];
    var ground = kind === "dry"
      ? '<path d="M8 90 H92" class="ground"/><path d="M22 90 l4 6 -3 4M60 90 l-3 5 4 5M80 90 l3 6" class="crack"/>'
      : kind === "wet"
        ? '<path d="M8 90 H92" class="ground"/><path d="M14 97 q6 -4 12 0 t12 0 t12 0 t12 0 t12 0 t12 0" class="puddle"/>'
        : '<path d="M8 90 H92" class="ground"/>';
    return '<svg viewBox="0 0 100 104" aria-hidden="true">' + ground + stem + leaves + "</svg>";
  }

  function renderWeather() {
    var fc = data.forecast, box = $("weatherDays");
    if (!fc) {
      box.innerHTML = '<p class="empty">' + icon("cloudOff") + "<span>" + esc(T("noForecast")) + "</span></p>";
      return;
    }
    var names = ["today", "tomorrow", "dayAfter"];
    box.innerHTML = fc.map(function (d, i) {
      var level = d.p >= 70 ? 3 : d.p >= 40 ? 2 : d.p >= 20 ? 1 : 0;
      var drops = "";
      for (var k = 1; k <= 3; k++) drops += '<span class="d' + (k <= level ? " on" : "") + '">' + icon("drop") + "</span>";
      var ic = d.p >= 50 ? "rain" : d.p >= 25 ? "cloud" : "sun";
      return '<div class="day ' + ic + '"><span class="dname">' + esc(T(names[i])) + "</span>" + icon(ic, "big") +
        '<span class="drops" role="img" aria-label="' + esc(T("rainChance", { p: d.p })) + '">' + drops + "</span>" +
        '<span class="pct num">' + esc(T("rainChance", { p: d.p })) + (d.mm ? " · " + d.mm + " mm" : "") + "</span></div>";
    }).join("");
  }

  function renderFeel() {
    var urgent = result.decision === "check" || result.decision === "maybe" || result.confidence === "low";
    $("feel").classList.toggle("urgent", urgent);
    var cur = state.manual && data.now - state.manual.t < 24 * HOUR ? state.manual.level : null;
    var html = "";
    ["dry", "damp", "wet"].forEach(function (lvl) {
      html += '<button type="button" class="feel-btn ' + lvl + '" data-level="' + lvl + '" aria-pressed="' + (cur === lvl) + '">' +
        feelSvg(lvl) + "<strong>" + esc(T("feelSub." + lvl)) + "</strong><span>" + esc(T("feel." + lvl)) + "</span></button>";
    });
    $("feelBtns").innerHTML = html;
    $("feelClear").hidden = !cur;
    $("feelClear").textContent = T("feelClear");
  }

  function feelSvg(lvl) {
    var g = {
      dry: '<circle cx="18" cy="30" r="4"/><circle cx="30" cy="34" r="3"/><circle cx="40" cy="28" r="3.5"/><circle cx="26" cy="22" r="2.5"/><circle cx="46" cy="36" r="2"/><circle cx="12" cy="38" r="2"/>',
      damp: '<ellipse cx="30" cy="30" rx="14" ry="11"/><path d="M22 26 q4 -3 8 0" class="hl"/>',
      wet: '<path d="M14 26 q16 -14 32 0 q4 10 -6 14 q-10 3 -20 0 q-10 -4 -6 -14z"/><path d="M24 44 q0 6 -3 8 M34 44 q1 5 4 8" class="dripline"/><path d="M38 50 c0 3 4 3 4 0 c0 -2 -2 -4 -2 -6 c0 2 -2 4 -2 6z" class="dripdrop"/>'
    }[lvl];
    return '<svg viewBox="0 0 60 56" aria-hidden="true" class="soil-art">' + g + "</svg>";
  }

  function renderSensors() {
    $("sensorList").innerHTML = result.sensors.map(function (s) {
      var ic = { ok: "check", noisy: "wave", offline: "sensorOff", stale: "clock" }[s.status];
      var fix = s.status === "ok" ? "" : '<span class="fix">' + icon("info") + esc(T("fix." + s.status)) + "</span>";
      var val = s.estimate !== null ? '<span class="num sval">' + Math.round(s.estimate) + "%</span>" : "";
      return '<li class="sensor ' + s.status + '"><span class="sbadge">' + icon(ic) + "</span>" +
        '<span class="sbody"><strong>' + esc(T("sensor", { n: s.id })) + " · " + esc(T("st." + s.status)) + "</strong>" +
        '<span class="seen">' + esc(T("lastSeen", { t: ago(s.lastT) })) + "</span>" + fix + "</span>" + val + "</li>";
    }).join("");
  }

  /* 7-day chart with uncertainty band and explicit gaps */
  function renderHistory() {
    var hist = buildHistory(data), c = result.crop;
    var W = Math.max(320, Math.round($("chart").clientWidth || 640)), H = 240, L = 34, R = 12, Tp = 14, B = 34;
    var t0 = hist[0].t, t1 = hist[hist.length - 1].t;
    var x = function (tms) { return L + (tms - t0) / (t1 - t0) * (W - L - R); };
    var ymin = 10, ymax = 55;
    var y = function (v) { return Tp + (1 - (Math.max(ymin, Math.min(ymax, v)) - ymin) / (ymax - ymin)) * (H - Tp - B); };
    var s = '<svg viewBox="0 0 ' + W + " " + H + '" class="chart" role="img" aria-label="' + esc(T("historyTitle")) + '">';
    s += '<defs><pattern id="gapHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" class="gap-line"/></pattern></defs>';
    // zones
    s += '<rect x="' + L + '" y="' + y(c.refill) + '" width="' + (W - L - R) + '" height="' + (y(ymin) - y(c.refill)) + '" class="cz-dry"/>';
    s += '<rect x="' + L + '" y="' + y(c.full + 3) + '" width="' + (W - L - R) + '" height="' + (y(c.refill) - y(c.full + 3)) + '" class="cz-good"/>';
    s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(c.refill) + '" y2="' + y(c.refill) + '" class="refill"/>';
    s += '<text x="' + (L + 6) + '" y="' + (y(c.refill) + 16) + '" class="refill-t">' + esc(T("refillLine")) + "</text>";
    [20, 30, 40, 50].forEach(function (v) {
      s += '<text x="' + (L - 6) + '" y="' + (y(v) + 4) + '" class="axis num" text-anchor="end">' + v + "</text>";
    });
    // day separators + labels
    var d = new Date(t0); d.setHours(24, 0, 0, 0);
    for (; d.getTime() <= t1; d.setDate(d.getDate() + 1)) {
      var xx = x(d.getTime());
      s += '<line x1="' + xx + '" x2="' + xx + '" y1="' + Tp + '" y2="' + (H - B) + '" class="grid"/>';
      if (x(d.getTime() + 12 * HOUR) < W - R) {
        s += '<text x="' + x(d.getTime() + 12 * HOUR) + '" y="' + (H - 12) + '" class="axis" text-anchor="middle">' +
          esc(d.toLocaleDateString(T("_speech"), { weekday: "short" })) + "</text>";
      }
    }
    // segments
    var segs = [], cur = null, gaps = [], gapStart = null;
    hist.forEach(function (p) {
      if (p.v === null) {
        if (cur) { segs.push(cur); cur = null; }
        if (gapStart === null) gapStart = p.t;
      } else {
        if (gapStart !== null) { gaps.push([gapStart, p.t]); gapStart = null; }
        (cur = cur || []).push(p);
      }
    });
    if (cur) segs.push(cur);
    if (gapStart !== null) gaps.push([gapStart, t1]);

    gaps.forEach(function (g) {
      var gx = x(g[0] - HOUR / 2), gw = Math.max(3, x(g[1]) - gx - 1);
      s += '<rect x="' + gx + '" y="' + Tp + '" width="' + gw + '" height="' + (H - Tp - B) + '" fill="url(#gapHatch)" class="gap"/>';
      if (gw > 60) s += '<text x="' + (gx + gw / 2) + '" y="' + (Tp + 18) + '" class="gap-t" text-anchor="middle">' + esc(T("noData")) + "</text>";
    });
    segs.forEach(function (seg) {
      var up = seg.map(function (p) { return x(p.t) + "," + y(p.v + p.band); });
      var dn = seg.slice().reverse().map(function (p) { return x(p.t) + "," + y(p.v - p.band); });
      s += '<polygon points="' + up.concat(dn).join(" ") + '" class="cband"/>';
    });
    segs.forEach(function (seg) {
      s += '<polyline points="' + seg.map(function (p) { return x(p.t) + "," + y(p.v); }).join(" ") + '" class="cline"/>';
    });
    // projected point for tomorrow drawn at "now"
    if (result.estimate !== null) {
      var nx = x(t1);
      s += '<circle cx="' + nx + '" cy="' + y(result.estimate) + '" r="6" class="now-dot"/>';
    }
    s += "</svg>";
    $("chart").innerHTML = s;
  }

  function renderLog() {
    var list = state.log.slice().sort().reverse().slice(0, 5);
    $("logList").innerHTML = list.length
      ? list.map(function (ts) {
        return "<li>" + icon("drop") + "<span>" + esc(T("wateredOn")) + " · " + esc(new Date(ts).toLocaleString(T("_speech"), { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })) + "</span></li>";
      }).join("")
      : '<li class="empty">' + esc(T("logEmpty")) + "</li>";
  }

  function renderCrops() {
    $("cropBtns").innerHTML = ["tomato", "ragi", "maize"].map(function (c) {
      return '<button type="button" data-crop="' + c + '" aria-pressed="' + (state.crop === c) + '">' + icon(c, "big") + "<span>" + esc(T(c)) + "</span></button>";
    }).join("");
  }

  function renderDemo() {
    $("demoBtns").innerHTML = Object.keys(SCENARIOS).map(function (k) {
      return '<button type="button" data-sc="' + k + '" aria-pressed="' + (state.scenario === k) + '">' + esc(T("sc." + k)) + "</button>";
    }).join("");
  }

  /* ---------- voice ---------- */
  function speak() {
    if (!("speechSynthesis" in window)) { toast(T("noVoice")); return; }
    if (speaking) { speechSynthesis.cancel(); speaking = false; renderHero(); return; }
    var text = heroText().join(". ") + ". " + T("confidence") + ": " + T("c." + result.confidence) + ". " + T("why") + " " +
      result.reasons.map(function (r) { return T(r.key, r.vars); }).join(". ");
    var u = new SpeechSynthesisUtterance(text);
    u.lang = T("_speech");
    var v = speechSynthesis.getVoices().filter(function (v) { return v.lang && v.lang.toLowerCase().indexOf(state.lang) === 0; })[0];
    if (v) u.voice = v;
    u.rate = 0.9;
    u.onend = u.onerror = function () { speaking = false; renderHero(); };
    speaking = true; renderHero();
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }

  /* ---------- toast ---------- */
  var toastTimer;
  function toast(msg, action) {
    var el = $("toast");
    el.innerHTML = "<span>" + esc(msg) + "</span>" + (action ? '<button type="button" id="toastAction">' + icon("undo") + esc(action.label) + "</button>" : "");
    el.hidden = false;
    if (action) $("toastAction").onclick = function () { action.fn(); el.hidden = true; };
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 6000);
  }

  /* ---------- events ---------- */
  document.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.lang) { state.lang = b.dataset.lang; save(); render(); }
    else if (b.dataset.crop) { state.crop = b.dataset.crop; save(); render(); }
    else if (b.dataset.sc) { state.scenario = b.dataset.sc; state.manual = null; save(); render(); }
    else if (b.dataset.level) {
      state.manual = { level: b.dataset.level, t: data.now }; save(); render();
      toast(T("feelSaved"));
    }
    else if (b.id === "feelClear") { state.manual = null; save(); render(); }
    else if (b.id === "listen") speak();
    else if (b.id === "watered") {
      var ts = data.now; state.log.push(ts); save(); render();
      toast(T("feelSaved"), { label: T("undo"), fn: function () { state.log = state.log.filter(function (x) { return x !== ts; }); save(); render(); } });
    }
  });
  $("numbersToggle").addEventListener("change", function (e) { state.numbers = e.target.checked; save(); render(); });
  var rz; window.addEventListener("resize", function () { clearTimeout(rz); rz = setTimeout(renderHistory, 150); });
  window.addEventListener("online", render);
  window.addEventListener("offline", render);

  if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) {
    navigator.serviceWorker.register("sw.js").catch(function () {});
  }

  render();
})();
