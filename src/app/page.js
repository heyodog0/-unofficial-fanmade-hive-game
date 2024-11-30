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
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
 
  const HEX_SIZE = 60;
  const playerColors = {
    1: 'rgb(59, 130, 246)', // Blue
    2: 'rgb(239, 68, 68)'   // Red
  };
 
  const hasQueen = (player) => countPieces(board, 'queen', player) > 0;
  const canMove = (player) => hasQueen(player);

  const handleForfeit = () => {
    setGameOver(true);
    setWinner(currentPlayer === 1 ? 2 : 1);
  };

  const handlePlayAgain = () => {
    setBoard([]);
    setSelectedPiece(null);
    setCurrentPlayer(1);
    setSelectedType(null);
    setTurn(1);
    setHighlightedTiles([]);
    setGameOver(false);
    setWinner(null);
    setCanMakeMove(true);
  };
 
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
    if (hasLost(board, 1)) {
      setGameOver(true);
      setWinner(2);
    } else if (hasLost(board, 2)) {
      setGameOver(true);
      setWinner(1);
    }
  }, [board]);

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
          gameOver={gameOver}
          winner={winner}
          onPassTurn={() => {
            setCurrentPlayer(p => p === 1 ? 2 : 1);
            setTurn(t => t + 1);
            setSelectedPiece(null);
            setSelectedType(null);
            setHighlightedTiles([]);
          }}
          onForfeit={handleForfeit}
          onPlayAgain={handlePlayAgain}
        />
 
        {!gameOver && (
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
        )}
 
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