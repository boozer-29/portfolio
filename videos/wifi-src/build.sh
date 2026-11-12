#!/bin/bash
cd "$(dirname "$0")" && cat part_a.js part_b.js part_b2.js $(ls part_c[0-9]*.js | sort) part_d.js > wifi.js && node --check wifi.js
