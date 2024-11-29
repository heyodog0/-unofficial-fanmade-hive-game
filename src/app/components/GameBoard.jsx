// GameBoard.jsx
import React from 'react';
import HexGrid from './HexGrid';
import HexPiece from './HexPiece';
const GameBoard = ({ 
    board, 
    selectedPiece,
    selectedType,
    hexSize,
    getValidMoves,
    onHexClick,
    onPieceClick,
    calculatePosition,
    canPlace,
    currentPlayer,
    turn,
    isPlacingNew
  }) => {
    
    // Fix: Pass board to getValidMoves
    const validMoves = (!isPlacingNew && selectedPiece) ? 
      getValidMoves(board, selectedPiece, turn) : [];
    
    console.log('Debug validMoves:', {
      selectedPiece,
      validMoves,
      board
    });
    
    return (
      <div className="w-full h-full relative">
        <svg width="100%" height="100%" viewBox="0 0 800 800" className="bg-white">
        {Array(21).fill().flatMap((_, r) =>
  Array(21).fill().map((_, q) => {
    const qCoord = q - 10;
    const rCoord = r - 10;
    const pos = calculatePosition(qCoord, rCoord, hexSize);
    const isOccupied = board.some(p => p.q === qCoord && p.r === rCoord);
    
    const validMove = (!isPlacingNew && selectedPiece) ? 
      validMoves.some(m => m.q === qCoord && m.r === rCoord) : false;
    
    const validPlace = (isPlacingNew && selectedType && 
      !isOccupied && canPlace(board, qCoord, rCoord, selectedType, currentPlayer, turn));

    return (
      <HexGrid
        key={`${q}-${r}`}
        size={hexSize}
        valid={validPlace}
        validMove={validMove}
        position={pos}
        onClick={() => onHexClick(qCoord, rCoord)}
      />
    );
  })
)}
        </svg>
        
        {board.map((piece, i) => (
          <HexPiece
            key={i}
            piece={piece}
            size={hexSize}
            selected={selectedPiece === piece}
            position={calculatePosition(piece.q, piece.r, hexSize)}
            onClick={() => onPieceClick(piece)}
          />
        ))}
      </div>
    );
  };

export default GameBoard;