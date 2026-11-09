import subprocess, os, json
S="/tmp/claude-0/-home-user-portfolio/ef58beb2-756a-5942-9e07-b15c5dbbcc56/scratchpad"
G=S+"/gz"; OUT=S+"/reel1"; os.chdir(OUT)
SILK=S+"/fonts/fontsource-silkscreen/files/silkscreen-latin-700-normal.woff"
ANTON=S+"/fonts/fontsource-anton/files/anton-latin-400-normal.woff"
GR={
"WARM":"eq=saturation=0.88:contrast=1.05,colorbalance=rs=0.05:gs=0.01:bs=-0.05:rm=0.03:bm=-0.04:rh=0.02:bh=-0.03,curves=all='0/0.035 0.5/0.52 1/0.96'",
"GOLDEN":"eq=saturation=1.0:contrast=1.06,colorbalance=rs=0.06:bs=-0.03:rh=0.05:bh=-0.05,curves=all='0/0.03 0.5/0.53 1/0.97'",
"COLD":"eq=saturation=0.55:contrast=1.03,colorbalance=rs=-0.04:bs=0.06:rm=-0.03:bm=0.05,curves=all='0/0.05 0.5/0.47 1/0.92'",
"NEUTRAL":"eq=saturation=0.9:contrast=1.04"}
FINISH="format=gbrp,split[a][b];[b]curves=all='0/0 0.75/0 1/1',gblur=sigma=18[g];[a][g]blend=all_mode=screen:all_opacity=0.35,noise=alls=3:allf=t,format=yuv420p"
def dur(f): return float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",f]))
VO={i:f"{G}/vo/l{i}.mp3" for i in range(1,10)}
# id, image, seconds, grade, line#, vo_offset, caption chunks, sfx list (name, offset), pov
HDR="POV: YOUR BOSS ASKS YOU\nTO ACTUALLY CALL A CLIENT"
shots=[
 ("s01",f"{G}/kf/k01_3.png",2.3,"WARM",1,0.15,["ZAY.","CALL THE CLIENT."],[],HDR),
 ("s02",f"{G}/kf/k02_2.png",3.1,"WARM",2,0.15,["CALL?","LIKE...","WITH MY VOICE?"],[("scratch",0.0)],HDR),
 ("s03",f"{G}/kf/k03_3.png",3.0,"WARM",3,0.10,["YES. ON THE PHONE.","RIGHT NOW."],[],None),
 ("s04",f"{G}/kf/k04_3.png",1.3,"WARM",None,0,["*RING RING*"],[("ring",0.0)],None),
 ("s05",f"{G}/kf/k05_2.png",3.9,"WARM",4,0.15,["CAN I JUST...","EMAIL THEM?","OR SEND A MEME?"],[],None),
 ("s06",f"{G}/kf/k06_2.png",1.8,"WARM",5,0.05,["WHAT?!"],[("gasp_sting",0.0)],None),
 ("s07",f"{G}/kf/k07_4.png",3.9,"COLD",6,0.50,["TELL MY MOM...","I TRIED."],[("thud",0.0)],None),
 ("s08",f"{G}/kf/k08_4.png",3.1,"GOLDEN",7,0.10,["I QUIT.","OVER TEXT."],[("sent",2.55)],None),
 ("s09",f"{G}/kf/k09_4.png",3.7,"GOLDEN",8,0.10,["YOU MET ME AT A","VERY GEN Z TIME","OF MY LIFE."],[],None),
 ("s10","ENDCARD",3.6,"NEUTRAL",9,0.10,[],[],None),
]
def esc(p): return p.replace(":","\\:")
def capsize(t): return min(66,int(940/(0.80*max(1,len(t)))))
t0=0.0; vo_events=[]; sfx_events=[]; files=[]
for sid,img,sec,grade,line,off,caps,sfx,pov in shots:
    frames=round(sec*30)
    draws=[]
    if caps:
        L=dur(VO[line]) if line else sec
        start=off; total=sum(len(c) for c in caps)
        for k,c in enumerate(caps):
            seg=(L-0.1)*len(c)/total
            end=start+seg if k<len(caps)-1 else sec
            fn=f"{sid}_c{k}.txt"; open(fn,"w").write(c)
            draws.append(f"drawtext=fontfile={SILK}:textfile={fn}:fontsize={capsize(c)}:fontcolor=white:borderw=6:bordercolor=black:x=(w-tw)/2:y=h*0.63:enable='between(t,{start:.2f},{end:.2f})'")
            start=end
    if pov:
        fn=f"{sid}_pov.txt"; open(fn,"w").write(pov)
        draws.append(f"drawtext=fontfile={ANTON}:textfile={fn}:fontsize=60:fontcolor=white:borderw=5:bordercolor=black:line_spacing=8:x=(w-tw)/2:y=h*0.11")
    if img=="ENDCARD":
        fn="url.txt"; open(fn,"w").write("VERYGENZTIME.COM")
        draws.append(f"drawtext=fontfile={ANTON}:textfile={fn}:fontsize=92:fontcolor=white:borderw=6:bordercolor=black:x=(w-tw)/2:y=h*0.70")
        fn2="drop.txt"; open(fn2,"w").write("DROP 01  ·  LIMITED")
        draws.append(f"drawtext=fontfile={SILK}:textfile={fn2}:fontsize=40:fontcolor=white:borderw=4:bordercolor=black:x=(w-tw)/2:y=h*0.77")
        fc=(f"[0]format=rgb24,split[t0][t1];[t0]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,gblur=sigma=30,eq=brightness=-0.12[bg];"
            f"[t1]scale=1240:-1,crop=1080:ih[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2-120,format=yuv420p,"
            f"zoompan=z='min(1+0.0006*on,1.05)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={frames}:s=1080x1920:fps=30,{GR[grade]},{FINISH},"+",".join(draws))
        src=f"{G}/tee1_2.png"
    else:
        fc=(f"[0]scale=1620:2880:flags=lanczos,zoompan=z='min(1+0.0009*on,1.08)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={frames}:s=1080x1920:fps=30,{GR[grade]},{FINISH}"
            +("," + ",".join(draws) if draws else ""))
        src=img
    subprocess.run(["ffmpeg","-v","error","-y","-i",src,"-filter_complex",fc,"-frames:v",str(frames),"-r","30","-c:v","libx264","-preset","medium","-crf","20","-maxrate","14M","-bufsize","28M","-pix_fmt","yuv420p","-an",f"{sid}.mp4"],check=True)
    files.append(f"{sid}.mp4")
    if line: vo_events.append((VO[line],t0+off))
    for n,o in sfx: sfx_events.append((f"{G}/sfx/{n}.mp3",t0+o))
    t0+=frames/30; print(sid,"ok",round(t0,2),flush=True)
open("list.txt","w").write("".join(f"file '{f}'\n" for f in files))
subprocess.run(["ffmpeg","-v","error","-y","-f","concat","-safe","0","-i","list.txt","-c","copy","video.mp4"],check=True)
def place(events,out,vol=None):
    ins=[];fl=[]
    for i,(f,t) in enumerate(events):
        ins+=["-i",f]; ms=int(t*1000); fl.append(f"[{i}]aresample=48000,aformat=channel_layouts=stereo,adelay={ms}|{ms}[x{i}]")
    mix="".join(f"[x{i}]" for i in range(len(events)))+f"amix=inputs={len(events)}:normalize=0:duration=longest"
    subprocess.run(["ffmpeg","-v","error","-y",*ins,"-filter_complex",";".join(fl)+";"+mix,"-ar","48000",out],check=True)
place(vo_events,"dialogue.wav"); place(sfx_events,"sfx.wav")
subprocess.run(["ffmpeg","-v","error","-y","-i","video.mp4","-i","dialogue.wav","-i","sfx.wav","-i",f"{G}/sfx/bed.mp3","-filter_complex",
 "[1]highpass=f=80,acompressor=threshold=-18dB:ratio=3:attack=5:release=80,asplit=2[d][dsc];"
 "[3]aresample=48000,aformat=channel_layouts=stereo,volume=-13dB,aloop=loop=-1:size=2e9[m0];[m0][dsc]sidechaincompress=threshold=0.05:ratio=4:release=250[m];"
 "[2]volume=-3dB[s];[d][m][s]amix=inputs=3:normalize=0,afade=t=out:st=%.2f:d=0.4,volume=1.5dB,loudnorm=I=-14:TP=-1.5:LRA=9[a]"%(t0-0.45),
 "-map","0:v","-map","[a]","-c:v","copy","-c:a","aac","-b:a","192k","-ar","48000","-t",f"{t0:.3f}","-movflags","+faststart","very_gen_z_time_reel01.mp4"],check=True)
print("DONE",t0)
