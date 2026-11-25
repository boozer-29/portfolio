#!/bin/bash
# contact sheet of every jpg in a folder (sorted by time), 8 per row: sh sheetx.sh dir
d=$1; files=$(for f in $d/t*.jpg; do b=$(basename $f .jpg); echo "${b#t} $f"; done | sort -g | cut -d" " -f2); n=$(echo "$files" | wc -l | tr -d ' '); args=""; fl=""; lay=""
i=0; for f in $files; do args="$args -i $f"; fl="$fl[$i]scale=270:480[s$i];"; lay="$lay$((i%8*270))_$((i/8*480))|"; i=$((i+1)); done
ins=""; for j in $(seq 0 $((n-1))); do ins="$ins[s$j]"; done
if [ $n -eq 1 ]; then ffmpeg -loglevel error -y $args -vf scale=270:480 $d/sheet.jpg; else ffmpeg -loglevel error -y $args -filter_complex "$fl${ins}xstack=inputs=$n:layout=${lay%|}:fill=black" $d/sheet.jpg; fi
