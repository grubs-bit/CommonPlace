const normalise = (value) => String(value || '').toLowerCase();

function includesQuery(values, query) {
  const q = normalise(query).trim();
  if (!q) return true;
  return values.some((value) => normalise(value).includes(q));
}

export function searchAll(data, query, filter = 'all') {
  const q = normalise(query).trim();
  if (!q) return [];

  const results = [];
  if (filter === 'all' || filter === 'notes') {
    for (const note of data.notes || []) {
      if (includesQuery([note.title, note.body, note.module, ...(note.tags || []), ...(note.topics || [])], q)) {
        results.push({ type: 'note', id: note.id, title: note.title, excerpt: snippet(note.body, q), item: note });
      }
    }
  }

  if (filter === 'all' || filter === 'ideas') {
    for (const idea of data.ideas || []) {
      if (includesQuery([idea.title, idea.summary, idea.body, idea.module, idea.status, ...(idea.tags || []), ...(idea.topics || [])], q)) {
        results.push({ type: 'idea', id: idea.id, title: idea.title, excerpt: snippet(`${idea.summary}\n${idea.body}`, q), item: idea });
      }
    }
  }

  if (filter === 'all' || filter === 'files') {
    for (const file of data.files || []) {
      if (includesQuery([file.title, file.description, file.module, file.type, file.searchableText, ...(file.tags || []), ...(file.topics || [])], q)) {
        results.push({ type: 'file', id: file.id, title: file.title, excerpt: snippet(file.searchableText || file.description || file.storedPath, q), item: file });
      }
    }
  }

  return results;
}

export function snippet(text = '', query = '') {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return 'No preview available';
  const lower = clean.toLowerCase();
  const idx = lower.indexOf(String(query || '').toLowerCase());
  if (idx === -1) return clean.slice(0, 150) + (clean.length > 150 ? '…' : '');
  const start = Math.max(0, idx - 55);
  const end = Math.min(clean.length, idx + 115);
  return `${start > 0 ? '…' : ''}${clean.slice(start, end)}${end < clean.length ? '…' : ''}`;
}
