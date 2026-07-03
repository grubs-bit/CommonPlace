import { describe, expect, it } from 'vitest';
import { createSampleLibrary, isLibraryEmpty } from './sampleLibrary';

describe('sample library', () => {
  it('detects an empty library', () => {
    expect(isLibraryEmpty({ notes: [], ideas: [], files: [] })).toBe(true);
    expect(isLibraryEmpty({ notes: [{ id: 'n1' }], ideas: [], files: [] })).toBe(false);
  });

  it('creates notes, ideas, files, and topics for onboarding', () => {
    const sample = createSampleLibrary();
    expect(sample.notes.length).toBeGreaterThan(0);
    expect(sample.ideas.length).toBeGreaterThan(0);
    expect(sample.files.length).toBeGreaterThan(0);
    expect(sample.notes[0].topics.length).toBeGreaterThan(0);
  });
});
