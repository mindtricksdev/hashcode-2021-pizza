const renderInput = (env, input) => {
  input = input.split("\n").filter((r) => !!r);

  const firstLineStr = input.shift();
  const firstLine = parseIntLine(firstLineStr);
  const parsedInput = input.map((line) => parseIntLine(line));

  const [W, H, A, MP, T, S] = firstLine;
  const mountPoints = [];
  for (let idx = 0; idx < MP; idx++) {
    mountPoints.push({
      x: parsedInput[idx][0],
      y: parsedInput[idx][1],
    });
  }
  const tasks = [];
  for (let idx = MP; idx < MP + T * 2; idx += 2) {
    const [score, AP] = parsedInput[idx];
    const points = parsedInput[idx + 1];
    const assemblyPoints = [];
    for (let aIdx = 0; aIdx < AP * 2; aIdx += 2) {
      assemblyPoints.push({
        x: points[aIdx],
        y: points[aIdx + 1],
      });
    }

    tasks.push({
      score,
      assemblyPoints,
    });
  }

  //metadata
  renderInfo({
    Size: `${W} x ${H}`,
    Arms: A,
    MountingPoints: MP,
    Tasks: T,
    Steps: S,
    MaxScore: tasks.reduce((s, t) => s + t.score, 0),
  });

  //draw
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const maxW = $("#preview").width();
  const maxH = $("#preview").height();
  const MIN_SIZE = Math.min(maxW / W, maxH / H);
  const SIZE = MIN_SIZE * 4;
  canvas.style.transform = "scale(0.25)";
  canvas.width = SIZE * W;
  canvas.height = SIZE * H;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) {
      ctx.fillStyle = "transparent";
      if (mountPoints.find((mp) => mp.x === x && mp.y === y)) {
        ctx.fillStyle = "rgba(0,0,255,0.2)";
      }
      const cellTasksScores = tasks
        .filter((t) => t.assemblyPoints.find((ap) => ap.x === x && ap.y === y))
        .map((t) => t.score);
      if (cellTasksScores.length) {
        const cellScore = cellTasksScores.reduce((a, s) => a + s, 0);
        const opacity = Math.max(0.1, Math.min(1, cellScore / 5000));
        ctx.fillStyle = `rgba(0,255,0,${opacity})`;
      }

      if (ctx.fillStyle !== "transparent") {
        ctx.fillRect(x * SIZE, y * SIZE, SIZE, SIZE);
      }
    }
  }

  renderRulers(W, H);
  renderTimeline(S);
  return {
    W,
    H,
    A,
    MP,
    T,
    S,
    mountPoints,
    tasks,
    SIZE,
  };
};

const renderOutput = (env, input, output) => {
  const { A, T, SIZE } = renderInput(env, input);

  output = output.split("\n").filter((r) => !!r);
  const firstLineStr = output.shift();
  const firstLine = parseIntLine(firstLineStr);
  const parsedOutput = output.map((line) => parseIntLine(line));
  const [AU] = firstLine;

  //metadata
  renderInfo({
    Arms: A,
    ArmsUsed: AU,
    Tasks: T,
  });

  //draw
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  //the initial position
  const arms = [];
  for (let i = 0; i < parsedOutput.length; i += 3) {
    const armInfo = parsedOutput[i];
    const armMoves = parsedOutput[i + 2];
    const arm = {
      position: {
        x: armInfo[0],
        y: armInfo[1],
      },
      movements: armMoves,
    };
    arms.push(arm);
    ctx.fillStyle = "rgba(0,0,255,0.5)";
    ctx.fillRect(arm.position.x * SIZE, arm.position.y * SIZE, SIZE, SIZE);
  }

  if (env.params.time >= 0) {
    //cycle through
    for (let a = 0; a < arms.length; a++) {
      //skip drawing if arm contracts
      let movements = [];
      let timeMovements = arms[a].movements
        .filter((m, idx) => idx < env.params.time)
        .filter((m) => m !== "W");
      let stop = false;
      while (!stop) {
        stop = true;
        movements = [];
        for (let m = 0; m < timeMovements.length; m++) {
          const crtMove = timeMovements[m];
          const nextMove = timeMovements[m + 1];
          if (crtMove === "U" && nextMove === "D") {
            m++;
            stop = false;
          } else if (crtMove === "D" && nextMove === "U") {
            m++;
            stop = false;
          } else if (crtMove === "R" && nextMove === "L") {
            m++;
            stop = false;
          } else if (crtMove === "R" && nextMove === "L") {
            m++;
            stop = false;
          } else {
            movements.push(crtMove);
          }
        }
        timeMovements = movements;
      }
      //reinsert wait
      if (arms[a].movements[env.params.time - 1] === "W") movements.push("W");

      for (let t = 0; t < env.params.time; t++) {
        const crtPos = arms[a].position;
        const crtMove = movements[t];
        if (!crtMove) continue;

        if (["D", "U", "R", "L"].includes(crtMove)) {
          ctx.beginPath();
          ctx.moveTo(crtPos.x * SIZE + SIZE / 2, crtPos.y * SIZE + SIZE / 2);

          ctx.strokeStyle = "blue";
          ctx.lineWidth = Math.max(SIZE / 20, 4);

          if (crtMove === "D") {
            arms[a].position.y += 1;
          } else if (crtMove === "U") {
            arms[a].position.y -= 1;
          } else if (crtMove === "R") {
            arms[a].position.x += 1;
          } else if (crtMove === "L") {
            arms[a].position.x -= 1;
          }
          ctx.lineTo(crtPos.x * SIZE + SIZE / 2, crtPos.y * SIZE + SIZE / 2);
          ctx.stroke();
        } else {
          ctx.fillStyle = "rgba(128,0,0,0.5)";
          const MARKER = SIZE / 1.5;
          ctx.fillRect(
            crtPos.x * SIZE + SIZE / 2 - MARKER / 2,
            crtPos.y * SIZE + SIZE / 2 - MARKER / 2,
            MARKER,
            MARKER
          );
        }
      }
    }
  }
};

const parseIntLine = (lineStr) => {
  const values = lineStr.split(" ");

  return values.map((v) => {
    const intVal = parseInt(v, 10);
    if (isNaN(intVal)) return v;
    return intVal;
  });
};
