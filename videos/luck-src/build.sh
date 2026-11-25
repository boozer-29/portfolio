#!/bin/bash
# concatenates the parts into luck.js and syntax-checks it as an ES module
cd "$(dirname "$0")" && cat part_a.js part_b.js part_b2.js part_b3.js $(ls part_c[0-9]*.js | sort) part_d.js > luck.js && cp luck.js "${TMPDIR:-/tmp}/luck_check.mjs" && node --check "${TMPDIR:-/tmp}/luck_check.mjs" && echo build ok
