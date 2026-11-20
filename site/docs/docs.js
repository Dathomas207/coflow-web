(() => {
  const directory = document.querySelector('.docs-directory');
  const mobile = window.matchMedia('(max-width:760px)');
  if (directory) {
    directory.open = !mobile.matches;
    mobile.addEventListener('change', () => { directory.open = !mobile.matches; });
  }
  const input = document.getElementById('docs-search');
  const results = document.getElementById('docs-search-results');
  if (!input || !results) return;
  let entries;
  let generation = 0;
  const index = () => entries || (entries = fetch('/docs/search-index.json').then(r => {
    if (!r.ok) throw new Error('Search unavailable');
    return r.json();
  }).catch(error => { entries = undefined; throw error; }));
  const message = (text) => {
    results.replaceChildren();
    const p = document.createElement('p'); p.textContent = text; results.append(p);
  };
  input.addEventListener('input', async () => {
    const current = ++generation;
    const query = input.value.trim().toLowerCase();
    if (!query) { results.hidden = true; results.replaceChildren(); return; }
    results.hidden = false;
    message('Searching guides…');
    try {
      const all = await index();
      if (current !== generation) return;
      const terms = query.split(/\s+/);
      const matches = all.filter(p => terms.every(t => `${p.title} ${p.description} ${p.text}`.toLowerCase().includes(t)))
        .sort((a,b) => Number(b.title.toLowerCase().includes(query)) - Number(a.title.toLowerCase().includes(query))).slice(0,8);
      results.replaceChildren();
      if (!matches.length) { message('No matching guides. Try “RLS”, “rules” or “MCP”.'); return; }
      matches.forEach(p => {
        const a = document.createElement('a'); a.href = p.url;
        const title = document.createElement('b'); title.textContent = p.title;
        const description = document.createElement('span'); description.textContent = p.description;
        a.append(title,description); results.append(a);
      });
    } catch (_) { if (current === generation) message('Search is unavailable. Browse the guides below.'); }
  });
  input.addEventListener('keydown', event => {
    if (event.key === 'Escape') { ++generation; results.hidden = true; input.value = ''; }
    if (event.key === 'ArrowDown') { const first = results.querySelector('a'); if (first) { event.preventDefault(); first.focus(); } }
  });
})();
