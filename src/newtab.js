import * as Bookmarks from './bookmarks.js';
import * as Pages from './pages.js';
import * as Sessions from './sessions.js';
import * as Tabs from './tabs.js';
import {afterRender} from './lib/after_render.js';
import {groupBy} from './lib/collect.js';
import { lazyContent } from './lazy-content.js';
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
  pages: [],
  query: '',
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
  const [ tabs, sessions, bookmarks, pages ] = await Promise.all([
    Tabs.getMatches(query),
    Sessions.getMatches(query),
    Bookmarks.getMatches(query),
    Pages.getMatches(query)
  ]);
  
  const tabUrls = new Set(tabs.map(tab => tab.url));
  const filteredBookmarks = bookmarks.filter(b => !tabUrls.has(b.url));
  const groupedTabs = groupBy(tabs, tab => tab.windowId); 

  update({
    tabs: groupedTabs,
    sessions,
    bookmarks: filteredBookmarks,
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

const searchboxAttrs = [
  'class', 'inputbox',
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
      'class', 'view-root');
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
      ec('div');
    ec('s-combobox');
  ec('div');
}

function renderTabs(tabGroups, query) {
  const keys = Object.keys(tabGroups);

  if (!keys.length) {
    return;
  }

  eo('s-group', null, null,
      'has-nested-groups', true);
    suggestionsLabel('Tabs');
    keys.forEach((windowId) => {
      eo('s-group', null, null,
          'class', 'tab-group',
          'group-color', windowId % 10);
        tabGroups[windowId].forEach((tab) => {
          renderLocalTab(tab, query);
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

  eo('s-group', null, null,
      'has-nested-groups', true);
    suggestionsLabel('Sessions');
    keys.forEach((index) => {
      eo('s-group', null, null,
          'class', 'tab-group',
          'group-color', index % 10);
        sessions[index].forEach((tab) => {
          renderSessionTab(tab, query);
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
      renderBookmark(bookmark, query);
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
      renderPage(page, query);
    });
  ec('s-group');
}

function renderLocalTab(tab, query) {
  eo('div', null, itemAttrs,
      'data-index', tab.index,
      'data-window-id', tab.windowId,
      'data-has-group', !!tab.group,
      'style', {
        "--group-color": tab.group?.color || "",
      },
      'onclick', handleTabAction);
    lazyContent(() => {
      renderText(tab.title, query);
      eo('span', null, null,
          'class', 'item-url tab-url secondary-text',
          'title-matches', tab.matchesTitle);
        renderText(tab.url, query);
      ec('span');
    });
  ec('div');
}

function renderSessionTab(tab, query) {
  eo('div', null, itemAttrs,
      'data-url', tab.url,
      'onclick', handleUrlAction);
    lazyContent(() => {
      renderText(tab.title, query);
      eo('span', null, null,
          'class', 'item-url tab-url secondary-text',
          'title-matches', tab.matchesTitle);
        renderText(tab.url, query);
      ec('span');
    });
  ec('div');
}

function renderBookmark(bookmark, query) {
  eo('div', null, itemAttrs,
      'data-url', bookmark.url,
      'onclick', handleUrlAction);
    lazyContent(() => {
      renderText(bookmark.title, query);
      eo('span', null, null,
          'class', 'item-url secondary-text');
        renderText(bookmark.url, query);
      ec('span');
    });
  ec('div');
}

function renderPage(page, query) {
  eo('div', null, itemAttrs,
      'data-url', page.url,
      'onclick', handleUrlAction);
    renderText(page.text, query);
  ec('div');
}


update();
// Autofocus does not work
document.querySelector('.inputbox').focus();
afterRender(() => updateQuery(''));
afterRender(() => {
  chrome.tabs.onActivated.addListener(() => {
    window.close();  
  });
});

