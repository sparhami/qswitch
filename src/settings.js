'use strict';

const Settings = (function() {

const settings = [
  {
    text: 'set dark theme',
    name: 'darkTheme',
    value: 'true'
  },
  {
    text: 'set light theme',
    name: 'darkTheme',
    value: 'false'
  }
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
  const matchingSettings = settings.filter(s => matchesQuery(queryParts, s.text));

  return Promise.resolve(matchingSettings);
}

return {
  getMatches: getMatches
};

})();
