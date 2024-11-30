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
    <div className={`flex-1 ${player === currentPlayer ? 'scale-105' : 'opacity-50'}`}>
      <div className="grid grid-cols-5 gap-4">
        {Object.entries(PIECES).map(([name, maxCount]) => {
          const remaining = maxCount - countPieces(board, name, player);
          const isDisabled = remaining === 0 || 
                         (!hasQueen(player) && turn > 6 && name !== 'queen') ||
                         selectedPiece !== null ||
                         player !== currentPlayer;
          
          return (
            <button
              key={`${player}-${name}`}
              onClick={() => !isDisabled && setSelectedType(name)}
              disabled={isDisabled}
              className={`
                w-24 h-24 rounded-xl font-semibold transition-all relative cursor-pointer
                ${selectedType === name && player === currentPlayer
                  ? 'bg-emerald-500 text-white scale-105 shadow-lg' 
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <div className="absolute inset-0 pointer-events-none">
                <HexPiece
                  piece={{
                    t: name,
                    p: player,
                    q: 0,
                    r: 0,
                    z: 0
                  }}
                  size={35}
                  position={{ x: 48, y: 48 }}
                  selected={false}
                />
              </div>
              <div className="absolute -top-2 w-8 h-8 flex items-center justify-center rounded-full pointer-events-none"
 style={{
   backgroundColor: player === 1 ? 'rgb(59, 130, 246)' : 'rgb(239, 68, 68)'
 }}
>
 <span className="text-lg font-bold text-white">{remaining}</span>
</div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="fixed bottom-8 left-0 right-0 bg-gray-800 p-4">
      <div className="container mx-auto max-w-6xl flex justify-center gap-24">
        {renderPlayerPieces(1)}
        <div className="w-px h-full bg-gray-600" />
        {renderPlayerPieces(2)}
      </div>
    </div>
  );
};

export default PieceSelector;