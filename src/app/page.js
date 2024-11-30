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
 
  const HEX_SIZE = 50;
  const playerColors = {
    1: 'rgb(59, 130, 246)', // Blue
    2: 'rgb(239, 68, 68)'   // Red
  };
 
  const hasQueen = (player) => countPieces(board, 'queen', player) > 0;
  const canMove = (player) => hasQueen(player);
 
  const canMakeAnyMove = useCallback(() => {
    // Check if can place any new pieces
    for (const [type, maxCount] of Object.entries(PIECES)) {
      if (countPieces(board, type, currentPlayer) < maxCount) {
        for (let q = -10; q <= 10; q++) {
          for (let r = -10; r <= 10; r++) {
            if (canPlace(board, q, r, type, currentPlayer, turn)) {
              return true;
            }
          }
        }
      }
    }
 
    // Check if can move existing pieces
    const playerPieces = board.filter(p => p.p === currentPlayer);
    return playerPieces.some(piece => {
      const moves = getValidMoves(board, piece, turn);
      return moves.length > 0;
    });
  }, [board, currentPlayer, turn]);


  useEffect(() => {
    setSelectedPiece(null);
    setSelectedType(null);
  }, [currentPlayer]);

  const boardState = useMemo(() => ({
    board,
    currentPlayer,
    turn,
    selectedType,
    selectedPiece
  }), [board, currentPlayer, turn, selectedType, selectedPiece]);
  
  useEffect(() => {
    if (boardState.selectedType) {
      const anyValidPlacements = Object.entries(PIECES).some(([type, maxCount]) => {
        if (countPieces(boardState.board, type, boardState.currentPlayer) < maxCount) {
          for (let q = -10; q <= 10; q++) {
            for (let r = -10; r <= 10; r++) {
              if (canPlace(boardState.board, q, r, type, boardState.currentPlayer, boardState.turn)) {
                return true;
              }
            }
          }
        }
        return false;
      });
      setCanMakeMove(anyValidPlacements);
    } else if (boardState.selectedPiece) {
      const moves = getValidMoves(boardState.board, boardState.selectedPiece, boardState.turn);
      setCanMakeMove(moves.length > 0);
    } else {
      setCanMakeMove(true);
    }
  }, [boardState]);

 
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <div className="w-[800px] flex flex-col gap-4">
        <GameStatus 
          currentPlayer={currentPlayer}
          turn={turn}
          hasQueen={hasQueen}
          playerColors={playerColors}
          board={board}
          hasLost={hasLost}
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
          
          {!canMakeMove && (
            <button
              onClick={() => {
                setCurrentPlayer(p => p === 1 ? 2 : 1);
                setTurn(t => t + 1);
                setSelectedPiece(null);
                setSelectedType(null);
                setHighlightedTiles([]);
              }}
              className="px-6 py-2 bg-yellow-500 text-white rounded-lg font-bold hover:bg-yellow-600 transition-colors"
            >
              Pass Turn (No Moves Available)
            </button>
          )}
        </div>
 
        <div className="relative aspect-square bg-white rounded-lg overflow-hidden">
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
  );
 };
 
 export default HiveGame;