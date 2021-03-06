// Place input data into `/in/` folder
//  The sets should start with 'a', 'b', 'c', 'd', 'e'.
// Give the processing function as an argument to `run`
//  The returned value should be a list that will be dumped into `/out/` folder.

const parser = require("./parser");
const dumper = require("./dumper");
const array = require("./array");
const log = require("./log");
const LocalStorage = require("./storage");
const storage = new LocalStorage("./out/storage.json", {
  strict: false,
  ws: "  ",
});

const run = (solver) => {
  let arg = process.argv[2];
  if (!arg) arg = "a,b,c,d,e,f";

  const sets = arg.split(",");

  parser(sets, ({ set, file }, firstLine, input) => {
    const start = Date.now();
    console.log("\x1b[3m%s\x1b[0m", " > Solving " + set + "...");

    const env = {
      sets,
      set,
      file,
      array,
      log,
      storage,
      return: (output, meta) => {
        dumper(env, output, meta);
      },
    };

    const [output, meta] = solver(firstLine, input, env);
    const end = Date.now();
    console.log(
      "\x1b[3m%s\x1b[0m",
      " > Finished " + set + ". Took " + ((end - start) / 1000).toFixed(2) + "s"
    );

    env.return(output, meta);
  });
};

module.exports = run;
