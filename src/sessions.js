'use strict';

const Sessions = (function() {

function querySessions(obj) {
  return new Promise(resolve => chrome.sessions.getDevices(obj, resolve));
}

function matchesQuery(queryParts, str) {
  const lowerCaseStr = str.toLowerCase();

  return queryParts.every(part => lowerCaseStr.indexOf(part) >= 0);
}

/**
 * Get all remote sessions and their tabs matching a query string in either
 * their title or url.
 */
async function getMatches(query) {
  const queryParts = query.toLowerCase().split(' ');
  const devices = await querySessions({});

  return devices
    .map(device => device.sessions)
    .map(sessions => {
      return sessions
        .map(session => session.window.tabs)
        .reduce((p, c) => p.concat(c));
    })
    .map(tabs => {
      return tabs
        .map(tab => Object.assign({}, tab, {
          matchesTitle: matchesQuery(queryParts, tab.title),
          matchesUrl: matchesQuery(queryParts, tab.url)
        }))
        .filter(tab => tab.matchesTitle || tab.matchesUrl);
    })
    .filter(tabs => tabs.length);
}

return {
  getMatches,
};

})();
