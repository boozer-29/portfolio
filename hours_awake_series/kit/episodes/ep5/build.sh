#!/bin/bash
# builds site/render.js for this episode from the shared engine + this episode's scenes
cd "$(dirname "$0")"; ENG=../../engine; mkdir -p site stills frames aud
cp -n $ENG/site/* site/ 2>/dev/null; cat $ENG/lib.js $ENG/hudcap.js $ENG/rig6.js $(ls ep*.js) $ENG/main.js > site/render.js
node -e "new Function(require('fs').readFileSync('site/render.js','utf8'))" && echo syntax-ok
