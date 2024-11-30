// GameBoard.jsx
// import React from 'react';
import HexGrid from './HexGrid';
import HexPiece from './HexPiece';
import { getValidMoves} from './GameLogic';
import React, { useMemo } from 'react';

const GameBoard = ({ 
    board, 
    selectedPiece,
    selectedType,
    hexSize,
    onHexClick,
    onPieceClick,
    calculatePosition,
    canPlace,
    currentPlayer,
    turn,
    highlightedTiles, // Add highlightedTiles
    isPlacingNew,
}) => {
    // Calculate valid moves once at the board level
    const validMoves = useMemo(() => 
        selectedPiece ? getValidMoves(board, selectedPiece, turn) : [],
        [selectedPiece, board, turn]
    );
    
    return (
      <div className="w-full h-full relative">
        <svg width="100%" height="100%" viewBox="0 0 800 800" className="bg-white">
        {Array(21).fill().flatMap((_, r) =>
          Array(21).fill().map((_, q) => {
            const qCoord = q - 10;
            const rCoord = r - 10;
            const pos = calculatePosition(qCoord, rCoord, hexSize);
            
            const isOccupied = board.some(p => p.q === qCoord && p.r === rCoord);
            
            // Only show placement highlights if we're not moving a piece
            const validPlace = !selectedPiece && selectedType && 
              !isOccupied &&
              canPlace(board, qCoord, rCoord, selectedType, currentPlayer, turn);

            // Find if this is a valid move destination
            const validMove = selectedPiece && validMoves.find(move => 
              move.q === qCoord && move.r === rCoord
            );

            // Determine if this is a beetle climbing move
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
                onClick={() => onHexClick(qCoord, rCoord)}
              />
            );
          })
        )}
        </svg>
        
        {/* Piece rendering remains the same */}
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
            onClick={() => onPieceClick(piece)}
          />
        ))}
      </div>
    );
};

export default GameBoard;