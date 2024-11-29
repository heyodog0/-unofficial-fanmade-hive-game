// app/page.js
"use client"

import React, { useState, useEffect } from 'react';
import { Plus, Move, Crown, Bug, Spider, Grasshopper, Ant } from 'lucide-react';
import GameBoard from '../app/components/GameBoard';
import HexPiece from '../app/components/HexPiece';
import { 
  PIECES, 
  calculatePosition, 
  hasLost,
  countPieces,
  getValidMoves,
  canPlace,
  isConnected,
  findPieceAt,
  findPieceOnTop
} from '../app/components/GameLogic';

const PieceIcons = {
  queen: Crown,
  beetle: Bug,
  spider: Spider,
  grasshopper: Grasshopper,
  ant: Ant
};

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
  const canMove = (player) => hasQueen(player) || turn <= 6;



  const handlePieceClick = (piece) => {
    if (!isPlacingNew && canMove(currentPlayer)) {
      // Find all pieces at this position
      const piecesAtPosition = board.filter(p => p.q === piece.q && p.r === piece.r)
        .sort((a, b) => a.z - b.z);
      
      // Get the topmost piece
      const topPiece = piecesAtPosition[piecesAtPosition.length - 1];
      
      // Only allow selecting if it's the topmost piece and belongs to current player
      if (piece === topPiece && piece.p === currentPlayer) {
        setSelectedPiece(selectedPiece === piece ? null : piece);
      }
    }
  };

  const handleHexClick = (q, r) => {
    if (!isPlacingNew && !canMove(currentPlayer)) return;

    const piecesAtTarget = board.filter(p => p.q === q && p.r === r)
      .sort((a, b) => a.z - b.z);
    
    const newZ = piecesAtTarget.length;

    const valid = !isPlacingNew
      ? getValidMoves(board, selectedPiece, turn).some(m => m.q === q && m.r === r)
      : canPlace(board, q, r, selectedType, currentPlayer, turn);

    if (valid) {
      const newBoard = !isPlacingNew
        ? board.map(x => x === selectedPiece ? {...x, q, r, z: newZ} : x)
        : [...board, {q, r, z: newZ, t: selectedType, p: currentPlayer}];

      if (isConnected(newBoard)) {
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
  
    const canMoveCurrentPlayer = canMove(board, currentPlayer, turn);
  
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