import React from 'react';

const GameStatus = ({ currentPlayer, turn, hasQueen, playerColors, board, hasLost }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div 
          className="w-6 h-6 rounded-full" 
          style={{backgroundColor: playerColors[currentPlayer]}}
        />
        <h2 className="text-2xl font-bold text-white">
          Player {currentPlayer}'s Turn
          <span className="ml-2 text-gray-400 text-lg">
            (Turn {turn})
          </span>
        </h2>
      </div>
      {!hasQueen(currentPlayer) && turn > 6 && (
        <div className="text-yellow-500 font-bold">Must place Queen!</div>
      )}
      {hasLost(board, 1) && (
        <div className="text-xl font-bold text-blue-500">Player 2 Wins!</div>
      )}
      {hasLost(board, 2) && (
        <div className="text-xl font-bold text-red-500">Player 1 Wins!</div>
      )}
    </div>
  );
};

export default GameStatus;