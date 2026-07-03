export const emptyData = () => ({
  version: 1,
  notes: [],
  ideas: [],
  files: [],
  tags: []
});

export function uid(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function createNote() {
  const now = new Date().toISOString();
  return {
    id: uid('note'),
    title: 'Untitled note',
    body: '# Untitled note\n\nStart writing...',
    tags: [],
    topics: [],
    module: '',
    pinned: false,
    createdAt: now,
    updatedAt: now
  };
}

export function createIdea() {
  const now = new Date().toISOString();
  return {
    id: uid('idea'),
    title: 'New idea',
    summary: '',
    body: '- First thought\n- Next step',
    tags: [],
    topics: [],
    module: '',
    status: 'Raw',
    pinned: false,
    createdAt: now,
    updatedAt: now
  };
}

export function parseTags(value) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function formatTags(tags = []) {
  return tags.join(', ');
}

export function touch(item) {
  return { ...item, updatedAt: new Date().toISOString() };
}
