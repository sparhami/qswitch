'use strict';

const Bookmarks = (function() {

function queryBookmarks(query) {
  return new Promise(resolve => chrome.bookmarks.search(query, resolve));
}

async function getMatches(query) {
  const bookmarks = await queryBookmarks(query);

  return bookmarks.filter(bookmark => bookmark.url);
}

return {
  getMatches,
};

})();
