#!/bin/bash
cd "$(dirname "$0")"
V=../v5
cat $V/lib.js $V/chars.js $V/props.js hudcap.js $V/scenes1.js $V/scenes2.js $V/scenes3.js $V/scenes4.js $(ls scenes5*.js 2>/dev/null) main.js > site/render.js
node -e "new Function(require('fs').readFileSync('site/render.js','utf8'))" && echo syntax-ok
