module.exports = {
  green: (green, ...rest) => {
    console.log("\x1b[30m\x1b[42m %s \x1b[0m %s", green, ...rest);
  },
  number: (number, ...rest) => {
    console.log(number.toLocaleString(), ...rest);
  },
  percent: (subUnitNumber, ...rest) => {
    const number = Math.floor(subUnitNumber * 10000) / 100 + "%";
    console.log(number, ...rest);
  },
};
