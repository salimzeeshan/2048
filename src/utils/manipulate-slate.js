const cloneSlate = (slate) => slate.map((row) => [...row]);

const areSlatesEqual = (firstSlate, secondSlate) => {
  return firstSlate.every((row, rowIndex) => {
    return row.every((cell, colIndex) => cell === secondSlate[rowIndex][colIndex]);
  });
};

const getRandomTileValue = () => (Math.random() < 0.9 ? 2 : 4);

const mergeLineLeft = (line) => {
  const tiles = line.filter((tile) => tile !== 0);
  const mergedLine = [];
  let score = 0;

  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i] === tiles[i + 1]) {
      const mergedTile = tiles[i] * 2;
      mergedLine.push(mergedTile);
      score += mergedTile;
      i++;
    } else {
      mergedLine.push(tiles[i]);
    }
  }

  while (mergedLine.length < line.length) {
    mergedLine.push(0);
  }

  return { line: mergedLine, score };
};

const moveSlate = (slate, direction) => {
  const size = slate.length;
  const nextSlate = cloneSlate(slate);
  let score = 0;

  if (direction === "left" || direction === "right") {
    for (let rowIndex = 0; rowIndex < size; rowIndex++) {
      const row =
        direction === "left" ? nextSlate[rowIndex] : [...nextSlate[rowIndex]].reverse();
      const result = mergeLineLeft(row);

      nextSlate[rowIndex] =
        direction === "left" ? result.line : result.line.reverse();
      score += result.score;
    }
  }

  if (direction === "up" || direction === "down") {
    for (let colIndex = 0; colIndex < size; colIndex++) {
      const column = [];

      for (let rowIndex = 0; rowIndex < size; rowIndex++) {
        column.push(nextSlate[rowIndex][colIndex]);
      }

      const line = direction === "up" ? column : column.reverse();
      const result = mergeLineLeft(line);
      const mergedColumn =
        direction === "up" ? result.line : result.line.reverse();

      for (let rowIndex = 0; rowIndex < size; rowIndex++) {
        nextSlate[rowIndex][colIndex] = mergedColumn[rowIndex];
      }

      score += result.score;
    }
  }

  return { slate: nextSlate, score, moved: !areSlatesEqual(slate, nextSlate) };
};

export function leftToRight(slate, check = false) {
  const result = moveSlate(slate, "right");
  return check ? result.moved : addTwoRandomly(result.slate, result.score);
}

export function rightToLeft(slate, check = false) {
  const result = moveSlate(slate, "left");
  return check ? result.moved : addTwoRandomly(result.slate, result.score);
}

export function topToBottom(slate, check = false) {
  const result = moveSlate(slate, "down");
  return check ? result.moved : addTwoRandomly(result.slate, result.score);
}

export function bottomToTop(slate, check = false) {
  const result = moveSlate(slate, "up");
  return check ? result.moved : addTwoRandomly(result.slate, result.score);
}

export function printMatrix(slate) {
  slate.forEach((row) => {
    console.log(row.join("  "));
  });
}

export function addTwoRandomly(slate, score = 0) {
  const nextSlate = cloneSlate(slate);
  const emptyPositions = [];

  for (let i = 0; i < nextSlate.length; i++) {
    for (let j = 0; j < nextSlate[i].length; j++) {
      if (nextSlate[i][j] === 0) {
        emptyPositions.push([i, j]);
      }
    }
  }

  if (emptyPositions.length === 0) {
    return { slate: nextSlate, score };
  }

  const randomIndex = Math.floor(Math.random() * emptyPositions.length);
  const [row, col] = emptyPositions[randomIndex];

  nextSlate[row][col] = getRandomTileValue();

  return { slate: nextSlate, score };
}

export function checkIfThereIsAValidMoveLeft(slate) {
  return !["left", "right", "up", "down"].some((direction) => {
    return moveSlate(slate, direction).moved;
  });
}

export function isMoveValid(slate, direction) {
  const result = moveSlate(slate, direction);

  if (!result.moved) {
    return { slate: cloneSlate(slate), score: 0 };
  }

  return addTwoRandomly(result.slate, result.score);
}
