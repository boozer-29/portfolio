#!/bin/bash
# $1 in raw wav, $2 out wav (44.1k mono)
ffmpeg -y -loglevel error -i "$1" -ar 44100 -ac 1 -af "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.06,areverse,atempo=1.18,highpass=f=90,equalizer=f=250:t=q:w=1:g=-2.5,equalizer=f=3500:t=q:w=1.2:g=4,equalizer=f=7000:t=q:w=1:g=2,acompressor=threshold=-26dB:ratio=4:attack=4:release=60:makeup=4,agate=threshold=0.015:ratio=4:attack=2:release=40,loudnorm=I=-13:TP=-1.5:LRA=7,alimiter=limit=0.89" "$2"
