import numberToString from "@/constants/numberToString";
import { checkIfThereIsAValidMoveLeft } from "@/utils/manipulate-slate";
import React, { useCallback, useEffect, useRef, useState } from "react";

const GRID_SIZE = 4;
const SLIDE_DURATION_MS = 230;
const BEST_SCORE_STORAGE_KEY = "2048-best-score";
const createCleanSlate = () =>
  Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));

const playMergeSound = () => {
  const audio = new Audio("/audio/merge.mp3");
  audio.play().catch(() => {});
};

const createSlateFromTiles = (tiles) => {
  const nextSlate = createCleanSlate();

  tiles.forEach((tile) => {
    nextSlate[tile.row][tile.col] = tile.value;
  });

  return nextSlate;
};

const getEmptyPositions = (tiles) => {
  const occupiedPositions = new Set(
    tiles.map((tile) => `${tile.row}-${tile.col}`),
  );
  const emptyPositions = [];

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (!occupiedPositions.has(`${row}-${col}`)) {
        emptyPositions.push({ row, col });
      }
    }
  }

  return emptyPositions;
};

const getRandomItem = (items) =>
  items[Math.floor(Math.random() * items.length)];
const getRandomTileValue = () => (Math.random() < 0.9 ? 2 : 4);

const getLineCells = (direction, index) => {
  if (direction === "left") {
    return Array.from({ length: GRID_SIZE }, (_, col) => ({ row: index, col }));
  }

  if (direction === "right") {
    return Array.from({ length: GRID_SIZE }, (_, col) => ({
      row: index,
      col: GRID_SIZE - 1 - col,
    }));
  }

  if (direction === "up") {
    return Array.from({ length: GRID_SIZE }, (_, row) => ({ row, col: index }));
  }

  return Array.from({ length: GRID_SIZE }, (_, row) => ({
    row: GRID_SIZE - 1 - row,
    col: index,
  }));
};

const isTileInLine = (tile, direction, index) => {
  if (direction === "left" || direction === "right") {
    return tile.row === index;
  }

  return tile.col === index;
};

const getTileLinePosition = (tile, direction) => {
  if (direction === "left") return tile.col;
  if (direction === "right") return GRID_SIZE - 1 - tile.col;
  if (direction === "up") return tile.row;
  return GRID_SIZE - 1 - tile.row;
};

const moveTiles = (tiles, direction) => {
  const movedTiles = [];
  let moved = false;
  let score = 0;

  for (let lineIndex = 0; lineIndex < GRID_SIZE; lineIndex++) {
    const lineCells = getLineCells(direction, lineIndex);
    const lineTiles = tiles
      .filter((tile) => isTileInLine(tile, direction, lineIndex))
      .sort((firstTile, secondTile) => {
        return (
          getTileLinePosition(firstTile, direction) -
          getTileLinePosition(secondTile, direction)
        );
      });

    let targetIndex = 0;
    let mergeCandidate = null;

    lineTiles.forEach((tile) => {
      if (mergeCandidate && mergeCandidate.value === tile.value) {
        const targetCell = lineCells[targetIndex];
        const mergedValue = tile.value * 2;

        movedTiles[mergeCandidate.resultIndex] = {
          ...movedTiles[mergeCandidate.resultIndex],
          value: mergedValue,
          nextValue: mergedValue,
          isMerged: true,
        };
        movedTiles.push({
          ...tile,
          row: targetCell.row,
          col: targetCell.col,
          isNew: false,
          isMerged: false,
          removeAfterMove: true,
        });

        score += mergedValue;
        moved = true;
        mergeCandidate = null;
        targetIndex++;
        return;
      }

      if (mergeCandidate) {
        targetIndex++;
      }

      const targetCell = lineCells[targetIndex];
      const resultIndex = movedTiles.length;
      const movedTile = {
        ...tile,
        row: targetCell.row,
        col: targetCell.col,
        isNew: false,
        isMerged: false,
        removeAfterMove: false,
        nextValue: undefined,
      };

      if (tile.row !== targetCell.row || tile.col !== targetCell.col) {
        moved = true;
      }

      movedTiles.push(movedTile);
      mergeCandidate = { value: tile.value, resultIndex };
    });
  }

  return { tiles: movedTiles, score, moved };
};

const GameCard = () => {
  const [slate, setSlate] = useState(() => createCleanSlate());
  const [tiles, setTiles] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const currentScoreRef = useRef(0);
  const bestScoreRef = useRef(0);
  const slateRef = useRef(slate);
  const tilesRef = useRef(tiles);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const tileIdRef = useRef(1);
  const isAnimatingRef = useRef(false);

  const createTile = useCallback((row, col, value, isNew = true) => {
    const tile = {
      id: tileIdRef.current,
      value,
      row,
      col,
      isNew,
      isMerged: false,
    };

    tileIdRef.current++;
    return tile;
  }, []);

  const startDefaultSlate = useCallback(() => {
    isAnimatingRef.current = false;

    const firstPosition = getRandomItem(getEmptyPositions([]));
    const firstTile = createTile(firstPosition.row, firstPosition.col, 2);
    const secondPosition = getRandomItem(getEmptyPositions([firstTile]));
    const secondTile = createTile(secondPosition.row, secondPosition.col, 2);
    const nextTiles = [firstTile, secondTile];
    const nextSlate = createSlateFromTiles(nextTiles);

    tilesRef.current = nextTiles;
    slateRef.current = nextSlate;
    setTiles(nextTiles);
    setSlate(nextSlate);
  }, [createTile]);

  useEffect(() => {
    slateRef.current = slate;
    setIsGameOver(checkIfThereIsAValidMoveLeft(slate));
  }, [slate]);

  useEffect(() => {
    startDefaultSlate();
  }, [startDefaultSlate]);

  useEffect(() => {
    const savedBestScore = Number(
      window.localStorage.getItem(BEST_SCORE_STORAGE_KEY),
    );

    if (Number.isFinite(savedBestScore)) {
      bestScoreRef.current = savedBestScore;
      setBestScore(savedBestScore);
    }
  }, []);

  const updateScore = useCallback((scoreToAdd) => {
    const nextScore = currentScoreRef.current + scoreToAdd;

    currentScoreRef.current = nextScore;
    setCurrentScore(nextScore);

    if (nextScore > bestScoreRef.current) {
      bestScoreRef.current = nextScore;
      setBestScore(nextScore);
      window.localStorage.setItem(BEST_SCORE_STORAGE_KEY, String(nextScore));
    }
  }, []);

  const handleMove = useCallback(
    (direction) => {
      if (isAnimatingRef.current || isGameOver) {
        return;
      }

      const result = moveTiles(tilesRef.current, direction);

      if (!result.moved) {
        return;
      }

      isAnimatingRef.current = true;
      tilesRef.current = result.tiles;
      setTiles(result.tiles);

      if (result.score > 0) {
        updateScore(result.score);
        playMergeSound();
      }

      window.setTimeout(() => {
        const mergedTiles = result.tiles
        .filter((tile) => !tile.removeAfterMove)
        .map((tile) => {
          return {
            id: tile.id,
            value: tile.value,
            row: tile.row,
            col: tile.col,
            isNew: false,
            isMerged: false,
          };
        });
        const emptyPositions = getEmptyPositions(mergedTiles);
        const spawnPosition =
          emptyPositions.length > 0 ? getRandomItem(emptyPositions) : null;
        const spawnedTile = spawnPosition
          ? createTile(
              spawnPosition.row,
              spawnPosition.col,
              getRandomTileValue(),
            )
          : null;
        const nextTiles = spawnedTile
          ? [...mergedTiles, spawnedTile]
          : mergedTiles;
        const nextSlate = createSlateFromTiles(nextTiles);

        tilesRef.current = nextTiles;
        slateRef.current = nextSlate;
        setTiles(nextTiles);
        setSlate(nextSlate);
        isAnimatingRef.current = false;
      }, SLIDE_DURATION_MS);
    },
    [createTile, isGameOver, updateScore],
  );

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case "ArrowUp":
        case "w":
          handleMove("up");
          break;
        case "ArrowDown":
        case "s":
          handleMove("down");
          break;
        case "ArrowLeft":
        case "a":
          handleMove("left");
          break;
        case "ArrowRight":
        case "d":
          handleMove("right");
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleMove]);

  const handleTouchStart = (e) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e) => {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const dx = endX - touchStartRef.current.x;
    const dy = endY - touchStartRef.current.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) {
        handleMove("right");
      } else {
        handleMove("left");
      }
    } else if (Math.abs(dx) < Math.abs(dy)) {
      if (dy > 0) {
        handleMove("down");
      } else {
        handleMove("up");
      }
    }
  };

  return (
    <main
      className="main"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="score-container">
        <p className="score">Score: <strong>{currentScore}</strong></p>
        <p className="score">Best: <strong>{bestScore}</strong></p>
      </div>
      <div className="game-grid">
        {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => (
          <div key={index} className="grid-cell"></div>
        ))}
        <div className="tile-layer">
          {tiles.map((tile) => (
            <div
              key={tile.id}
              className={`tile ${tile.isNew ? "tile-new" : ""} ${
                tile.isMerged ? "tile-merged" : ""
              } ${tile.removeAfterMove ? "tile-removing" : ""}`}
              style={{
                transform: `translate(
                  calc(${tile.col} * (var(--tile-size) + var(--tile-gap))),
                  calc(${tile.row} * (var(--tile-size) + var(--tile-gap)))
                )`,
              }}
            >
              <div
                className={`game-item tile-face ${
                  numberToString[tile.value] || "tile-super"
                }`}
              >
                {tile.value}
              </div>
            </div>
          ))}
        </div>
      </div>
      {isGameOver ? (
        <p
          className="try-again"
          onClick={() => {
            currentScoreRef.current = 0;
            setCurrentScore(0);
            startDefaultSlate();
            setIsGameOver(false);
          }}
        >
          Try again
        </p>
      ) : null}
    </main>
  );
};

export default GameCard;
