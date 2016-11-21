'use strict';

(function() {

const idom = IncrementalDOM;
const patch = idom.patch;
const eo = idom.elementOpen;
const ec = idom.elementClose;
const ev = idom.elementVoid;
const txt = idom.text;

const container = document.body;
const data = {
  tabs: {},
  bookmarks: [],
  settings: [],
  pages: [],
  query: '',
  darkTheme: localStorage.darkTheme == "true"
};

function afterRender(cb) {
  requestAnimationFrame(() => setTimeout(cb));
}

function renderMatch(text, index, length) {
  const preText = text.substr(0, index);
  const matchText = text.substr(index, length);
  const postText = text.substr(index + length);

  txt(preText);
  eo('strong');
    txt(matchText);
  ec('strong');
  txt(postText);
}

function renderText(text, match) {
  const matchIndex = text.toLowerCase().indexOf(match.toLowerCase());

  if (matchIndex < 0) {
    renderMatch(text, text.length, 0);
  } else {
    renderMatch(text, matchIndex, match.length);
  }
}

function groupBy(arr, fn) {
  return arr.reduce((obj, item) => {
    const key = fn(item);
    obj[key] = obj[key] || [];
    obj[key].push(item);
    return obj;
  }, {});
}

function update(newData) {
  patch(container, render, Object.assign(data, newData));
}

function updateQuery(query) {
  Promise.all([
    Tabs.getMatches(query),
    Bookmarks.getMatches(query),
    Settings.getMatches(query),
    Pages.getMatches(query)
  ]).then(res => {
    return {
      tabs: res[0],
      bookmarks: res[1],
      settings: res[2],
      pages: res[3]
    };
  }).then(data => {
    const tabUrls = new Set(data.tabs.map(tab => tab.url));
    const bookmarks = data.bookmarks.filter(b => !tabUrls.has(b.url));
    const groupedTabs = groupBy(data.tabs, tab => tab.windowId); 

    return {
      tabs: groupedTabs,
      bookmarks: bookmarks,
      settings: data.settings,
      pages: data.pages,
      query: query
    };
  }).then(update);
}

function handleInput(e) {
  updateQuery(e.target.value.trim());
}

function handleTabAction() {
  const windowId = Number(this.dataset.windowId);
  const index = Number(this.dataset.index);
  Tabs.switchTo(windowId, index);
}

function handleUrlAction(e) {
  Tabs.open(this.dataset.url, e.ctrlKey);
}

function handleSettingAction() {
  switch(this.dataset.settingName) {
    case 'darkTheme':
      updateTheme(this.dataset.settingValue === 'true');
      break;
  }
}

function updateTheme(isDark) {
  update({ darkTheme: isDark });
  localStorage.darkTheme = isDark;
}

const searchboxAttrs = [
  'class', 'inputbox',
  'autofocus', '',
  'type', 'search',
  'placeholder', 'search',
  'role', 'combobox',
  'aria-autocomplete', 'list',
  'aria-owns', 'search-content',
  'aria-expanded', 'true',
  'oninput', handleInput
];

const itemAttrs = [
  'class', 'item',
  'role', 'option'
];

function render(data) {
  eo('div', null, null,
      'class', 'view-root',
      'dark-theme', data.darkTheme);
    eo('s-combobox', null, null,
        'class', 'search-combobox',
        'query', data.query);
      eo('div', null, null,
          'class', 'input-wrapper');
        ev('input', null, searchboxAttrs);
        ev('div', null, null,
            'class', 'input-line');
      ec('div');

      eo('div', null, null,
          'id', 'search-content',
          'class', 'search-content',
          'role', 'listbox');
        renderTabs(data.tabs, data.query);
        renderBookmarks(data.bookmarks, data.query);
        renderPages(data.pages, data.query);
        renderSettings(data.settings, data.query);
      ec('div');
    ec('s-combobox');
  ec('div');
}


function renderTabs(tabGroups, query) {
  eo('s-group', null, null,
      'class', 'suggestion-group',
      'label', 'Tabs');
    Object.keys(tabGroups).forEach((windowId) => {
      eo('s-group', null, null,
          'class', 'tab-group',
          'group-color', windowId % 10);
        tabGroups[windowId].forEach((tab) => {
          eo('div', null, itemAttrs,
              'data-index', tab.index,
              'data-window-id', tab.windowId,
              'onclick', handleTabAction);
            renderText(tab.title, query);
            eo('span', null, null,
                'class', 'item-url tab-url secondary-text',
                'title-matches', tab.matchesTitle);
              renderText(tab.url, query);
            ec('span');
          ec('div');
        });
      ec('s-group');
    });
  ec('s-group');
}

function renderBookmarks(bookmarks, query) {
  eo('s-group', null, null,
      'class', 'suggestion-group',
      'label', 'Bookmarks');
    bookmarks.forEach((bookmark) => {
      eo('div', null, itemAttrs,
          'data-url', bookmark.url,
          'onclick', handleUrlAction);
        renderText(bookmark.title, query);
        eo('span', null, null,
            'class', 'item-url secondary-text');
          renderText(bookmark.url, query);
        ec('span');
      ec('div');
    });
  ec('s-group');
}

function renderSettings(settings, query) {
  eo('s-group', null, null,
      'class', 'suggestion-group');
    settings.forEach((setting) => {
      eo('div', null, itemAttrs,
          'data-setting-name', setting.name,
          'data-setting-value', setting.value,
          'onclick', handleSettingAction);
        renderText(setting.text, query);
      ec('div');
    });
  ec('s-group');
}

function renderPages(pages, query) {
  eo('s-group', null, null,
      'class', 'suggestion-group');
    pages.forEach((page) => {
      eo('div', null, itemAttrs,
          'data-url', page.url,
          'onclick', handleUrlAction);
        renderText(page.text, query);
      ec('div');
    });
  ec('s-group');
}

update();
afterRender(() => updateQuery(''));

function loadScript(src) {
  if (document.head.querySelector('script[src="${src}"]')) {
    return;
  }

  const script = document.head.appendChild(document.createElement('script'));
  script.src = src;
}


window.addEventListener('load', () => {
  loadScript('components/s-combobox.js');
});

afterRender(() => {
  chrome.tabs.onActivated.addListener(() => {
    window.close();  
  });
});

})();

