// app/page.js
"use client"

import React, { useState, useEffect } from 'react';
import GameBoard from '../app/components/GameBoard';
import HexPiece from '../app/components/HexPiece';
import { 
  PIECES, 
  DIRECTIONS,
  calculatePosition, 
  hasLost,
  countPieces,
  getValidMoves,
  canPlace,
  isConnected,
  highlightLegalMoves, // Import this function
} from '../app/components/GameLogic';

const HiveGame = () => {
  const [board, setBoard] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [turn, setTurn] = useState(1);

  const HEX_SIZE = 50;
  const playerColors = {
    1: 'rgb(59, 130, 246)', // Blue
    2: 'rgb(239, 68, 68)'  // Red
  };

  const hasQueen = (player) => countPieces(board, 'queen', player) > 0;
  const canMove = (player) => hasQueen(player);
  const [highlightedTiles, setHighlightedTiles] = useState([]);


  const handlePieceClick = (piece) => {
    // Handle beetle climbing
    if (selectedPiece?.t === 'beetle') {
      const isAdjacent = DIRECTIONS.some(([dq, dr]) =>
        selectedPiece.q + dq === piece.q &&
        selectedPiece.r + dr === piece.r
      );
  
      if (isAdjacent) {
        const newBoard = board.map(p => {
          if (
            p.q === selectedPiece.q &&
            p.r === selectedPiece.r &&
            p.z === selectedPiece.z
          ) {
            return {
              ...p,
              q: piece.q,
              r: piece.r,
              z: piece.z + 1, // Climb on top of the target piece
            };
          }
          return p;
        });
  
        if (isConnected(newBoard)) {
          setBoard(newBoard);
          setSelectedPiece(null); // Deselect beetle
          setHighlightedTiles([]); // Clear highlights
          setCurrentPlayer(p => (p === 1 ? 2 : 1)); // Switch turns
          setTurn(t => t + 1); // Increment turn
          return;
        }
      }
    }
  
    // Handle regular piece selection
    if (piece.p === currentPlayer && canMove(currentPlayer)) {
      if (
        selectedPiece &&
        selectedPiece.q === piece.q &&
        selectedPiece.r === piece.r
      ) {
        setSelectedPiece(null);
        setHighlightedTiles([]); // Clear highlights
      } else {
        setSelectedPiece(piece);
        highlightLegalMoves(board, piece, turn, setHighlightedTiles); // Highlight legal moves
      }
    }
  };
  
  
  

  // const handlePieceClick = (piece) => {
  //   // Handle beetle climbing
  //   if (selectedPiece?.t === 'beetle') {
  //     const isAdjacent = DIRECTIONS.some(([dq, dr]) => 
  //       selectedPiece.q + dq === piece.q && 
  //       selectedPiece.r + dr === piece.r
  //     );

  //     if (isAdjacent) {
  //       const newBoard = board.map(p => {
  //         if (p.q === selectedPiece.q && 
  //             p.r === selectedPiece.r && 
  //             p.z === selectedPiece.z) {
  //           return {
  //             ...p,
  //             q: piece.q,
  //             r: piece.r,
  //             z: piece.z + 1
  //           };
  //         }
  //         return p;
  //       });
        
  //       if (isConnected(newBoard)) {
  //         setBoard(newBoard);
  //         setSelectedPiece(null);
  //         setCurrentPlayer(p => p === 1 ? 2 : 1);
  //         setTurn(t => t + 1);
  //         return;
  //       }
  //     }
  //   }

  //   // Handle piece selection
  //   if (piece.p === currentPlayer && canMove(currentPlayer)) {
  //     if (selectedPiece && 
  //         selectedPiece.q === piece.q && 
  //         selectedPiece.r === piece.r) {
  //       setSelectedPiece(null);
  //     } else {
  //       const pieceWithBoard = { ...piece, board: board };
  //       setSelectedPiece(pieceWithBoard);
  //     }
  //   }
  // };
  
  const handleHexClick = (q, r) => {
    // Handle piece movement
    if (selectedPiece) {
      const validMoves = getValidMoves(board, selectedPiece, turn);
      const isValidMove = validMoves.some(move => move.q === q && move.r === r);
      
      if (isValidMove) {
        const piecesAtTarget = board.filter(p => p.q === q && p.r === r)
          .sort((a, b) => a.z - b.z);
        
        const newZ = selectedPiece.t === 'beetle' 
          ? (piecesAtTarget.length > 0 ? piecesAtTarget[piecesAtTarget.length - 1].z + 1 : 0)
          : 0;
  
        const newBoard = board.map(piece => {
          if (piece.q === selectedPiece.q && 
              piece.r === selectedPiece.r &&
              piece.z === selectedPiece.z) {
            return { ...piece, q, r, z: newZ };
          }
          return piece;
        });
  
        if (isConnected(newBoard)) {
          setBoard(newBoard);
          setSelectedPiece(null);
          setCurrentPlayer(p => p === 1 ? 2 : 1);
          setTurn(t => t + 1);
        }
      }
      return;
    }
    
    // Handle piece placement
    if (selectedType && canPlace(board, q, r, selectedType, currentPlayer, turn)) {
      const newBoard = [...board, {q, r, z: 0, t: selectedType, p: currentPlayer}];
      if (isConnected(newBoard)) {
        setBoard(newBoard);
        setSelectedType(null);
        setCurrentPlayer(p => p === 1 ? 2 : 1);
        setTurn(t => t + 1);
      }
    }
  };

  const PieceSelector = () => {
    return (
      <div className="flex justify-center gap-4">
        {Object.entries(PIECES).map(([name, maxCount]) => {
          const remaining = maxCount - countPieces(board, name, currentPlayer);
          const isDisabled = remaining === 0 || 
                           (!hasQueen(currentPlayer) && turn > 6 && name !== 'queen') ||
                           selectedPiece !== null; // Gray out when a piece is selected
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
    );
  };

  // Reset selections at the start of each turn
  useEffect(() => {
    setSelectedPiece(null);
    setSelectedType(null);
  }, [currentPlayer]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <div className="w-[800px] flex flex-col gap-4">
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

        <div className="bg-gray-800 rounded-lg p-4">
          <PieceSelector />
        </div>

        <div className="relative aspect-square bg-white rounded-lg overflow-hidden">
        <GameBoard
  board={board}
  selectedPiece={selectedPiece}
  selectedType={selectedType}
  hexSize={HEX_SIZE}
  getValidMoves={getValidMoves}
  onHexClick={handleHexClick}
  onPieceClick={handlePieceClick}
  calculatePosition={calculatePosition}
  canPlace={canPlace}
  currentPlayer={currentPlayer}
  turn={turn}
  isPlacingNew={!selectedPiece}
  playerColors={playerColors}
  highlightedTiles={highlightedTiles} // Pass highlighted tiles
/>
        </div>
      </div>
    </div>
  );
};

export default HiveGame;