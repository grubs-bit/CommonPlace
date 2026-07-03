import { describe, expect, it } from 'vitest';
import { exportItemToMarkdown, markdownFileName } from './export';

describe('markdown export helpers', () => {
  it('exports notes with title, metadata, and body', () => {
    const md = exportItemToMarkdown({ title: 'Week 1', module: 'BUS101', tags: ['exam'], topics: ['strategy'], body: 'Core notes' }, 'note');
    expect(md).toContain('# Week 1');
    expect(md).toContain('Type: note');
    expect(md).toContain('Module: BUS101');
    expect(md).toContain('Tags: exam');
    expect(md).toContain('Topics: #strategy');
    expect(md).toContain('Core notes');
  });

  it('exports ideas with summary and status', () => {
    const md = exportItemToMarkdown({ title: 'Essay angle', summary: 'Compare brands', status: 'Developing', body: 'Draft detail' }, 'idea');
    expect(md).toContain('Status: Developing');
    expect(md).toContain('> Compare brands');
  });

  it('creates safe markdown filenames', () => {
    expect(markdownFileName('Week 1: Strategy/Markets')).toBe('Week 1 Strategy Markets.md');
  });
});
