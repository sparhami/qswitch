function groupBy(arr, fn) {
  return arr.reduce((obj, item) => {
    const key = fn(item);
    obj[key] = obj[key] || [];
    obj[key].push(item);
    return obj;
  }, {});
}

export {
  groupBy,
};
