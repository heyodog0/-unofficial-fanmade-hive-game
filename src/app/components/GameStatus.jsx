import React, { useState } from "react";
import { Flag, FastForward, ZoomIn, ZoomOut } from "lucide-react";
import ChessTimer from "./ChessTimer";

const GameStatus = ({
  currentPlayer,
  turn,
  playerColors,
  onPassTurn,
  onForfeit,
  onZoomIn,
  onZoomOut,
  gameOver,
  board,
}) => {
  const [showTimerSetup, setShowTimerSetup] = useState(true);
  const [initialTime, setInitialTime] = useState(600);

  const gameStarted = board.length > 0;

  if (gameStarted && showTimerSetup) {
    setShowTimerSetup(false);
  }

  return (
    <div className="flex gap-4 min-h-[100px] items-center justify-center px-4">
      <div className="flex-1 bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-center gap-4">
          <div
            className="w-6 h-6 rounded-full shadow-md"
            style={{
              backgroundColor:
                currentPlayer === 1 ? playerColors[1] : playerColors[2],
            }}
          />
          <p className="text-lg font-semibold text-white">
            Player {currentPlayer}'s Turn{" "}
            <span className="text-sm font-light">(Turn {turn})</span>
          </p>
        </div>
      </div>

      <div className="flex-1 bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          {showTimerSetup ? (
            <div className="flex items-center gap-4">
              <select 
                value={initialTime} 
                onChange={(e) => setInitialTime(Number(e.target.value))}
className="bg-gray-700 text-white rounded pl-8 pr-8 py-2 appearance-none"
              >
                <option value={300}>5 minutes</option>
                <option value={600}>10 minutes</option>
                <option value={900}>15 minutes</option>
                <option value={1800}>30 minutes</option>
                <option value={Infinity}>∞</option>
              </select>
            </div>
          ) : (
            <ChessTimer 
              currentPlayer={currentPlayer} 
              gameOver={gameOver} 
              initialTime={initialTime}
              gameStarted={gameStarted}
            />
          )}
          
          <div className="flex items-center gap-3">
            <button
              onClick={onZoomOut}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5 text-gray-300" />
            </button>
            <button
              onClick={onZoomIn}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5 text-gray-300" />
            </button>
            <button
              onClick={onPassTurn}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
              title="Pass Turn"
            >
              <FastForward className="w-5 h-5 text-yellow-400" />
            </button>
            <button
              onClick={onForfeit}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
              title="Forfeit"
            >
              <Flag className="w-5 h-5 text-red-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameStatus;