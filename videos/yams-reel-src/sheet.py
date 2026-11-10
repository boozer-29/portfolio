import os,subprocess,sys
d=sys.argv[1]; out=sys.argv[2]; cols=int(sys.argv[3]) if len(sys.argv)>3 else 10
fs=sorted(os.listdir(d),key=lambda f: float(f[1:-4]))
for i in range(0,len(fs),cols*2):
    chunk=fs[i:i+cols*2]; args=[]
    for f in chunk: args+=['-i',os.path.join(d,f)]
    n=len(chunk)
    if n<2: chunk.append(chunk[0]); args+=['-i',os.path.join(d,chunk[0])]; n=2
    fc=''.join(f'[{k}:v]scale=270:480,drawtext=text={chunk[k][1:-4]}:x=6:y=440:fontsize=30:fontcolor=yellow:box=1:boxcolor=black[v{k}];' for k in range(n))
    fc+=''.join(f'[v{k}]' for k in range(n))+f'xstack=inputs={n}:layout='+'|'.join(f'{(k%cols)*270}_{(k//cols)*480}' for k in range(n))+':fill=black'
    subprocess.run(['ffmpeg','-v','error','-y',*args,'-filter_complex',fc,'-frames:v','1',f'{out}_{i//(cols*2)}.jpg'],check=True)
