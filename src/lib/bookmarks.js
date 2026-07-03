export function addBookmark(file, page, label = `Page ${page}`) {
  const bookmark = {
    id: `bookmark_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    page: Math.max(1, Number(page) || 1),
    label
  };
  return { ...file, bookmarks: [...(file.bookmarks || []), bookmark] };
}

export function removeBookmark(file, bookmarkId) {
  return { ...file, bookmarks: (file.bookmarks || []).filter((bookmark) => bookmark.id !== bookmarkId) };
}
