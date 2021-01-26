let M, T2, T3, T4, PIZZAS;

const run = (firstLine, input, env) => {
  //parse
  [M, T2, T3, T4] = firstLine;

  PIZZAS = [];
  for (let idx = 0; idx < M; idx++) {
    input[idx].shift();
    PIZZAS.push(input[idx]);
  }

  //solve
  let T2P = [];
  let T3P = [];
  let T4P = [];

  const CONSUMED_PIZZAS = [];

  //seed
  const savedData = null; //env.storage.getItem("data" + env.set);
  if (savedData) {
    [T2P, T3P, T4P] = savedData;
  } else {
    const TXP = [null, null, T2P, T3P, T4P];
    [T2, T3, T4].forEach((teamsCount, sizeI) => {
      const size = sizeI + 2;
      for (let i = 0; i < teamsCount; i++) {
        if (CONSUMED_PIZZAS.length >= PIZZAS.length - size) {
          break;
        }
        const team = [];
        for (let p = 0; p < size; p++) {
          //find a free pizza to send
          let pizzaIdx = Math.floor(Math.random() * PIZZAS.length);
          while (CONSUMED_PIZZAS.contains(pizzaIdx)) {
            pizzaIdx = Math.floor(Math.random() * PIZZAS.length);
          }
          team.push(pizzaIdx);
          CONSUMED_PIZZAS.push(pizzaIdx);
        }
        TXP[size].push(...team);
      }
    });
  }

  //evolve
  let FINAL_T2P, FINAL_T3P, FINAL_T4P;
  let crtScore = scoreFn(T2P, T3P, T4P);
  console.log("score", crtScore);
  let i = 0;

  while (i < 100) {
    //swap
    const NEXT_T2P = T2P.clone().shuffleRandomPart();
    const NEXT_T3P = T3P.clone().shuffleRandomPart();
    const NEXT_T4P = T4P.clone().shuffleRandomPart();

    let newScore = scoreFn(NEXT_T2P, NEXT_T3P, NEXT_T4P);
    if (newScore > crtScore) {
      console.log("++ ", newScore);
      crtScore = newScore;
      FINAL_T2P = NEXT_T2P;
      FINAL_T3P = NEXT_T3P;
      FINAL_T4P = NEXT_T4P;
    }

    //re-use best solution
    T2P = FINAL_T2P || NEXT_T2P;
    T3P = FINAL_T3P || NEXT_T3P;
    T4P = FINAL_T4P || NEXT_T4P;

    i++;
  }

  i = 0;
  while (i < 10000) {
    if (i % 100 === 0) console.log("cross-shuffle", i);
    //cross-shuffle
    const pI2 = Math.floor(T2P.length * Math.random());
    const pI3 = Math.floor(T3P.length * Math.random());
    const pI4 = Math.floor(T4P.length * Math.random());
    const p2 = T2P[pI2];
    const p3 = T3P[pI3];
    const p4 = T4P[pI4];

    const NEXT_T2P = T2P.clone();
    const NEXT_T3P = T3P.clone();
    const NEXT_T4P = T4P.clone();
    if (Math.random() > 0.5) {
      NEXT_T2P[pI2] = p3;
      NEXT_T3P[pI3] = p4;
      NEXT_T4P[pI4] = p2;
    } else {
      NEXT_T2P[pI2] = p4;
      NEXT_T3P[pI3] = p2;
      NEXT_T4P[pI4] = p3;
    }

    let newScore = scoreFn(NEXT_T2P, NEXT_T3P, NEXT_T4P);
    if (newScore > crtScore) {
      console.log("++ ", newScore);
      crtScore = newScore;
      FINAL_T2P = NEXT_T2P;
      FINAL_T3P = NEXT_T3P;
      FINAL_T4P = NEXT_T4P;
    }

    //re-use best solution
    T2P = FINAL_T2P || NEXT_T2P;
    T3P = FINAL_T3P || NEXT_T3P;
    T4P = FINAL_T4P || NEXT_T4P;

    i++;
  }

  while (i < 100) {
    //swap
    const NEXT_T2P = T2P.clone().shuffleRandomPart();
    const NEXT_T3P = T3P.clone().shuffleRandomPart();
    const NEXT_T4P = T4P.clone().shuffleRandomPart();

    let newScore = scoreFn(NEXT_T2P, NEXT_T3P, NEXT_T4P);
    if (newScore > crtScore) {
      console.log("++ ", newScore);
      crtScore = newScore;
      FINAL_T2P = NEXT_T2P;
      FINAL_T3P = NEXT_T3P;
      FINAL_T4P = NEXT_T4P;
    }

    //re-use best solution
    T2P = FINAL_T2P || NEXT_T2P;
    T3P = FINAL_T3P || NEXT_T3P;
    T4P = FINAL_T4P || NEXT_T4P;

    i++;
  }

  //save result to local storage for later reuse
  env.storage.setItem("data" + env.set, [T2P, T3P, T4P]);

  //dump
  const result = [[T2P.length / 2 + T3P.length / 3 + T4P.length / 4]];
  [T2P, T3P, T4P].forEach((teamsP, sizeI) => {
    const size = sizeI + 2;

    const teams = [];
    let memberStart = 0;
    while (memberStart < teamsP.length) {
      const team = [];
      for (
        let memberIdx = memberStart;
        memberIdx < memberStart + size;
        memberIdx++
      ) {
        const memberPizza = teamsP[memberIdx];
        team.push(memberPizza);
      }
      teams.push(team);
      memberStart += team.length;
    }

    teams.forEach((t) => {
      result.push([size, ...t]);
    });
  });
  let score = scoreFn(T2P, T3P, T4P);

  return [result, { score }];
};

const scoreFn = (T2P, T3P, T4P) => {
  let score = 0;
  [T2P, T3P, T4P].forEach((teamsP, sizeI) => {
    const size = sizeI + 2;
    const teams = [];
    let memberStart = 0;
    while (memberStart < teamsP.length) {
      const team = [];
      for (
        let memberIdx = memberStart;
        memberIdx < memberStart + size;
        memberIdx++
      ) {
        const memberPizza = teamsP[memberIdx];
        team.push(memberPizza);
      }
      teams.push(team);
      memberStart += team.length;
    }

    teams.forEach((t) => {
      score +=
        t
          .map((p) => PIZZAS[p])
          .flat()
          .unique().length ** 2;
    });
  });
  return score;
};

module.exports = run;
