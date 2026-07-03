import { describe, expect, it } from 'vitest';
import { buildTopicGraph, normaliseTopics } from './graph';

const data = {
  notes: [
    { id: 'n1', title: 'Marketing notes', topics: ['#Branding', 'consumer-behaviour'] },
    { id: 'n2', title: 'Finance notes', tags: ['wacc'], body: 'DCF basics #valuation #finance' }
  ],
  ideas: [
    { id: 'i1', title: 'Dissertation idea', topics: ['branding', '#gen-z'] }
  ],
  files: [
    { id: 'f1', title: 'Luxury PDF', topics: ['#branding', '#luxury'] }
  ]
};

describe('normaliseTopics', () => {
  it('accepts comma or hashtag text and returns lowercase hashtag topics', () => {
    expect(normaliseTopics('Branding, #Gen-Z consumer behaviour')).toEqual(['branding', 'gen-z', 'consumer', 'behaviour']);
  });
});

describe('buildTopicGraph', () => {
  it('creates item and topic bubbles', () => {
    const graph = buildTopicGraph(data);
    expect(graph.nodes.some((node) => node.id === 'topic:branding')).toBe(true);
    expect(graph.nodes.some((node) => node.id === 'note:n1')).toBe(true);
    expect(graph.links).toContainEqual({ source: 'note:n1', target: 'topic:branding' });
  });

  it('connects items that share a topic', () => {
    const graph = buildTopicGraph(data);
    expect(graph.links).toContainEqual({ source: 'note:n1', target: 'idea:i1' });
    expect(graph.links).toContainEqual({ source: 'note:n1', target: 'file:f1' });
  });
});
