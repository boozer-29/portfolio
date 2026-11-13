/* Inline SVG icon set (no external files, works offline). */
var ICONS = {
  drop: '<path d="M12 2.5C9 7 5.5 10.5 5.5 14.5a6.5 6.5 0 0 0 13 0C18.5 10.5 15 7 12 2.5z"/>',
  dropQ: '<path d="M12 2.5C9 7 5.5 10.5 5.5 14.5a6.5 6.5 0 0 0 13 0C18.5 10.5 15 7 12 2.5z"/><path d="M10.3 12.6a1.8 1.8 0 1 1 2.5 1.7c-.6.3-.8.6-.8 1.2" stroke-width="1.6"/><circle cx="12" cy="17.6" r=".5" fill="currentColor"/>',
  sprout: '<path d="M12 21v-8"/><path d="M12 13c0-3.5-2.5-6-6.5-6 0 3.8 2.6 6 6.5 6z"/><path d="M12 11c0-3.5 2.4-6 6.5-6 0 3.8-2.6 6-6.5 6z"/><path d="M6 21h12"/>',
  hand: '<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11"/><path d="M11 10.5V4a1.5 1.5 0 0 1 3 0v6.5"/><path d="M14 10.5V5.5a1.5 1.5 0 0 1 3 0V14c0 4-2.5 7-6 7-2.6 0-4-1.3-5.3-3.4L4 14.6a1.5 1.5 0 0 1 2.4-1.8L8 15"/>',
  sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>',
  rain: '<path d="M7 15.5a4.5 4.5 0 0 1-.4-9A5.5 5.5 0 0 1 17 7.5a4 4 0 0 1 .5 8z"/><path d="M8.5 18.5l-1 2.5M12.5 18.5l-1 2.5M16.5 18.5l-1 2.5"/>',
  cloud: '<path d="M7 18a4.5 4.5 0 0 1-.4-9A5.5 5.5 0 0 1 17 10a4 4 0 0 1 .5 8z"/>',
  cloudOff: '<path d="M7 18a4.5 4.5 0 0 1-.4-9A5.5 5.5 0 0 1 17 10a4 4 0 0 1 .5 8z"/><path d="M3 3l18 18"/>',
  thermo: '<path d="M10 14.5V5a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0z"/><path d="M12 9v7"/>',
  sensor: '<path d="M10 3h4v11h-4z"/><path d="M12 14v7"/><path d="M6.5 6.5a7 7 0 0 0 0 7M17.5 6.5a7 7 0 0 1 0 7"/>',
  sensorOff: '<path d="M10 3h4v11h-4z"/><path d="M12 14v7"/><path d="M3 3l18 18"/>',
  wave: '<path d="M2 12c2-5 4-5 5 0s3 5 5 0 3-5 5 0 3 5 5 0"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  check: '<path d="M4.5 12.5l4.5 4.5 10.5-11"/>',
  cross: '<path d="M6 6l12 12M18 6L6 18"/>',
  speaker: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
  stop: '<rect x="6.5" y="6.5" width="11" height="11" rx="1.5"/>',
  soilDry: '<path d="M2 15h20"/><path d="M5 15l2 3-1.5 3M12 15l-1 2.5 2 2.5M18 15l1.5 2.5-1 3"/><path d="M12 13V8"/><path d="M12 9.5C10 9.5 8.5 8 8.5 6M12 8c1.6 0 3-1.3 3-3"/>',
  soilOk: '<path d="M2 16h20"/><path d="M12 16V8"/><path d="M12 11c-2.6 0-4.5-2-4.5-4.5 2.6 0 4.5 2 4.5 4.5zM12 10c0-2.5 1.9-4.5 4.5-4.5 0 2.5-1.9 4.5-4.5 4.5z"/><path d="M5 19.5h3M11 19.5h2M16 19.5h3"/>',
  soilWet: '<path d="M2 15h20"/><path d="M4 19c1.3-1 2.7-1 4 0s2.7 1 4 0 2.7-1 4 0 2.7 1 4 0"/><path d="M12 13V7"/><path d="M12 9.5c-2 0-3.5-1.5-3.5-3.5M12 9c1.7 0 3-1.3 3-3"/>',
  wifiOff: '<path d="M2 8.5a15 15 0 0 1 5-3M22 8.5a15 15 0 0 0-8-3.3M5.5 12a10 10 0 0 1 3-1.8M18.5 12a10 10 0 0 0-2.5-1.6M9 15.5a4.5 4.5 0 0 1 6 0"/><circle cx="12" cy="19" r=".8" fill="currentColor"/><path d="M3 3l18 18"/>',
  pump: '<circle cx="12" cy="13" r="7.5"/><path d="M12 8.5V13l3 2"/><path d="M9.5 2.5h5"/>',
  leaf: '<path d="M5 19C5 10 10 5 20 4c0 9-5 15-13 15z"/><path d="M5 19l8-8"/>',
  tomato: '<circle cx="12" cy="14" r="7"/><path d="M12 7V4M9 7.5l3-1 3 1M8.5 6l3.5 1.5L15.5 6"/>',
  ragi: '<path d="M12 21V9"/><path d="M12 9c-1.5-1-2.5-3-2-6 1.6 1 2.5 3 2 6zM12 9c1.5-1 2.5-3 2-6-1.6 1-2.5 3-2 6z"/><path d="M12 13c-2-.5-3.5-2-3.8-4M12 13c2-.5 3.5-2 3.8-4M12 17c-2.3-.4-4-2-4.4-4.3M12 17c2.3-.4 4-2 4.4-4.3"/>',
  maize: '<path d="M12 21V12"/><path d="M12 3c2.2 2 3 5 3 8s-1.3 4-3 4-3-1-3-4 .8-6 3-8z"/><path d="M10 7h4M9.4 10h5.2M9.5 13h5"/><path d="M12 21c-3-1-5-3.5-6-7M12 21c3-1 5-3.5 6-7"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><circle cx="12" cy="7.8" r=".6" fill="currentColor"/>',
  undo: '<path d="M8 7L4 11l4 4"/><path d="M4 11h10a5 5 0 0 1 0 10h-2"/>'
};

function icon(name, cls) {
  return '<svg class="ico ' + (cls || "") + '" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || "") + "</svg>";
}
