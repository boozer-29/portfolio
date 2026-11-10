#!/bin/bash
cd "$(dirname "$0")"
V=../v5; E=../e3
cat $V/lib.js $V/chars.js $V/props.js hudcap.js $V/scenes1.js $V/scenes2.js $V/scenes3.js $V/scenes4.js $E/scenes5a.js $E/scenes5b.js $E/scenes5c.js $E/scenes5d.js $E/scenes5e.js $(ls ep3*.js) main.js > site/render.js
node -e "new Function(require('fs').readFileSync('site/render.js','utf8'))" && echo syntax-ok
