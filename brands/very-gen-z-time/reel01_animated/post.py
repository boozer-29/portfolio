import subprocess, os
S="/tmp/claude-0/-home-user-portfolio/ef58beb2-756a-5942-9e07-b15c5dbbcc56/scratchpad"; G=S+"/gz"
os.makedirs("post",exist_ok=True); os.chdir("post")
SILK=S+"/fonts/fontsource-silkscreen/files/silkscreen-latin-700-normal.woff"
ANTON=S+"/fonts/fontsource-anton/files/anton-latin-400-normal.woff"
GR={"WARM":"eq=saturation=0.9:contrast=1.06,colorbalance=rs=0.05:gs=0.01:bs=-0.05:rm=0.03:bm=-0.04:rh=0.02:bh=-0.03,curves=all='0/0.035 0.5/0.52 1/0.96'",
    "GOLDEN":"eq=saturation=1.05:contrast=1.08,colorbalance=rs=0.10:gs=0.02:bs=-0.08:rm=0.07:bm=-0.07:rh=0.06:bh=-0.06,curves=all='0/0.03 0.5/0.53 1/0.97'",
    "NEUTRAL":"eq=saturation=0.9:contrast=1.04"}
FINISH="format=gbrp,split[a][b];[b]curves=all='0/0 0.75/0 1/1',gblur=sigma=12[g];[a][g]blend=all_mode=screen:all_opacity=0.35,noise=alls=4:allf=t,format=yuv420p"
HDR="POV: YOUR BOSS ASKS YOU\nTO ACTUALLY CALL A CLIENT"
# (name, f0, f1, grade, captions[(text, t0, t1) in global seconds], pov)
segs=[("A",0,120,"WARM",[],True),
 ("B",120,175,"WARM",[("ZAY.",5.15,5.75),("CALL THE CLIENT.",5.75,7.3)],True),
 ("C",175,250,"WARM",[("CALL?",7.45,8.3),("LIKE...",8.3,9.0),("WITH MY VOICE?",9.0,10.42)],False),
 ("D",250,322,"WARM",[("YES. ON THE PHONE.",10.55,12.3),("RIGHT NOW.",12.3,13.42)],False),
 ("E",322,391,"WARM",[("I QUIT.",13.55,14.6),("OVER TEXT.",14.6,16.3)],False),
 ("F",391,480,"GOLDEN",[("YOU MET ME AT A",16.45,17.6),("VERY GEN Z TIME",17.6,18.8),("OF MY LIFE.",18.8,20.0)],False)]
def fs(t): return min(46,int(640/(0.80*len(t))))
files=[]
for name,f0,f1,gr,caps,pov in segs:
    st=f0/24; d=[]
    for i,(tx,a,b) in enumerate(caps):
        fn=f"{name}{i}.txt"; open(fn,"w").write(tx)
        d.append(f"drawtext=fontfile={SILK}:textfile={fn}:fontsize={fs(tx)}:fontcolor=white:borderw=4:bordercolor=black:x=(w-tw)/2:y=h*0.63:enable='between(t,{a-st:.2f},{b-st:.2f})'")
    if pov:
        open("pov.txt","w").write(HDR)
        d.append(f"drawtext=fontfile={ANTON}:textfile=pov.txt:fontsize=40:fontcolor=white:borderw=4:bordercolor=black:line_spacing=6:x=(w-tw)/2:y=h*0.10")
    vf=f"{GR[gr]},{FINISH}"+(","+",".join(d) if d else "")
    subprocess.run(["ffmpeg","-v","error","-y","-framerate","24","-start_number",str(f0),"-i","../frames/f_%04d.jpg","-frames:v",str(f1-f0),
        "-filter_complex",vf,"-r","24","-c:v","libx264","-preset","medium","-crf","23","-pix_fmt","yuv420p",f"{name}.mp4"],check=True)
    files.append(f"{name}.mp4"); print(name,"ok",flush=True)
# end card (3.4 s)
open("url.txt","w").write("VERYGENZTIME.COM"); open("drop.txt","w").write("DROP 01 · LIMITED")
fr=int(3.4*24)
subprocess.run(["ffmpeg","-v","error","-y","-i",f"{G}/tee1_2.png","-filter_complex",
  "[0]format=rgb24,split[t0][t1];[t0]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,gblur=sigma=25,eq=brightness=-0.12[bg];"
  "[t1]scale=830:-1,crop=720:ih[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2-80,format=yuv420p,"
  f"zoompan=z='min(1+0.0008*on,1.05)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={fr}:s=720x1280:fps=24,{GR['NEUTRAL']},{FINISH},"
  f"drawtext=fontfile={ANTON}:textfile=url.txt:fontsize=62:fontcolor=white:borderw=5:bordercolor=black:x=(w-tw)/2:y=h*0.70,"
  f"drawtext=fontfile={SILK}:textfile=drop.txt:fontsize=28:fontcolor=white:borderw=3:bordercolor=black:x=(w-tw)/2:y=h*0.77",
  "-frames:v",str(fr),"-r","24","-c:v","libx264","-preset","medium","-crf","23","-pix_fmt","yuv420p","G.mp4"],check=True)
files.append("G.mp4")
open("list.txt","w").write("".join(f"file '{f}'\n" for f in files))
subprocess.run(["ffmpeg","-v","error","-y","-f","concat","-safe","0","-i","list.txt","-c","copy","video.mp4"],check=True)
T=20+fr/24
ev=[(f"{G}/vo/l1.mp3",5.15),(f"{G}/vo/l2.mp3",7.45),(f"{G}/vo/l3.mp3",10.55),(f"{G}/vo/l7.mp3",13.55),(f"{G}/vo/l8.mp3",16.45),(f"{G}/vo/l9.mp3",20.1)]
sf=[(f"{G}/sfx/scratch.mp3",7.3),(f"{G}/sfx/ring.mp3",3.2),(f"{G}/sfx/sent.mp3",15.2),(f"{G}/sfx/gasp_sting.mp3",13.4)]
def place(events,out):
    ins=[];fl=[]
    for i,(f,t) in enumerate(events):
        ins+=["-i",f]; ms=int(t*1000); fl.append(f"[{i}]aresample=48000,aformat=channel_layouts=stereo,adelay={ms}|{ms}[x{i}]")
    subprocess.run(["ffmpeg","-v","error","-y",*ins,"-filter_complex",";".join(fl)+";"+"".join(f"[x{i}]" for i in range(len(events)))+f"amix=inputs={len(events)}:normalize=0:duration=longest","-ar","48000",out],check=True)
place(ev,"dialogue.wav"); place(sf,"sfx.wav")
subprocess.run(["ffmpeg","-v","error","-y","-i","video.mp4","-i","dialogue.wav","-i","sfx.wav","-i",f"{G}/sfx/bed.mp3","-filter_complex",
 "[1]highpass=f=80,acompressor=threshold=-18dB:ratio=3:attack=5:release=80,asplit=2[d][dsc];"
 "[3]aresample=48000,aformat=channel_layouts=stereo,volume=-13dB,aloop=loop=-1:size=2e9[m0];[m0][dsc]sidechaincompress=threshold=0.05:ratio=4:release=250[m];"
 f"[2]volume=-5dB[s];[d][m][s]amix=inputs=3:normalize=0,afade=t=out:st={T-0.45:.2f}:d=0.4,loudnorm=I=-14:TP=-1.5:LRA=9,volume=3.2dB,alimiter=limit=0.75:level=false[a]",
 "-map","0:v","-map","[a]","-c:v","copy","-c:a","aac","-b:a","160k","-ar","48000","-t",f"{T:.3f}","-movflags","+faststart","very_gen_z_time_reel01_animated_draft.mp4"],check=True)
print("DONE",T)
