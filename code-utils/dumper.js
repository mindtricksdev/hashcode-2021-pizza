const fs = require("fs");

const FOLDER = "out/";

const dumper = ({ file }, data, meta) => {
  const content = getContent(data);

  let outFile = file.replace(".in", ".out").replace(".txt", ".out");
  // outFile += "-score-" + score;

  if (meta.score > 0)
    console.log("%s \x1b[33m", " > Score", meta.score.toLocaleString());

  console.log(
    "\x1b[32m%s\x1b[0m",
    "-> Write " + outFile + " (" + (content.length / 1024).toFixed(2) + " KB)"
  );

  if (!fs.existsSync(FOLDER)) fs.mkdirSync(FOLDER);
  fs.writeFile(FOLDER + outFile, content, (err) => {
    if (err) throw err;
  });

  metaDumper(outFile, meta);
};

const getContent = (data) => {
  if (!data)
    throw "Output data not found. You should return the output in order to be dumped!";

  if (typeof data === "string") return data;
  if (data.length) {
    //lines as array
    let output = "";
    data.forEach((line) => {
      if (output) output += "\n";
      output += serializeLine(line);
    });
    return output;
  }

  throw "Unknown output data type";
};

const serializeLine = (line) => {
  if (typeof line === "string") return line;

  if (line.length === 0) throw "Empty line received";

  if (line.length) {
    //columns as array
    let output = "";
    line.forEach((col) => {
      if (output) output += " ";
      output += col;
    });
    return output;
  }

  throw "Unknown output data type row";
};

const META = "summary.json";
const metaDumper = (outFile, meta) => {
  let metaFile = {};
  if (fs.existsSync(FOLDER + META)) {
    try {
      metaFile = JSON.parse(fs.readFileSync(FOLDER + META, "utf8"));
    } catch (e) {}
  }

  metaFile[outFile] = meta;
  fs.writeFileSync(FOLDER + META, JSON.stringify(metaFile));
};

module.exports = dumper;
