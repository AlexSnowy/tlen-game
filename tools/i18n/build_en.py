#!/usr/bin/env python3
"""Собирает английскую версию игры из русской по словарю tools/i18n/en.json (+extra.json).
public/en/: game.js, data.js, icons.js, relay.js, index.html, dict.json.
Флаг --root-en DIR: сделать в DIR английский index.html корневым (для международных площадок)."""
import json,os,re,shutil,sys
H=os.path.dirname(os.path.abspath(__file__));sys.path.insert(0,H)
from common import runs
ROOT=os.path.dirname(os.path.dirname(H));PUB=os.path.join(ROOT,'public')
D=json.load(open(os.path.join(H,'en.json'),encoding='utf8'))
ex=os.path.join(H,'extra.json')
if os.path.exists(ex):D.update(json.load(open(ex,encoding='utf8')))
miss=set()
def tr(s,js=True):
    out=[];last=0
    for a,b,t in runs(s,js):
        v=D.get(t)
        if v is None:miss.add(t);continue
        out.append(s[last:a]);out.append(v.replace("'",'’'));last=b
    out.append(s[last:]);r=''.join(out)
    return r.replace('«','“').replace('»','”')
def page(base,alt,src_js):
    h=open(os.path.join(PUB,'index.html'),encoding='utf8').read()
    h=tr(h,False).replace('<html lang="ru"','<html lang="en"')
    h=h.replace("window.LANG=window.LANG||'ru';window.LANG_ALT=window.LANG_ALT||'en/';",f"window.LANG='en';window.LANG_ALT={alt!r};")
    if base:h=h.replace('<head>','<head>\n<base href="'+base+'">',1)
    h=h.replace('src="./game.js?v=__V__"','src="'+src_js+'?v=__V__"')
    return h
def main():
    out=os.path.join(PUB,'en');os.makedirs(out,exist_ok=True)
    for f in ['game.js','data.js']:
        open(os.path.join(out,f),'w',encoding='utf8').write(tr(open(os.path.join(PUB,f),encoding='utf8').read()))
    for f in ['icons.js','relay.js']:shutil.copy(os.path.join(PUB,f),os.path.join(out,f))
    open(os.path.join(out,'index.html'),'w',encoding='utf8').write(page('../','./','./en/game.js'))
    json.dump(D,open(os.path.join(out,'dict.json'),'w',encoding='utf8'),ensure_ascii=False,separators=(',',':'))
    if miss:
        print('Не переведено:',len(miss));[print('  ',m) for m in sorted(miss)[:60]]
    else:print('en: всё переведено')
if __name__=='__main__':main()
