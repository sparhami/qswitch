'use strict';

const Bookmarks = (function() {

function queryBookmarks(query) {
  return new Promise(resolve => chrome.bookmarks.search(query, resolve));
}

function getMatches(query) {
  return queryBookmarks(query)
    .then(bookmarks => {
      return bookmarks.filter(bookmark => bookmark.url);
    });
}

return {
  getMatches: getMatches
};

})();
