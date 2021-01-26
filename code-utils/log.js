module.exports = {
  green: (green, ...rest) => {
    console.log("\x1b[30m\x1b[42m %s \x1b[0m %s", green, ...rest);
  }
};
