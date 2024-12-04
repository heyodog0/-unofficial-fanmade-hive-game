import React from 'react';
import HexPiece from './HexPiece';

const PIECES = {
  queen: 1,
  beetle: 2,
  spider: 2,
  grasshopper: 3,
  ant: 3
};

const PieceSelector = ({
  board,
  currentPlayer,
  selectedType,
  setSelectedType,
  selectedPiece,
  turn
}) => {
  const hasQueen = (player) => 
    board.some(piece => piece.p === player && piece.t === 'queen');

  const renderPlayerPieces = (player) => (
    <div className={`flex flex-col items-center gap-3 ${
      player === currentPlayer ? 'scale-105' : 'opacity-50'
    }`}>
      {Object.entries(PIECES).map(([name, maxCount]) => {
        const piecesUsed = board.filter(p => p.t === name && p.p === player).length;
        const remaining = maxCount - piecesUsed;
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
              w-28 h-28 bg-gray-700 rounded-md font-semibold transition-all flex items-center justify-center relative
              ${selectedType === name && player === currentPlayer 
                ? `ring-4 ${player === 1 ? 'ring-blue-500/50' : 'ring-red-500/50'} shadow-lg shadow-${player === 1 ? 'blue' : 'red'}-500/50` 
                : 'hover:bg-gray-600'}
              ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <HexPiece
              piece={{ t: name, p: player, q: 0, r: 0, z: 0 }}
              size={64}
              position={{ x: 56, y: 56 }}
              selected={false}
            />
            <div className={`absolute top-1 left-1 w-6 h-6 flex items-center justify-center rounded-full ${
              player === 1 ? 'bg-blue-600' : 'bg-red-600'
            }`}>
              <span className="text-xs font-bold text-white">{remaining}</span>
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="absolute top-[6vh] left-1/2 -translate-x-1/2 flex justify-between w-[1100px]">
      <div className="pointer-events-auto">
        {renderPlayerPieces(1)}
      </div>
      <div className="pointer-events-auto">
        {renderPlayerPieces(2)}
      </div>
    </div>
  );
};

export default PieceSelector;