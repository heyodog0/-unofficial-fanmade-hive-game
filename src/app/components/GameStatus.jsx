import React from 'react';

const GameStatus = ({ 
  currentPlayer, 
  turn, 
  hasQueen, 
  playerColors, 
  board, 
  hasLost,
  onPassTurn,
  onForfeit,
  onPlayAgain,
  canMakeMove,
  gameOver,
  winner
}) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4 flex justify-between items-center">
      {!gameOver ? (
        <>
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
          
          <div className="flex items-center gap-4">
            {!hasQueen(currentPlayer) && turn > 6 && (
              <div className="text-yellow-500 font-bold">Must place Queen!</div>
            )}
            <button
              onClick={onPassTurn}
              className="px-3 py-1 bg-yellow-500 text-white text-sm rounded-md font-medium hover:bg-yellow-600 transition-colors"
            >
              Pass Turn {!canMakeMove && "(No Moves Available)"}
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Are you sure Player ${currentPlayer} wants to forfeit?`)) {
                  onForfeit();
                }
              }}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded-md font-medium hover:bg-red-600 transition-colors"
            >
              Forfeit
            </button>
          </div>
        </>
      ) : (
        <div className="w-full flex justify-between items-center">
          <div className="text-2xl font-bold" style={{ color: playerColors[winner] }}>
            Player {winner} Wins!
          </div>
          <button
            onClick={onPlayAgain}
            className="px-4 py-2 bg-emerald-500 text-white rounded-md font-medium hover:bg-emerald-600 transition-colors"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default GameStatus;