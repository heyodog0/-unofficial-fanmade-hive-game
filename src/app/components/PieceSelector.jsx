// // PieceSelector.jsx
// import React from 'react';
// import HexPiece from './HexPiece';
// import { countPieces } from './GameLogic';

// const PieceSelector = ({
//   board,
//   currentPlayer,
//   selectedType,
//   setSelectedType,
//   selectedPiece,
//   hasQueen,
//   turn,
//   PIECES,
// }) => {
//   return (
//     <div className="bg-gray-800 rounded-lg p-4">
//       <div className="flex justify-center gap-4">
//         {Object.entries(PIECES).map(([name, maxCount]) => {
//           const remaining = maxCount - countPieces(board, name, currentPlayer);
//           const isDisabled = remaining === 0 || 
//                          (!hasQueen(currentPlayer) && turn > 6 && name !== 'queen') ||
//                          selectedPiece !== null;
//           return (
//             <button
//               key={name}
//               onClick={() => !isDisabled && setSelectedType(name)}
//               disabled={isDisabled}
//               className={`
//                 w-40 h-24 rounded-lg font-semibold transition-all flex flex-col items-center
//                 ${selectedType === name
//                   ? 'bg-emerald-500 text-white scale-105 shadow-lg' 
//                   : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
//                 }
//                 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
//               `}
//             >
//               <div className="relative w-12 h-12 mt-2">
//                 <HexPiece
//                   piece={{
//                     t: name,
//                     p: currentPlayer,
//                     q: 0,
//                     r: 0,
//                     z: 0
//                   }}
//                   size={30}
//                   position={{ x: 24, y: 24 }}
//                   selected={false}
//                   onClick={() => {}}
//                 />
//               </div>
//               <span className="text-xs mt-1 capitalize">{name}</span>
//               <span className="text-xs opacity-75">
//                 ({remaining} left)
//               </span>
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default PieceSelector;

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
              w-20 h-20 bg-gray-700 rounded-md font-semibold transition-all flex items-center justify-center relative
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
              size={50}
              position={{ x: 40, y:40 }}
              selected={false}
            />
<div
  className="absolute top-1 left-1 w-6 h-6 flex items-center justify-center rounded-full"
  style={{
    backgroundColor:
      player === 1 ? 'rgb(59, 130, 246)' : 'rgb(239, 68, 68)',
  }}
>
  <span className="text-xs font-bold text-white">{remaining}</span>
              {/* <span className="text-xs font-bold text-white">{remaining}</span> */}
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="fixed top-0 left-0 bottom-0 right-0 pointer-events-none flex">
      {/* Player 1 on the left */}
      <div className="pointer-events-auto bg-gray-800 w-28 flex flex-col items-center justify-center gap-4 p-2">
        {renderPlayerPieces(1)}
      </div>

      {/* Divider for the game board */}
      <div className="flex-1 relative"></div>

      {/* Player 2 on the right */}
      <div className="pointer-events-auto bg-gray-800 w-28 flex flex-col items-center justify-center gap-4 p-2">
        {renderPlayerPieces(2)}
      </div>
    </div>
  );
};

export default PieceSelector;
