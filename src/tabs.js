function queryTabs(obj) {
  return new Promise(resolve => chrome.tabs.query(obj, resolve));
}

function matchesQuery(queryParts, str) {
  const lowerCaseStr = str.toLowerCase();

  return queryParts.every(part => lowerCaseStr.indexOf(part) >= 0);
}

/**
 * Get all tabs matching a query string in either their title or url.
 */
async function getMatches(query) {
  const queryParts = query.toLowerCase().split(' ');
  const tabs = await queryTabs({});

  return tabs
    .filter(tab => tab.url !== location.href)
    .map(tab => Object.assign({}, tab, {
      matchesTitle: matchesQuery(queryParts, tab.title),
      matchesUrl: matchesQuery(queryParts, tab.url)
    }))
    .filter(tab => tab.matchesTitle || tab.matchesUrl);
}

function switchTo(windowId, index) {
  chrome.tabs.highlight({
    windowId: windowId,
    tabs: index,
  });
  chrome.windows.update(windowId, { focused: true });
}

function open(url, inBackground) {
  chrome.tabs.create({
    url: url,
    active: !inBackground
  });
}

export {
  getMatches,
  switchTo,
  open,
};
