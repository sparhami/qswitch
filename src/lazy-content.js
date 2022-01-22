const {
  patchInner,
  currentElement
} = IncrementalDOM; 

const pending = [];
const contentRenderers = new WeakMap();
const io = new IntersectionObserver((entries) => {
  entries
    .filter((entry) => entry.isIntersecting)
    .forEach(({target}) => {
      patchInner(target, contentRenderers.get(target));
      io.unobserve(target);
    });
});

function aboveViewportBottom(el) {
  const viewportBox = document.body.getBoundingClientRect();
  const elementBox = el.getBoundingClientRect();

  return elementBox.bottom < viewportBox.bottom;
}

function addPending(element, content) {
  pending.push([element, content]);

  if (pending.length > 1) {
    return;
  }

  requestAnimationFrame(() => {
    pending
      .splice(0, pending.length)
      .map(([el, content]) => {
        return [
          el, content, aboveViewportBottom(el)
        ];
      })
      .forEach(([el, content, immediate]) => {
        if (immediate) {
          patchInner(el, content);
        } else {
          contentRenderers.set(el, content);
          io.observe(el);
        }
      });
  });
}

function lazyContent(content) {
  addPending(currentElement(), content);
}

export {
  lazyContent,
};