// app/page.js
"use client"

import React, { useState, useEffect } from 'react';
import { Plus, Move, Crown, Bug, Spider, Grasshopper, Ant } from 'lucide-react';
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
  findPieceAt,
  findPieceOnTop
} from '../app/components/GameLogic';

const HiveGame = () => {
  const [board, setBoard] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [isPlacingNew, setIsPlacingNew] = useState(true);
  const [turn, setTurn] = useState(1);

  const HEX_SIZE = 50;
  const playerColors = {
    1: 'rgb(59, 130, 246)', // Blue
    2: 'rgb(239, 68, 68)'  // Red
  };

  const hasQueen = (player) => countPieces(board, 'queen', player) > 0;

  // This was incorrectly checking if they can move OR if it's first 6 turns
  const canMove = (player) => hasQueen(player);



  const handlePieceClick = (piece) => {
    if (!isPlacingNew && hasQueen(currentPlayer)) {
      // If we have a beetle selected
      if (selectedPiece?.t === 'beetle') {
        // Check if clicked piece is adjacent to our beetle
        const isAdjacent = DIRECTIONS.some(([dq, dr]) => 
          selectedPiece.q + dq === piece.q && 
          selectedPiece.r + dr === piece.r
        );
  
        if (isAdjacent) {
          // Create potential new board state
          const newBoard = board.map(p => {
            if (p.q === selectedPiece.q && 
                p.r === selectedPiece.r && 
                p.z === selectedPiece.z) {
              return {
                ...p,
                q: piece.q,
                r: piece.r,
                z: piece.z + 1
              };
            }
            return p;
          });
          
          // Only allow the move if it doesn't break hive connectivity
          if (isConnected(newBoard)) {
            setBoard(newBoard);
            setSelectedPiece(null);
            setCurrentPlayer(p => p === 1 ? 2 : 1);
            setTurn(t => t + 1);
            return;
          }
        }
      }
      
      // Only handle clicks for current player's pieces
      if (piece.p === currentPlayer) {
        // If we click the currently selected piece, deselect it
        if (selectedPiece && 
            selectedPiece.q === piece.q && 
            selectedPiece.r === piece.r) {
          setSelectedPiece(null);
        } else {
          // Otherwise, select the new piece
          const pieceWithBoard = { ...piece, board: board };
          setSelectedPiece(pieceWithBoard);
        }
      }
    }
  };
  
const handleHexClick = (q, r) => {
  // Placing new piece
  if (isPlacingNew) {
    if (selectedType && canPlace(board, q, r, selectedType, currentPlayer, turn)) {
      const newBoard = [...board, {q, r, z: 0, t: selectedType, p: currentPlayer}];
      setBoard(newBoard);
      setSelectedType(null);
      setCurrentPlayer(p => p === 1 ? 2 : 1);
      setTurn(t => t + 1);
    }
    return;
  }
  
  // Moving existing piece
  if (selectedPiece) {
    const validMoves = getValidMoves(board, selectedPiece, turn);
    console.log('Piece being moved:', selectedPiece);
    console.log('Valid moves calculated:', validMoves);
    console.log('Target position:', {q, r});
    const isValidMove = validMoves.some(move => move.q === q && move.r === r);
    console.log('Is this a valid move?', isValidMove);
    
    if (isValidMove) {
      // Calculate new z value for the target position
      const piecesAtTarget = board.filter(p => p.q === q && p.r === r)
        .sort((a, b) => a.z - b.z);
      
      // If it's a beetle, it goes on top of the stack
      // Otherwise, it stays at z=0
      const newZ = selectedPiece.t === 'beetle' 
        ? (piecesAtTarget.length > 0 ? piecesAtTarget[piecesAtTarget.length - 1].z + 1 : 0)
        : 0;

      const newBoard = board.map(piece => {
        const isSelectedPiece = piece.q === selectedPiece.q && 
                               piece.r === selectedPiece.r &&
                               piece.t === selectedPiece.t &&
                               piece.p === selectedPiece.p;
                               
        if (isSelectedPiece) {
          return {
            ...piece,
            q: q,
            r: r,
            z: newZ
          };
        }
        return piece;
      });
      
      setBoard(newBoard);
      setSelectedPiece(null);
      setCurrentPlayer(p => p === 1 ? 2 : 1);
      setTurn(t => t + 1);
    }
  }
};

  const GameControls = () => {
    const handleModeChange = (placing) => {
      setIsPlacingNew(placing);
      setSelectedPiece(null);
      setSelectedType(null);
    };
  
    const canMoveCurrentPlayer = hasQueen(currentPlayer);
  
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-center gap-3">
          <button
            onClick={() => handleModeChange(true)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2
              ${isPlacingNew 
                ? 'bg-red-500 text-white scale-105 shadow-lg' 
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}
            `}
          >
            <Plus size={20} />
            Place New Piece
          </button>
          <button
            onClick={() => handleModeChange(false)}
            disabled={!canMoveCurrentPlayer}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2
              ${!isPlacingNew 
                ? 'bg-green-500 text-white scale-105 shadow-lg' 
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}
              ${!canMoveCurrentPlayer ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <Move size={20} />
            Move Existing Piece
          </button>
        </div>
  
        {!canMoveCurrentPlayer && !isPlacingNew && (
          <div className="text-yellow-500 text-center">
            Must place Queen Bee before moving pieces!
          </div>
        )}
  

        {isPlacingNew && (
  <div className="flex justify-center gap-4">
    {Object.entries(PIECES).map(([name, maxCount]) => {
      const remaining = maxCount - countPieces(board, name, currentPlayer);
      const isDisabled = remaining === 0 || (!hasQueen(currentPlayer) && turn > 6 && name !== 'queen');
      return (
        <button
          key={name}
          onClick={() => setSelectedType(name)}
          disabled={isDisabled}
          className={`
            w-40 h-24 rounded-lg font-semibold transition-all flex flex-col items-center
            ${selectedType === name
              ? 'bg-yellow-500 text-white scale-105 shadow-lg' 
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
)}
          </div>
        )}

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
          <GameControls />
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
            isPlacingNew={isPlacingNew}
            playerColors={playerColors}
          />
        </div>
      </div>
    </div>
  );
};

export default HiveGame;