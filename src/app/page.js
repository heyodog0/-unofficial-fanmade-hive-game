// app/page.js
"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import GameBoard from '../app/components/GameBoard';
import PieceSelector from '../app/components/PieceSelector';
import GameStatus from '../app/components/GameStatus';
import { 
  PIECES,
  hasLost,
  countPieces,
  calculatePosition,
  getValidMoves,
  canPlace,
} from '../app/components/GameLogic';

const HiveGame = () => {
  const [board, setBoard] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [turn, setTurn] = useState(1);
  const [highlightedTiles, setHighlightedTiles] = useState([]);
  const [canMakeMove, setCanMakeMove] = useState(true);
 
  const HEX_SIZE = 60;
  const playerColors = {
    1: 'rgb(59, 130, 246)', // Blue
    2: 'rgb(239, 68, 68)'   // Red
  };
 
  const hasQueen = (player) => countPieces(board, 'queen', player) > 0;
  const canMove = (player) => hasQueen(player);

  const boardState = useMemo(() => ({
    board,
    currentPlayer,
    turn,
    selectedType,
    selectedPiece
  }), [board, currentPlayer, turn, selectedType, selectedPiece]);
 
  const canMakeAnyMove = useCallback(() => {
    // First check if we can place any new pieces
    for (const [type, maxCount] of Object.entries(PIECES)) {
      const currentCount = countPieces(board, type, currentPlayer);
      if (currentCount < maxCount) {
        // Check if placement is possible anywhere
        for (let q = -10; q <= 10; q++) {
          for (let r = -10; r <= 10; r++) {
            if (canPlace(board, q, r, type, currentPlayer, turn)) {
              return true;
            }
          }
        }
      }
    }

    // Only check for piece movement if we have a queen
    if (hasQueen(currentPlayer)) {
      // Check if any existing pieces can move
      const playerPieces = board.filter(p => p.p === currentPlayer);
      return playerPieces.some(piece => {
        const moves = getValidMoves(board, piece, turn);
        return moves.length > 0;
      });
    }

    return false;
  }, [board, currentPlayer, turn, hasQueen]);

  useEffect(() => {
    // Set zoom level to 75%
    document.body.style.zoom = "90%";
  }, []);


  useEffect(() => {
    setSelectedPiece(null);
    setSelectedType(null);
  }, [currentPlayer]);
  
  useEffect(() => {
    let canMove = false;

    if (boardState.selectedType) {
      // Check if the selected piece type can be placed anywhere
      for (let q = -10; q <= 10; q++) {
        for (let r = -10; r <= 10; r++) {
          if (canPlace(boardState.board, q, r, boardState.selectedType, boardState.currentPlayer, boardState.turn)) {
            canMove = true;
            break;
          }
        }
        if (canMove) break;
      }
    } else if (boardState.selectedPiece) {
      const moves = getValidMoves(boardState.board, boardState.selectedPiece, boardState.turn);
      canMove = moves.length > 0;
    } else {
      // If nothing is selected, check if any move is possible
      canMove = canMakeAnyMove();
    }

    setCanMakeMove(canMove);
  }, [boardState, canMakeAnyMove]);

  // Add new state for game over
const [gameOver, setGameOver] = useState(false);

// Add forfeit handler
const handleForfeit = () => {
  setGameOver(true);
  // Set winner to the opposite player
  if (currentPlayer === 1) {
    setBoard(board => [...board, { q: 0, r: 0, z: 0, t: 'queen', p: 1 }]); // Add dummy piece to trigger win
  } else {
    setBoard(board => [...board, { q: 0, r: 0, z: 0, t: 'queen', p: 2 }]); // Add dummy piece to trigger win
  }
};

 
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 pb-24">      
      <div className="w-[800px] flex flex-col gap-4">
      <GameStatus 
  currentPlayer={currentPlayer}
  turn={turn}
  hasQueen={hasQueen}
  playerColors={playerColors}
  board={board}
  hasLost={hasLost}
  canMakeMove={canMakeMove}
  gameOver={gameOver || hasLost(board, 1) || hasLost(board, 2)}
  onPassTurn={() => {
    setCurrentPlayer(p => p === 1 ? 2 : 1);
    setTurn(t => t + 1);
    setSelectedPiece(null);
    setSelectedType(null);
    setHighlightedTiles([]);
  }}
  onForfeit={handleForfeit}
/>
 
 <div className="flex flex-col gap-4">
  <PieceSelector
    board={board}
    currentPlayer={currentPlayer}
    selectedType={selectedType}
    setSelectedType={setSelectedType}
    selectedPiece={selectedPiece}
    hasQueen={hasQueen}
    turn={turn}
    PIECES={PIECES}
  />
  
  <button
    onClick={() => {
      setCurrentPlayer(p => p === 1 ? 2 : 1);
      setTurn(t => t + 1);
      setSelectedPiece(null);
      setSelectedType(null);
      setHighlightedTiles([]);
    }}
    // className="self-end px-4 py-1.5 bg-yellow-500 text-white text-sm rounded-md font-medium hover:bg-yellow-600 transition-colors"
  >
    {/* Pass Turn {!canMakeMove && "(No Moves Available)"} */}
  </button>
</div>
 
        <div className="relative aspect-square bg-white rounded-lg overflow-hidden">
          <div className="absolute inset-0 origin-center scale-[0.85]">
            <GameBoard
              board={board}
              setBoard={setBoard}
              selectedPiece={selectedPiece}
              setSelectedPiece={setSelectedPiece}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              hexSize={HEX_SIZE}
              currentPlayer={currentPlayer}
              setCurrentPlayer={setCurrentPlayer}
              turn={turn}
              setTurn={setTurn}
              canMove={canMove}
              highlightedTiles={highlightedTiles}
              setHighlightedTiles={setHighlightedTiles}
              calculatePosition={calculatePosition}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default HiveGame;