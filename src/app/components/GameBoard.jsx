// GameBoard.jsx
import React, { useMemo } from 'react';
import HexGrid from './HexGrid';
import HexPiece from './HexPiece';
import { DIRECTIONS, getValidMoves, isConnected, canPlace } from './GameLogic';

const GameBoard = ({ 
  board,
  setBoard,
  selectedPiece,
  setSelectedPiece,
  selectedType,
  setSelectedType,
  hexSize,
  currentPlayer,
  setCurrentPlayer,
  turn,
  setTurn,
  canMove,
  highlightedTiles,
  setHighlightedTiles,
  calculatePosition
}) => {
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
          setSelectedPiece(null);
          setHighlightedTiles([]);
          setCurrentPlayer(p => (p === 1 ? 2 : 1));
          setTurn(t => t + 1);
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
        setHighlightedTiles([]);
      } else {
        setSelectedPiece(piece);
        const validMoves = getValidMoves(board, piece, turn);
        setHighlightedTiles(validMoves.map(({ q, r }) => `${q},${r}`));
      }
    }
  };

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

  // Calculate valid moves once at the board level
  const validMoves = useMemo(() => 
    selectedPiece ? getValidMoves(board, selectedPiece, turn) : [],
    [selectedPiece, board, turn]
  );

  return (
<div className="relative aspect-square bg-white rounded-lg">
      <svg width="100%" height="100%" viewBox="0 0 800 800" className="bg-white">
      {/* // Change from Array(21) to Array(17) */}
{Array(25).fill().flatMap((_, r) =>
  Array(25).fill().map((_, q) => {
    const qCoord = q - 13;  // Change from -10 to -8
    const rCoord = r - 11;  // Change from -10 to -8
            const pos = calculatePosition(qCoord, rCoord, hexSize);
            
            const isOccupied = board.some(p => p.q === qCoord && p.r === rCoord);
            
            const validPlace = !selectedPiece && selectedType && 
              !isOccupied &&
              canPlace(board, qCoord, rCoord, selectedType, currentPlayer, turn);

            const validMove = selectedPiece && validMoves.find(move => 
              move.q === qCoord && move.r === rCoord
            );

            const isBeetleClimbing = validMove && 
              selectedPiece?.t === 'beetle' && 
              board.some(p => p.q === qCoord && p.r === rCoord);

            return (
              <HexGrid
                key={`${q}-${r}`}
                size={hexSize}
                valid={!selectedPiece && validPlace}
                validMove={!!validMove}
                isBeetleClimbing={isBeetleClimbing}
                position={pos}
                onClick={() => handleHexClick(qCoord, rCoord)}
              />
            );
          })
        )}
      </svg>
      
      {board.map((piece, i) => (
        <HexPiece
          key={i}
          piece={{...piece, board: board}}
          size={hexSize}
          selected={selectedPiece && 
                   piece.q === selectedPiece.q && 
                   piece.r === selectedPiece.r &&
                   piece.z === selectedPiece.z}
          position={calculatePosition(piece.q, piece.r, hexSize)}
          onClick={() => handlePieceClick(piece)}
        />
      ))}
    </div>
  );
};

export default GameBoard;