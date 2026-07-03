export function markdownFileName(title = 'Untitled') {
  const safe = String(title || 'Untitled').replace(/[\\/:*?"<>|#]/g, ' ').replace(/\s+/g, ' ').trim() || 'Untitled';
  return `${safe}.md`;
}

function line(label, value) {
  if (value === undefined || value === null || value === '') return null;
  if (Array.isArray(value) && value.length === 0) return null;
  const formatted = Array.isArray(value) ? value.join(', ') : value;
  return `- ${label}: ${formatted}`;
}

export function exportItemToMarkdown(item, type) {
  const topics = (item.topics || []).map((topic) => topic.startsWith('#') ? topic : `#${topic}`);
  const meta = [
    line('Type', type),
    line('Status', item.status),
    line('Module', item.module),
    line('Tags', item.tags || []),
    line('Topics', topics),
    line('Created', item.createdAt),
    line('Updated', item.updatedAt)
  ].filter(Boolean).join('\n');
  const summary = item.summary ? `\n> ${item.summary}\n` : '';
  return `# ${item.title || 'Untitled'}\n\n${meta}\n${summary}\n---\n\n${item.body || item.description || ''}\n`;
}
