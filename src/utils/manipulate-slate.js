export function leftToRight(slate, check, lastScore = 0) {
  let flag = false;
  let score = lastScore;
  for (let i = 0; i < slate.length; i++) {
    for (let j = 0; j < slate[i].length - 1; j++) {
      if (slate[i][j] !== 0 && slate[i][j + 1] === 0) {
        if (check) {
          console.log("leftToRight");
          return true;
        }

        [slate[i][j + 1], slate[i][j]] = [slate[i][j], slate[i][j + 1]];
        flag = true;
      }

      if (slate[i][j] === slate[i][j + 1] && slate[i][j] !== 0) {
        if (check) {
          return true;
        }
        playSound("/audio/merge.mp3");
        score += slate[i][j] + slate[i][j + 1];
        slate[i][j + 1] = slate[i][j + 1] * 2;
        slate[i][j] = 0;
      }
    }
  }

  if (flag) {
    leftToRight(slate, false, score);
    return { slate: slate, score: score };
  } else if (!check) {
    printMatrix(slate);
    return addTwoRandomly(slate);
  }
}

export function rightToLeft(slate, check, lastScore = 0) {
  let flag = false;
  let score = lastScore;
  for (let i = 0; i < slate.length; i++) {
    for (let j = slate[i].length - 1; j > 0; j--) {
      if (slate[i][j] !== 0 && slate[i][j - 1] === 0) {
        if (check) {
          return true;
        }

        [slate[i][j - 1], slate[i][j]] = [slate[i][j], slate[i][j - 1]];
        flag = true;
      }

      if (slate[i][j] === slate[i][j - 1] && slate[i][j] !== 0) {
        if (check) {
          return true;
        }
        playSound("/audio/merge.mp3");
        score += slate[i][j] + slate[i][j - 1];
        slate[i][j - 1] = slate[i][j - 1] * 2;
        slate[i][j] = 0;
      }
    }
  }

  if (flag) {
    rightToLeft(slate, false, score);
    return { slate: slate, score: score };
  } else if (!check) {
    printMatrix(slate);
    return addTwoRandomly(slate);
  }
}

export function topToBottom(slate, check, lastScore = 0) {
  let flag = false;
  let score = lastScore;
  for (let i = 0; i < slate.length; i++) {
    for (let j = 0; j < slate.length - 1; j++) {
      if (slate[j][i] !== 0 && slate[j + 1][i] === 0) {
        if (check) {
          return true;
        }

        [slate[j + 1][i], slate[j][i]] = [slate[j][i], slate[j + 1][i]];
        flag = true;
      }

      if (slate[j][i] === slate[j + 1][i] && slate[j][i] !== 0) {
        if (check) {
          return true;
        }
        playSound("/audio/merge.mp3");
        score += slate[j][i] + slate[j + 1][i];
        slate[j + 1][i] = slate[j + 1][i] * 2;
        slate[j][i] = 0;
      }
    }
  }

  if (flag) {
    topToBottom(slate, false, score);
    return { slate: slate, score: score };
  } else if (!check) {
    printMatrix(slate);
    return addTwoRandomly(slate);
  }
}

export function bottomToTop(slate, check, lastScore = 0) {
  let flag = false;
  let score = lastScore;
  for (let i = 0; i < slate.length; i++) {
    for (let j = slate.length - 1; j > 0; j--) {
      if (slate[j][i] !== 0 && slate[j - 1][i] === 0) {
        if (check) {
          return true;
        }

        [slate[j - 1][i], slate[j][i]] = [slate[j][i], slate[j - 1][i]];
        flag = true;
      }

      if (slate[j][i] === slate[j - 1][i] && slate[j][i] !== 0) {
        if (check) {
          return true;
        }
        playSound("/audio/merge.mp3");
        score += slate[j][i] + slate[j - 1][i];
        slate[j - 1][i] = slate[j - 1][i] * 2;
        slate[j][i] = 0;
      }
    }
  }

  if (flag) {
    bottomToTop(slate, false, score);
    return { slate: slate, score: score };
  } else if (!check) {
    printMatrix(slate);
    return addTwoRandomly(slate);
  }
}

export function printMatrix(slate) {
  slate.forEach((row) => {
    console.log(row.join("  "));
  });
}

export function addTwoRandomly(slate) {
  let emptyPositions = [];
  for (let i = 0; i < slate.length; i++) {
    for (let j = 0; j < slate[i].length; j++) {
      if (slate[i][j] === 0) {
        emptyPositions.push([i, j]);
      }
    }
  }

  if (emptyPositions.length === 0) {
    return { slate: slate, score: 0 };
  }

  let randomIndex = Math.floor(Math.random() * emptyPositions.length);
  let [row, col] = emptyPositions[randomIndex];

  slate[row][col] = 2;

  return { slate: slate, score: 0 };
}

const playSound = (src) => {
  const audio = new Audio(src);
  audio.play();
};

export function checkIfThereIsAValidMoveLeft(slate) {
  if (
    leftToRight(slate, true) ||
    rightToLeft(slate, true) ||
    topToBottom(slate, true) ||
    bottomToTop(slate, true)
  ) {
    return false;
  } else {
    return true;
  }
}

export function isMoveValid(slate, direction) {
  if (direction == "left" && rightToLeft(slate, true)) {
    console.log("isMoveValid ~ rightToLeft:", rightToLeft(slate, true));
    return rightToLeft(slate);
  } else if (direction == "right" && leftToRight(slate, true)) {
    console.log("isMoveValid ~ leftToRight:", leftToRight(slate, true));
    return leftToRight(slate);
  } else if (direction == "up" && bottomToTop(slate, true)) {
    console.log("isMoveValid ~ bottomToTop:", bottomToTop(slate, true));
    return bottomToTop(slate);
  } else if (direction == "down" && topToBottom(slate, true)) {
    console.log("isMoveValid ~ topToBottom:", topToBottom(slate, true));
    return topToBottom(slate);
  } else {
    return { slate: slate, score: 0 };
  }
}
