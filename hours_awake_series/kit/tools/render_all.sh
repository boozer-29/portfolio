#!/bin/bash
# usage: tools/render_all.sh episodes/epN PORT   -> builds, serves, renders every frame on 4 workers, mixes nothing (run audio.py first), muxes final.mp4
EP=$1; PORT=${2:-8790}; $EP/build.sh || exit 1; (cd $EP/site && python3 -m http.server $PORT >/dev/null 2>&1 &); sleep 1
N=$(python3 -c "import json;print(int(json.load(open('$EP/cues.json'))['duration']*30))"); rm -f $EP/frames/*.jpg
for i in 0 1 2 3; do node tools/frames.js $EP $PORT range 0 $N $i 4 & done; wait
ffmpeg -y -loglevel error -framerate 30 -i $EP/frames/f_%05d.jpg -i $EP/mix_final.wav -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -r 30 -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest $EP/final.mp4
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,duration -of csv $EP/final.mp4; pkill -f "http.server $PORT"
