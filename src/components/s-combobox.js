'use strict';

function attachCombobox(el) {
  let selectedIndex = -1;
  let selectedItem = null;

  el.addEventListener('keydown', handleKeydown);
  el.addEventListener('mouseover', handleHover);

  const mo = new MutationObserver(childrenUpdated);
  mo.observe(el, { childList: true, subtree: true });
  childrenUpdated();

  function getItems() {
    return [].slice.call(el.querySelectorAll('[role="option"]'));
  }

  function getInput() {
    return el.querySelector('[role="combobox"]');
  }

  function childrenUpdated() {
    setSelected(Number(el.getAttribute('initial-index')));
  }

  function navigate(delta) {
    setSelected(delta + selectedIndex);
  }

  function setSelected(index) {
    const items = getItems();
    const newIndex = Math.max(0, Math.min(index, items.length - 1));
    const selected = items[newIndex];

    selectedIndex = newIndex;
    selectedItem = selected;
    items.forEach(item => item.setAttribute('aria-selected', item === selected));

    if (selected) {
      selected.scrollIntoViewIfNeeded();
      selected.id = selected.id || 'opt' + selectedIndex;
      getInput().setAttribute('aria-activedescendant', selected.id);
    }
  }

  function handleEnter(e) {
    if (selectedItem) {
      selectedItem.dispatchEvent(new MouseEvent('click', {
        ctrlKey: e.ctrlKey
      }));
    }
  }

  function handleHover(e) {
    const item = e.target.closest('[role="option"]');

    if (item) {
      setSelected(getItems().indexOf(item));
    }
  }

  function handleKeydown(e) {
    switch (e.keyCode) {
      case 13:
        handleEnter(e);
        break;
      case 38:
      case 40:
        navigate(e.keyCode - 39);
        e.preventDefault();
        break;
      default:
        break;
    }
  }
}

document.registerElement('s-combobox', class extends HTMLElement {
  createdCallback() {
    attachCombobox(this);
  }
});
