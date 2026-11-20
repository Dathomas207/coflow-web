"""Dependency-free integrity check for the static marketing site."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import re

ROOT = Path(__file__).resolve().parents[1] / 'site'

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.refs = [], []
        self.h1 = self.main = self.nav = 0
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a: self.ids.append(a['id'])
        if tag == 'h1': self.h1 += 1
        if tag == 'main': self.main += 1
        if tag == 'header' and a.get('class') == 'nav': self.nav += 1
        for key in ['href', 'src']:
            if a.get(key): self.refs.append(a[key])

errors = []
pages = list(ROOT.rglob('*.html'))
for path in pages:
    source = path.read_text()
    page = Page()
    page.feed(source)
    label = str(path.relative_to(ROOT))
    if 'http-equiv="refresh"' not in source:
        for name in ['h1', 'main', 'nav']:
            if getattr(page, name) != 1: errors.append(f'{label}: expected one {name}')
    if len(page.ids) != len(set(page.ids)): errors.append(f'{label}: duplicate IDs')
    for raw in page.refs:
        url = urlsplit(raw)
        if url.scheme or url.netloc: continue
        dest = ROOT / unquote(url.path.lstrip('/')) if url.path.startswith('/') else path.parent / unquote(url.path)
        if not url.path: dest = path
        if dest.is_dir(): dest /= 'index.html'
        if not dest.exists():
            errors.append(f'{label}: missing {raw}')
        elif url.fragment and dest.suffix == '.html':
            target = Page(); target.feed(dest.read_text())
            if url.fragment not in target.ids: errors.append(f'{label}: missing anchor {raw}')
    for data in re.findall(r'<script type="application/ld\+json">(.*?)</script>', source, re.S):
        try: json.loads(data)
        except ValueError: errors.append(f'{label}: invalid structured metadata')
print(f'Checked {len(pages)} pages: landmarks, IDs, links, assets, anchors and JSON-LD.')
if errors: print('\n'.join(errors)); raise SystemExit(1)
print('PASS')
