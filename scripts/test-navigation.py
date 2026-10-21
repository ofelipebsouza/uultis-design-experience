from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json,re
root=Path(__file__).resolve().parents[1];dist=root/'dist';config=json.loads((root/'vercel.json').read_text());routes={x['source'] for x in config.get('rewrites',[])};bad=[];count=0
old={'uultis.com','www.uultis.com','uultisusa.com','www.uultisusa.com','usa.uultis.com'}
class Links(HTMLParser):
 def __init__(self,file):super().__init__();self.file=file
 def handle_starttag(self,tag,attrs):
  global count
  a=dict(attrs)
  for key in ['href','src']:
   if key not in a:continue
   u=urlsplit(a[key]);count+=1
   if u.hostname in old:bad.append((str(self.file),'old domain',a[key]))
   if u.scheme or u.netloc or not u.path:continue
   path=unquote(u.path)
   if path in routes:continue
   file=dist/path.lstrip('/') if path.startswith('/') else self.file.parent/path
   if file.is_dir():file=file/'index.html'
   if not file.exists():bad.append((str(self.file),'missing file',a[key]))
for file in dist.rglob('*.html'):
 p=Links(file);p.feed(file.read_text())
catalog=json.loads((dist/'assets/catalog.json').read_text());assert len(catalog)==213
for p in catalog:
 assert p['url']==f'/#product/{p["id"]}'
 if p.get('designer_url'):assert (dist/p['designer_url'].strip('/')/'index.html').exists(),p['designer_url']
 for t in p.get('tags',[]):assert (dist/t['url'].strip('/')/'index.html').exists(),t['url']
 for resource in p.get('specs',[]):
  assert urlsplit(resource['url']).hostname not in old
  if resource.get('file_url'):assert resource['file_url'] in routes or (dist/resource['file_url'].lstrip('/')).is_file()
  if resource['url'].startswith('/technical-sheets/'):assert 'product='+p['id'] in resource['url']
js=(dist/'assets/catalog.js').read_text();assert json.loads(js.split('=',1)[1].strip().removesuffix(';'))==catalog
assert not bad,bad
print(f'PASS: {count} static references, 213 products, {len(routes)} same-domain document routes, designer and collection destinations; no old-domain navigation.')
