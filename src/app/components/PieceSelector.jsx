import React from 'react';
import HexPiece from './HexPiece';

const PieceSelector = ({
  board,
  currentPlayer,
  selectedType,
  setSelectedType,
  selectedPiece,
  hasQueen,
  turn,
  PIECES,
}) => {
  const renderPlayerPieces = (player) => (
    <div
      className={`flex flex-col items-center gap-3 ${
        player === currentPlayer ? 'scale-105' : 'opacity-50'
      }`}
    >
      {Object.entries(PIECES).map(([name, maxCount]) => {
        const remaining = maxCount - countPieces(board, name, player);
        const isDisabled =
          remaining === 0 ||
          (!hasQueen(player) && turn > 6 && name !== 'queen') ||
          selectedPiece !== null ||
          player !== currentPlayer;

        return (
          <button
            key={`${player}-${name}`}
            onClick={() => !isDisabled && setSelectedType(name)}
            disabled={isDisabled}
            className={`
              w-16 h-16 bg-gray-700 rounded-md font-semibold transition-all flex items-center justify-center relative
              ${selectedType === name && player === currentPlayer
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'hover:bg-gray-600'
              }
              ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <HexPiece
              piece={{
                t: name,
                p: player,
                q: 0,
                r: 0,
                z: 0,
              }}
              size={40}
              position={{ x: 32, y: 32 }}
              selected={false}
            />
            <div
              className={`absolute top-1 left-1 w-5 h-5 flex items-center justify-center rounded-full ${
                player === 1 ? 'bg-blue-600' : 'bg-red-600'
              }`}
            >
              <span className="text-xs font-bold text-white">{remaining}</span>
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="fixed top-48 left-1/2 -translate-x-1/2 flex justify-center gap-[600px]">
      <div className="pointer-events-auto flex flex-col items-center justify-center gap-2 p-2 rounded-lg">
        {renderPlayerPieces(1)}
      </div>
      <div className="pointer-events-auto flex flex-col items-center justify-center gap-2 p-2 rounded-lg">
        {renderPlayerPieces(2)}
      </div>
    </div>
  );
};

export default PieceSelector;