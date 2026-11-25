import re
RUN=re.compile(r"[А-Яа-яЁё][А-Яа-яЁёA-Za-z0-9 ,.!?:;«»—–\-%+()’/№…×·]*")
def segments(s, js=True):
    """Возвращает список (start,end) участков, которые НЕ комментарии."""
    if not js: 
        # html: пропускаем <!-- -->
        out=[];i=0
        for m in re.finditer(r'<!--.*?-->',s,re.S):
            out.append((i,m.start()));i=m.end()
        out.append((i,len(s)));return out
    out=[];i=0;n=len(s);start=0;q=None;tpl=0
    while i<n:
        c=s[i]
        if q:
            if c=='\\':i+=2;continue
            if c==q:q=None
            i+=1;continue
        if c in "'\"`":q=c;i+=1;continue
        if s.startswith('//',i) and (i==0 or s[i-1] not in ':\\'):
            j=s.find('\n',i);j=n if j<0 else j;out.append((start,i));start=j;i=j;continue
        if s.startswith('/*',i):
            j=s.find('*/',i+2);j=n if j<0 else j+2;out.append((start,i));start=j;i=j;continue
        i+=1
    out.append((start,n));return out
def runs(s,js=True):
    for a,b in segments(s,js):
        for m in RUN.finditer(s,a,b):
            t=m.group().rstrip()
            yield m.start(),m.start()+len(t),t
