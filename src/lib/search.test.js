import { describe, expect, it } from 'vitest';
import { searchAll } from './search';

const data = {
  notes: [
    { id: 'n1', title: 'Marketing Week 3', body: 'Brand equity and Keller model', tags: ['marketing'], module: 'BUS300' }
  ],
  ideas: [
    { id: 'i1', title: 'Dissertation concept', summary: 'Luxury branding among Gen Z', body: 'Compare TikTok and print campaigns', tags: ['research'], status: 'Raw' }
  ],
  files: [
    { id: 'f1', title: 'Finance Lecture.pdf', description: '', searchableText: 'Discounted cash flow and WACC', tags: ['finance'], module: 'FIN200' }
  ]
};

describe('searchAll', () => {
  it('searches note bodies', () => {
    expect(searchAll(data, 'keller')).toMatchObject([{ type: 'note', id: 'n1' }]);
  });

  it('searches idea titles and summaries', () => {
    expect(searchAll(data, 'luxury')).toMatchObject([{ type: 'idea', id: 'i1' }]);
  });

  it('searches imported file text', () => {
    expect(searchAll(data, 'wacc')).toMatchObject([{ type: 'file', id: 'f1' }]);
  });

  it('can filter by result type', () => {
    expect(searchAll(data, 'brand', 'notes')).toHaveLength(1);
    expect(searchAll(data, 'brand', 'files')).toHaveLength(0);
  });
});
