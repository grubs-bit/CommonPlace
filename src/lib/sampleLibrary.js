const now = () => new Date().toISOString();

export function isLibraryEmpty(data) {
  return !(data.notes || []).length && !(data.ideas || []).length && !(data.files || []).length;
}

export function createSampleLibrary() {
  const stamp = now();
  return {
    version: 1,
    createdAt: stamp,
    updatedAt: stamp,
    tags: ['strategy', 'finance', 'research'],
    notes: [{
      id: 'sample_note_strategy',
      title: 'Sample note — Strategy reading',
      body: '# Strategy reading\n\nUse notes for lecture summaries, reading notes, and exam prep.\n\n- Key idea: competitive advantage\n- Useful for #strategy and #exam',
      tags: ['strategy'],
      topics: ['strategy', 'exam'],
      module: 'Sample Module',
      pinned: false,
      createdAt: stamp,
      updatedAt: stamp
    }],
    ideas: [{
      id: 'sample_idea_dissertation',
      title: 'Sample idea — Dissertation angle',
      summary: 'A place to grow rough project ideas into something useful.',
      body: '- Compare online and offline brand perception\n- Link to #strategy notes\n- Add sources later',
      tags: ['research'],
      topics: ['strategy', 'research'],
      module: 'Sample Module',
      status: 'Developing',
      pinned: false,
      createdAt: stamp,
      updatedAt: stamp
    }],
    files: [{
      id: 'sample_file_pdf',
      title: 'Sample imported PDF placeholder',
      type: 'pdf',
      extension: '.pdf',
      storedPath: '',
      originalPath: '',
      tags: ['reading'],
      topics: ['strategy'],
      module: 'Sample Module',
      description: 'Imported PDFs appear here. Real PDFs include extracted searchable text when possible.',
      searchableText: 'Sample searchable PDF text about strategy and research.',
      bookmarks: [{ id: 'sample_bookmark_page_1', page: 1, label: 'Start here' }],
      createdAt: stamp,
      updatedAt: stamp
    }]
  };
}
