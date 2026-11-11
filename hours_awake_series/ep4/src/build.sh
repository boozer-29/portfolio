#!/bin/bash
cd "$(dirname "$0")"
cat ../v5/lib.js hudcap.js rig6.js $(ls ep4*.js) main.js > site/render.js
node -e "new Function(require('fs').readFileSync('site/render.js','utf8'))" && echo syntax-ok
