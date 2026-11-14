#!/bin/bash
cd "$(dirname "$0")"; ENG=../../engine; mkdir -p site stills frames aud
cp -n $ENG/site/* site/ 2>/dev/null; cat $ENG/lib.js $ENG/hudcap.js $ENG/rig6.js $ENG/block.js ep5s.js $ENG/main.js > site/render.js
node -e "new Function(require('fs').readFileSync('site/render.js','utf8'))" && echo syntax-ok
