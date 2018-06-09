function afterRender(cb) {
  requestAnimationFrame(() => setTimeout(cb));
}

export {
  afterRender,
};
