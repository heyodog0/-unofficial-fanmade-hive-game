import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

const ChessTimer = ({ currentPlayer, gameOver, initialTime, gameStarted }) => {
  const [player1Time, setPlayer1Time] = useState(initialTime);
  const [player2Time, setPlayer2Time] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (gameStarted && !isActive) {
      setIsActive(true);
    }
  }, [gameStarted]);

  useEffect(() => {
    let interval = null;
    
    if (isActive && !gameOver && initialTime !== Infinity) {
      interval = setInterval(() => {
        if (currentPlayer === 1) {
          setPlayer1Time(time => {
            if (time <= 0) {
              clearInterval(interval);
              return 0;
            }
            return time - 1;
          });
        } else {
          setPlayer2Time(time => {
            if (time <= 0) {
              clearInterval(interval);
              return 0;
            }
            return time - 1;
          });
        }
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [currentPlayer, isActive, gameOver, initialTime]);

  const formatTime = (seconds) => {
    if (seconds === Infinity) return '∞';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-4">
      <Timer className="h-5 w-5 text-gray-300" />
      <div className="flex gap-3 items-center">
        <div className={`px-3 py-1 rounded ${currentPlayer === 1 ? 'bg-blue-600' : 'bg-gray-700'}`}>
          {formatTime(player1Time)}
        </div>
        <div className={`px-3 py-1 rounded ${currentPlayer === 2 ? 'bg-red-600' : 'bg-gray-700'}`}>
          {formatTime(player2Time)}
        </div>
      </div>
    </div>
  );
};

export default ChessTimer;