import numberToString from "@/constants/numberToString";
import {
  bottomToTop,
  checkIfThereIsAValidMoveLeft,
  isMoveValid,
  leftToRight,
  printMatrix,
  rightToLeft,
  topToBottom,
} from "@/utils/manipulate-slate";
import React, { useEffect, useState } from "react";

const cleanSlate = [
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
];

const GameCard = () => {
  const [slate, setSlate] = useState(cleanSlate);
  const [isGameOver, setIsGameOver] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);

  function startDefaultSlate(slate) {
    const rows = slate.length;
    const cols = slate[0].length;

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

    slate[row1][col1] = 2;
    slate[row2][col2] = 2;

    console.log(slate);
    setSlate([...slate]);
  }

  useEffect(() => {
    setIsGameOver(checkIfThereIsAValidMoveLeft(slate));
  }, [slate]);

  useEffect(() => {
    startDefaultSlate(cleanSlate);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      let res;
      switch (event.key) {
        case "ArrowUp":
        case "w":
          res = isMoveValid(slate, "up");
          setCurrentScore((prev) => prev + +res.score);
          setSlate([...res.slate]);
          break;
        case "ArrowDown":
        case "s":
          res = isMoveValid(slate, "down");
          setCurrentScore((prev) => prev + +res.score);
          setSlate([...res.slate]);
          break;
        case "ArrowLeft":
        case "a":
          res = isMoveValid(slate, "left");
          setCurrentScore((prev) => prev + +res.score);
          setSlate([...res.slate]);
          break;
        case "ArrowRight":
        case "d":
          res = isMoveValid(slate, "right");
          setCurrentScore((prev) => prev + +res.score);
          setSlate([...res.slate]);
          break;
        default:
          null;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  let startX = 0;
  let startY = 0;

  const handleTouchStart = (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const dx = endX - startX;
    const dy = endY - startY;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) {
        const { slate: currentSlate, score } = isMoveValid(slate, "right");
        setCurrentScore(currentScore + score);
        setSlate([...currentSlate]);
      } else {
        const { slate: currentSlate, score } = isMoveValid(slate, "left");
        setCurrentScore(currentScore + score);
        setSlate([...currentSlate]);
      }
    } else if (Math.abs(dx) < Math.abs(dy)) {
      if (dy > 0) {
        const { slate: currentSlate, score } = isMoveValid(slate, "down");
        setCurrentScore(currentScore + score);
        setSlate([...currentSlate]);
      } else {
        const { slate: currentSlate, score } = isMoveValid(slate, "up");
        setCurrentScore(currentScore + score);
        setSlate([...currentSlate]);
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
        {slate.map((row) => {
          return row.map((col) => {
            if (col == 0)
              return <div className={`game-item ${numberToString[col]}`}></div>;
            return (
              <div className={`game-item ${numberToString[col]}`}>{col}</div>
            );
          });
        })}
      </div>
      {isGameOver ? (
        <p
          className="try-again"
          onClick={() => {
            setCurrentScore(0);
            startDefaultSlate(cleanSlate);
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
