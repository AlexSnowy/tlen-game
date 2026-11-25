import json,os,sys
sys.path.insert(0,os.path.dirname(__file__));from common import runs
root=os.path.join(os.path.dirname(__file__),'..','..','public');seen=[]
for f in ['game.js','data.js','index.html']:
    s=open(os.path.join(root,f),encoding='utf8').read()
    for a,b,t in runs(s,f.endswith('.js')):
        if t not in seen:seen.append(t)
json.dump(seen,open(os.path.join(os.path.dirname(__file__),'src.json'),'w',encoding='utf8'),ensure_ascii=False,indent=0)
print(len(seen),sum(len(x) for x in seen))
