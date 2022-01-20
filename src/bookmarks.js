async function getMatches(query) {
  const bookmarks = await chrome.bookmarks.search(query);

  return bookmarks.filter(bookmark => bookmark.url);
}

export {
  getMatches,
};
