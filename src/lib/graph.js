export function normaliseTopics(value) {
  if (Array.isArray(value)) {
    return [...new Set(value.flatMap((entry) => normaliseTopics(entry)))];
  }
  return [...new Set(String(value || '')
    .replace(/#/g, ' ')
    .split(/[\s,]+/)
    .map((topic) => topic.trim().toLowerCase())
    .filter(Boolean)
    .map((topic) => topic.replace(/[^a-z0-9-]/g, ''))
    .filter(Boolean))];
}

function itemTopics(item) {
  const explicit = normaliseTopics(item.topics || []);
  const fromTags = normaliseTopics(item.tags || []);
  const fromText = normaliseTopics((`${item.title || ''} ${item.summary || ''} ${item.body || ''} ${item.description || ''}`).match(/#[\w-]+/g) || []);
  return [...new Set([...explicit, ...fromTags, ...fromText])];
}

function collectItems(data) {
  return [
    ...(data.notes || []).map((item) => ({ ...item, kind: 'note', graphId: `note:${item.id}` })),
    ...(data.ideas || []).map((item) => ({ ...item, kind: 'idea', graphId: `idea:${item.id}` })),
    ...(data.files || []).map((item) => ({ ...item, kind: 'file', graphId: `file:${item.id}` }))
  ].map((item) => ({ ...item, topics: itemTopics(item) })).filter((item) => item.topics.length > 0);
}

export function buildTopicGraph(data) {
  const items = collectItems(data);
  const topicMap = new Map();
  const links = [];

  for (const item of items) {
    for (const topic of item.topics) {
      if (!topicMap.has(topic)) topicMap.set(topic, []);
      topicMap.get(topic).push(item);
      links.push({ source: item.graphId, target: `topic:${topic}` });
    }
  }

  for (const relatedItems of topicMap.values()) {
    for (let i = 0; i < relatedItems.length; i += 1) {
      for (let j = i + 1; j < relatedItems.length; j += 1) {
        links.push({ source: relatedItems[i].graphId, target: relatedItems[j].graphId });
      }
    }
  }

  const topicNodes = [...topicMap.entries()].map(([topic, relatedItems], index) => ({
    id: `topic:${topic}`,
    label: `#${topic}`,
    kind: 'topic',
    size: 34 + Math.min(relatedItems.length * 8, 42),
    x: Math.cos(index * 1.7) * (180 + relatedItems.length * 15),
    y: Math.sin(index * 1.7) * 120,
    z: Math.sin(index * 0.9) * 70,
    count: relatedItems.length
  }));

  const itemNodes = items.map((item, index) => ({
    id: item.graphId,
    itemId: item.id,
    label: item.title,
    kind: item.kind,
    size: 20,
    x: Math.cos(index * 2.1) * 250,
    y: Math.sin(index * 2.1) * 155,
    z: Math.cos(index * 1.2) * 95,
    topics: item.topics
  }));

  return { nodes: [...topicNodes, ...itemNodes], links };
}
