exports.arrayOfIncrements = (n) => {
  const a = [];
  for (let i = 0; i < n; i++) {
    a.push(i);
  }
  return a;
};

exports.forN = (n, cb) => {
  for (let i = 0; i < n; i++) {
    cb(i);
  }
};

exports.arraysOf = (x, y, defaultValue) => {
  const grid = [];
  for (let i = 0; i < x; i++) {
    grid[i] = [];
    for (let j = 0; j < y; j++) {
      grid[i][j] = defaultValue;
      if (typeof defaultValue === "function") {
        grid[i][j] = defaultValue(i, j);
      }
    }
  }
  return grid;
};

Array.prototype.max = function () {
  return Math.max(...this);
};

Array.prototype.min = function () {
  return Math.min(...this);
};

Array.prototype.uniq = Array.prototype.unique = (() =>
  function () {
    return [...new Set(this)];
  })();

Array.prototype.contains = Array.prototype.includes;
Array.prototype.shuffle = function () {
  this.sort(() => 0.5 - Math.random());
  return this;
};
Array.prototype.shuffleRandomPart = function () {
  const a = this;
  let start = Math.floor(Math.random() * a.length);
  let end = Math.floor(Math.random() * a.length);
  if (start > end) {
    const left = a.slice(0, end).shuffle();
    const right = a.slice(start).shuffle();
    a.splice(0, left.length, ...left);
    a.splice(start, right.length, ...right);
    return a;
  }

  const slice = a.slice(start, end).shuffle();
  a.splice(start, slice.length, ...slice);
  return a;
};
Array.prototype.clone = function () {
  return this.slice(0);
};
Array.prototype.remove = function () {
  var what,
    a = arguments,
    L = a.length,
    ax;
  while (L && this.length) {
    what = a[--L];
    while ((ax = this.indexOf(what)) !== -1) {
      this.splice(ax, 1);
    }
  }
  return this;
};

Array.prototype.pickRandomIndex = function () {
  return Math.floor(Math.random() * this.length);
};

Array.prototype.pickRandom = function () {
  return this[this.pickRandomIndex()];
};
