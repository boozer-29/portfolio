#!/bin/bash
cd "$(dirname "$0")"
cat lib.js chars.js props.js hudcap.js scenes1.js $(ls scenes[2-9].js 2>/dev/null) main.js > site/render.js
node -e "new Function(require('fs').readFileSync('site/render.js','utf8'))" && echo syntax-ok
