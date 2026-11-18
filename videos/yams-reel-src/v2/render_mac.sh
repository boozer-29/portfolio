#!/bin/bash
# One-command 4K render on a Mac (Apple Silicon). Usage:  ./render_mac.sh            (full 4K)
#                                                          ./render_mac.sh preview    (540x960 quick check)
set -e
cd "$(dirname "$0")"
command -v ffmpeg >/dev/null || { echo "Install ffmpeg first:  brew install ffmpeg"; exit 1; }
[ -d node_modules/three ] || { npm install; npx playwright install chromium; }
# the final mixed audio is extracted from the approved video, so no re-mixing is needed
AUDIO=../../polygram-yams-final-4k.mp4
[ -f mix.wav ] || ffmpeg -v error -y -i "$AUDIO" -vn -c:a pcm_s16le mix.wav
if [ "$1" = "preview" ]; then SCALE=0.5; OUT=frames_preview; else SCALE=2; OUT=frames4k; fi
mkdir -p $OUT; TOTAL=1698; N=3; PER=$(( (TOTAL + N - 1) / N ))     # 3 parallel workers; lower N on an 8 GB Mac if it gets hot
for i in $(seq 0 $((N-1))); do
  S=$((i*PER)); E=$(( (i+1)*PER )); [ $E -gt $TOTAL ] && E=$TOTAL
  GPU=1 RSCALE=$SCALE node render.js range $S $E $OUT > log_$i.txt 2>&1 &
done
wait
echo "frames done: $(ls $OUT | wc -l)"
ffmpeg -v error -y -framerate 30 -i $OUT/%05d.jpg -i mix.wav -c:v libx264 -preset slow -crf 16 -maxrate 13M -bufsize 26M -profile:v high -pix_fmt yuv420p -c:a aac -b:a 256k -ar 44100 -movflags +faststart "yams_mac_${1:-4k}.mp4"
echo "DONE -> $(pwd)/yams_mac_${1:-4k}.mp4"
