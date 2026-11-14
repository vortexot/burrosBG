"""Gera render/captions.js a partir de audio/transcript.json (timestamps por palavra)."""
import json, sys, os
base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
segs = json.load(open(os.path.join(base, 'audio', 'transcript.json')))
words = []
for s in segs:
    for w in s['words']:
        words.append({'w': w['w'].strip(), 's': round(w['s'], 3), 'e': round(w['e'], 3)})
# correções da transcrição automática
fix = {(40.78, 'deles'): 'dele', (44.0, 'a'): 'há'}
out = []
for w in words:
    k = (round(w['s'], 2), w['w'])
    if k in fix: w['w'] = fix[k]
    if w['w'].startswith('-') and out:
        out[-1]['w'] += w['w']; out[-1]['e'] = w['e']; continue
    out.append(w)
words = out
for w in words:
    if w['w'] in ('4', '7'):
        pass
caps, cur = [], []
def flush():
    if cur: caps.append(list(cur)); cur.clear()
for i, w in enumerate(words):
    cur.append(w)
    txt = ' '.join(x['w'] for x in cur)
    nxt = words[i + 1] if i + 1 < len(words) else None
    gap = (nxt['s'] - w['e']) if nxt else 9
    if w['w'][-1] in '.,?!' or len(cur) >= 4 or len(txt) > 19 or gap > 0.35:
        flush()
flush()
res = []
for i, ch in enumerate(caps):
    a = ch[0]['s'] - 0.05
    nxt = caps[i + 1][0]['s'] - 0.05 if i + 1 < len(caps) else ch[-1]['e'] + 0.6
    b = min(nxt, ch[-1]['e'] + 0.7)
    res.append({'a': round(a, 3), 'b': round(b, 3), 'words': [{'w': x['w'].upper(), 's': x['s']} for x in ch]})
js = 'const CAPS = ' + json.dumps(res, ensure_ascii=False) + ';\n'
open(os.path.join(base, 'render', 'captions.js'), 'w').write(js)
print(len(res), 'legendas')
for r in res[:8]: print(r['a'], r['b'], ' '.join(w['w'] for w in r['words']))
