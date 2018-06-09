import * as Bookmarks from './bookmarks.js';
import * as Pages from './pages.js';
import * as Sessions from './sessions.js';
import * as Settings from './settings.js';
import * as Tabs from './tabs.js';
import {afterRender} from './lib/after_render.js';
import {groupBy} from './lib/collect.js';
import './components/s-combobox.js';

const {
  patch,
  elementOpen: eo,
  elementClose: ec,
  elementVoid: ev,
  text: txt,
} = IncrementalDOM; 

const container = document.body;
const data = {
  tabs: {},
  sessions: {},
  bookmarks: [],
  settings: [],
  pages: [],
  query: '',
  darkTheme: localStorage.darkTheme == "true"
};

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

function update(newData) {
  patch(container, render, Object.assign(data, newData));
}

async function updateQuery(query) {
  const [ tabs, sessions, bookmarks, settings, pages ] = await Promise.all([
    Tabs.getMatches(query),
    Sessions.getMatches(query),
    Bookmarks.getMatches(query),
    Settings.getMatches(query),
    Pages.getMatches(query)
  ]);
  
  const tabUrls = new Set(tabs.map(tab => tab.url));
  const filteredBookmarks = bookmarks.filter(b => !tabUrls.has(b.url));
  const groupedTabs = groupBy(tabs, tab => tab.windowId); 

  update({
    tabs: groupedTabs,
    sessions,
    bookmarks: filteredBookmarks,
    settings,
    pages,
    query,
  });
}

function handleInput(e) {
  updateQuery(this.value.trim());
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

function suggestionsLabel(label) {
  eo('div', null, null,
      'class', 'suggestion-group-label theme-bg')
    txt(label);
  ec('div');
}

function render(data) {
  eo('div', null, null,
      'class', 'view-root',
      'dark-theme', data.darkTheme);
    eo('s-combobox', null, null,
        'class', 'search-combobox theme-bg',
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
        renderSessions(data.sessions, data.query);
        renderPages(data.pages, data.query);
        renderSettings(data.settings, data.query);
      ec('div');
    ec('s-combobox');
  ec('div');
}

function renderTabs(tabGroups, query) {
  const keys = Object.keys(tabGroups);

  if (!keys.length) {
    return;
  }

  eo('s-group');
    suggestionsLabel('Tabs');
    keys.forEach((windowId) => {
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

function renderSessions(sessions, query) {
  const keys = Object.keys(sessions);

  if (!keys.length) {
    return;
  }

  eo('s-group');
    suggestionsLabel('Sessions');
    keys.forEach((index) => {
      eo('s-group', null, null,
          'class', 'tab-group',
          'group-color', index % 10);
        sessions[index].forEach((tab) => {
          eo('div', null, itemAttrs,
              'data-url', tab.url,
              'onclick', handleUrlAction);
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
  if (!bookmarks.length) {
    return;
  }

  eo('s-group');
    suggestionsLabel('Bookmarks');
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
  if (!settings.length) {
    return;
  }

  eo('s-group');
    suggestionsLabel('Settings');
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
  if (!pages.length) {
    return;
  }

  eo('s-group');
    suggestionsLabel('Chrome');
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
afterRender(() => {
  chrome.tabs.onActivated.addListener(() => {
    window.close();  
  });
});

