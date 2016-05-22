'use strict';

const Pages = (function() {

const pages = [
  {
    text: 'history',
    url: 'chrome://history'
  },
  {
    text: 'bookmarks',
    url: 'chrome://bookmarks'
  },
  {
    text: 'settings',
    url: 'chrome://settings'
  },
  {
    text: 'extensions',
    url: 'chrome://extensions'
  },
  {
    text: 'inspect',
    url: 'chrome://inspect'
  },
];

function matchesQuery(queryParts, str) {
  const lowerCaseStr = str.toLowerCase();

  return queryParts.every(part => lowerCaseStr.indexOf(part) >= 0);
}

function getMatches(query) {
  if (!query) {
    return Promise.resolve([]);   
  }

  const queryParts = query.toLowerCase().split(' ');
  const matchingPages = pages.filter(p => matchesQuery(queryParts, p.text));

  return Promise.resolve(matchingPages);
}

return {
  getMatches: getMatches
};

})();
