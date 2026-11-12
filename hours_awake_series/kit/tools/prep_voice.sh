#!/bin/bash
# usage: tools/prep_voice.sh episodes/epN   (expects episodes/epN/voice.mp3)
cd "$1"; mkdir -p site stills frames aud; ffmpeg -y -loglevel error -i voice.mp3 -ar 48000 -ac 1 voice48.wav; ffmpeg -y -loglevel error -i voice.mp3 -ar 16000 -ac 1 voice16.wav; echo ok
