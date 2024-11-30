// PieceSelector.jsx
import React from 'react';
import HexPiece from './HexPiece';
import { countPieces } from './GameLogic';

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
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-center gap-4">
        {Object.entries(PIECES).map(([name, maxCount]) => {
          const remaining = maxCount - countPieces(board, name, currentPlayer);
          const isDisabled = remaining === 0 || 
                         (!hasQueen(currentPlayer) && turn > 6 && name !== 'queen') ||
                         selectedPiece !== null;
          return (
            <button
              key={name}
              onClick={() => !isDisabled && setSelectedType(name)}
              disabled={isDisabled}
              className={`
                w-40 h-24 rounded-lg font-semibold transition-all flex flex-col items-center
                ${selectedType === name
                  ? 'bg-emerald-500 text-white scale-105 shadow-lg' 
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <div className="relative w-12 h-12 mt-2">
                <HexPiece
                  piece={{
                    t: name,
                    p: currentPlayer,
                    q: 0,
                    r: 0,
                    z: 0
                  }}
                  size={30}
                  position={{ x: 24, y: 24 }}
                  selected={false}
                  onClick={() => {}}
                />
              </div>
              <span className="text-xs mt-1 capitalize">{name}</span>
              <span className="text-xs opacity-75">
                ({remaining} left)
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PieceSelector;