#!/usr/bin/env python3
"""Mux the silent Remotion render with the sample-accurate mix -> out/cam4_ep1.mp4, then verify."""
import json, os, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
v = os.path.join(ROOT, 'out', 'video_silent.mp4')
a = os.path.join(ROOT, 'out', 'mix.wav')
o = os.path.join(ROOT, 'out', 'cam4_ep1.mp4')
run = lambda c: subprocess.run(c, check=True, capture_output=True, text=True)
run(['ffmpeg', '-y', '-i', v, '-i', a, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy',
     '-c:a', 'aac', '-b:a', '320k', '-ar', '48000', '-ac', '2', '-movflags', '+faststart', '-t', '60.0', o])
info = json.loads(run(['ffprobe', '-v', 'error', '-count_frames', '-show_entries',
                       'stream=codec_name,width,height,r_frame_rate,nb_read_frames,duration,sample_rate,channels',
                       '-of', 'json', o]).stdout)
for s in info['streams']:
    print(s)
# decode the delivered audio back to wav so the same QA runs on exactly what viewers hear
dec = os.path.join(ROOT, 'out', 'delivered_audio.wav')
run(['ffmpeg', '-y', '-i', o, '-vn', '-ac', '2', '-ar', '48000', '-c:a', 'pcm_s16le', dec])
print('decoded ->', dec)
