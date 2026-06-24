import numberToString from "@/constants/numberToString";
import { checkIfThereIsAValidMoveLeft, isMoveValid } from "@/utils/manipulate-slate";
import React, { useCallback, useEffect, useRef, useState } from "react";

const createCleanSlate = () => Array.from({ length: 4 }, () => Array(4).fill(0));

const playMergeSound = () => {
  const audio = new Audio("/audio/merge.mp3");
  audio.play().catch(() => {});
};

const GameCard = () => {
  const [slate, setSlate] = useState(() => createCleanSlate());
  const [isGameOver, setIsGameOver] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const slateRef = useRef(slate);
  const touchStartRef = useRef({ x: 0, y: 0 });

  const startDefaultSlate = useCallback(() => {
    const nextSlate = createCleanSlate();
    const rows = nextSlate.length;
    const cols = nextSlate[0].length;

    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    let row1 = getRandomInt(0, rows - 1);
    let col1 = getRandomInt(0, cols - 1);

    let row2, col2;
    do {
      row2 = getRandomInt(0, rows - 1);
      col2 = getRandomInt(0, cols - 1);
    } while (row1 === row2 && col1 === col2);

    nextSlate[row1][col1] = 2;
    nextSlate[row2][col2] = 2;

    slateRef.current = nextSlate;
    setSlate(nextSlate);
  }, []);

  useEffect(() => {
    slateRef.current = slate;
    setIsGameOver(checkIfThereIsAValidMoveLeft(slate));
  }, [slate]);

  useEffect(() => {
    startDefaultSlate();
  }, [startDefaultSlate]);

  const handleMove = useCallback((direction) => {
    const { slate: nextSlate, score } = isMoveValid(slateRef.current, direction);

    slateRef.current = nextSlate;
    setSlate(nextSlate);

    if (score > 0) {
      setCurrentScore((prev) => prev + score);
      playMergeSound();
    }
  }, []);

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
      <p className="score">Score: {currentScore}</p>
      <div className="game-grid">
        {slate.map((row, rowIndex) => {
          return row.map((col, colIndex) => {
            if (col == 0)
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`game-item ${numberToString[col]}`}
                ></div>
              );
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`game-item ${numberToString[col]}`}
              >
                {col}
              </div>
            );
          });
        })}
      </div>
      {isGameOver ? (
        <p
          className="try-again"
          onClick={() => {
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
