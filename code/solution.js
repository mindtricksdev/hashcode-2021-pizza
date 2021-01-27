let M, T2, T3, T4, PIZZAS;

const run = async (firstLine, input, env) => {
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

  let CONSUMED_PIZZAS = [],
    UNCONSUMED_PIZZAS;
  UNCONSUMED_PIZZAS = PIZZAS.map((p, i) => i);

  //seed
  const TXP = [null, null, T2P, T3P, T4P];
  [T2, T3, T4].forEach((teamsCount, sizeI) => {
    const size = sizeI + 2;
    for (let i = 0; i < teamsCount; i++) {
      if (UNCONSUMED_PIZZAS.length < size) {
        break;
      }
      const team = [];
      for (let p = 0; p < size; p++) {
        let pizzaIdx = UNCONSUMED_PIZZAS.pickRandom();
        team.push(pizzaIdx);
        CONSUMED_PIZZAS.push(pizzaIdx);
        UNCONSUMED_PIZZAS.remove(pizzaIdx);
      }
      TXP[size].push(...team);
    }
  });

  //evolve
  let FINAL_T2P,
    FINAL_T3P,
    FINAL_T4P,
    LAST_CONSUMED_PIZZAS,
    LAST_UNCONSUMED_PIZZAS;
  let crtScore = scoreFn(T2P, T3P, T4P);
  env.log.number(crtScore);
  let i = 0;

  while (i < 50) {
    //swap
    const NEXT_T2P = T2P.clone().shuffleRandomPart();
    const NEXT_T3P = T3P.clone().shuffleRandomPart();
    const NEXT_T4P = T4P.clone().shuffleRandomPart();

    let newScore = scoreFn(NEXT_T2P, NEXT_T3P, NEXT_T4P);
    if (newScore > crtScore) {
      env.log.number(newScore);
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
  const ITERATIONS = 100000;
  while (i < ITERATIONS) {
    if (i % 100 === 0) env.log.percent(i / ITERATIONS, "cross-shuffle");

    //cross-shuffle
    const pI2 = Math.floor(T2P.length * Math.random());
    const pI3 = Math.floor(T3P.length * Math.random());
    const pI4 = Math.floor(T4P.length * Math.random());
    let p2 = T2P[pI2];
    let p3 = T3P[pI3];
    let p4 = T4P[pI4];

    if (UNCONSUMED_PIZZAS.length > 0) {
      //try unconsumed pizzas
      let pizzaIdx = UNCONSUMED_PIZZAS.pickRandom();
      LAST_CONSUMED_PIZZAS = CONSUMED_PIZZAS.clone();
      LAST_UNCONSUMED_PIZZAS = UNCONSUMED_PIZZAS.clone();
      if (Math.random() < 0.3) {
        CONSUMED_PIZZAS.remove(p2);
        UNCONSUMED_PIZZAS.push(p2);
        p2 = pizzaIdx;
      } else if (Math.random() < 0.3) {
        CONSUMED_PIZZAS.remove(p3);
        UNCONSUMED_PIZZAS.push(p3);
        p3 = pizzaIdx;
      } else {
        CONSUMED_PIZZAS.remove(p4);
        UNCONSUMED_PIZZAS.push(p4);
        p4 = pizzaIdx;
      }

      CONSUMED_PIZZAS.push(pizzaIdx);
      UNCONSUMED_PIZZAS.remove(pizzaIdx);
    }

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
      env.log.number(newScore);
      crtScore = newScore;
      FINAL_T2P = NEXT_T2P;
      FINAL_T3P = NEXT_T3P;
      FINAL_T4P = NEXT_T4P;
    } else {
      //restore consumed pizzas
      CONSUMED_PIZZAS = LAST_CONSUMED_PIZZAS;
      UNCONSUMED_PIZZAS = LAST_UNCONSUMED_PIZZAS;
    }

    //re-use best solution
    T2P = FINAL_T2P || NEXT_T2P;
    T3P = FINAL_T3P || NEXT_T3P;
    T4P = FINAL_T4P || NEXT_T4P;

    i++;
  }

  while (i < 50) {
    //swap
    const NEXT_T2P = T2P.clone().shuffleRandomPart();
    const NEXT_T3P = T3P.clone().shuffleRandomPart();
    const NEXT_T4P = T4P.clone().shuffleRandomPart();

    let newScore = scoreFn(NEXT_T2P, NEXT_T3P, NEXT_T4P);
    if (newScore > crtScore) {
      env.log.number(newScore);
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
