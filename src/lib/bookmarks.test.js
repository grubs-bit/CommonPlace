import { describe, expect, it } from 'vitest';
import { addBookmark, removeBookmark } from './bookmarks';

describe('PDF bookmarks', () => {
  it('adds a page bookmark with a readable label', () => {
    const file = addBookmark({ bookmarks: [] }, 4);
    expect(file.bookmarks[0]).toMatchObject({ page: 4, label: 'Page 4' });
  });

  it('removes bookmarks by id', () => {
    const file = removeBookmark({ bookmarks: [{ id: 'a' }, { id: 'b' }] }, 'a');
    expect(file.bookmarks).toEqual([{ id: 'b' }]);
  });
});
