"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import GameBoard from "../app/components/GameBoard";
import PieceSelector from "../app/components/PieceSelector";
import GameStatus from "../app/components/GameStatus";
import { 
  PIECES,
  hasLost,
  getGameState,
  countPieces,
  calculatePosition,
  getValidMoves,
  canPlace,
} from "../app/components/GameLogic";

const HiveGame = () => {
  const [board, setBoard] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [turn, setTurn] = useState(1);
  const [highlightedTiles, setHighlightedTiles] = useState([]);
  const [canMakeMove, setCanMakeMove] = useState(true);
  
  // Hex size state for zoom functionality
  const [hexSize, setHexSize] = useState(60);

  // Game Over State
  const [winner, setWinner] = useState(null); // null if the game is ongoing, otherwise 1 or 2

  const playerColors = {
    1: "rgb(59, 130, 246)", // Blue
    2: "rgb(239, 68, 68)"   // Red
  };

  const hasQueen = (player) => countPieces(board, "queen", player) > 0;
  const canMove = (player) => hasQueen(player);

  const boardState = useMemo(
    () => ({
      board,
      currentPlayer,
      turn,
      selectedType,
      selectedPiece
    }),
    [board, currentPlayer, turn, selectedType, selectedPiece]
  );

  const canMakeAnyMove = useCallback(() => {
    for (const [type, maxCount] of Object.entries(PIECES)) {
      const currentCount = countPieces(board, type, currentPlayer);
      if (currentCount < maxCount) {
        for (let q = -10; q <= 10; q++) {
          for (let r = -10; r <= 10; r++) {
            if (canPlace(board, q, r, type, currentPlayer, turn)) {
              return true;
            }
          }
        }
      }
    }

    if (hasQueen(currentPlayer)) {
      const playerPieces = board.filter((p) => p.p === currentPlayer);
      return playerPieces.some((piece) => {
        const moves = getValidMoves(board, piece, turn);
        return moves.length > 0;
      });
    }

    return false;
  }, [board, currentPlayer, turn, hasQueen]);

  useEffect(() => {
    const zoomLevel = window.innerWidth < 1200 ? "80%" : "100%";
    document.body.style.zoom = zoomLevel;
  }, []);

  useEffect(() => {
    setSelectedPiece(null);
    setSelectedType(null);
  }, [currentPlayer]);

  useEffect(() => {
    let canMove = false;

    if (boardState.selectedType) {
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
      canMakeAnyMove();
    }

    setCanMakeMove(canMove);
  }, [boardState, canMakeAnyMove]);

  // Check for game over condition
  useEffect(() => {
    const gameState = getGameState(board, turn); // Check if someone has won
    if (gameState === "PLAYER_1_WINS") {
      setWinner(1);
    } else if (gameState === "PLAYER_2_WINS") {
      setWinner(2);
    }
  }, [board, turn]);

  const handleForfeit = () => {
      setWinner(currentPlayer === 1 ? 2 : 1);
    setBoard([]);
    setSelectedPiece(null);
    setCurrentPlayer(1);
    setSelectedType(null);
    setTurn(1);
    setHighlightedTiles([]);
    setCanMakeMove(true);
    // setWinner(null);
  };

  // const resetGame = () => {
  //   setBoard([]);
  //   setSelectedPiece(null);
  //   setCurrentPlayer(1);
  //   setSelectedType(null);
  //   setTurn(1);
  //   setHighlightedTiles([]);
  //   setCanMakeMove(true);
  //   setWinner(null);
  //   setInitialTime(600); 
  //   setShowTimerSetup(true); 
  // };

  //im lazy
  const resetGame = () => {
    window.location.reload();
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-900 pb-24">
      {/* Overlay for Win Screen */}
      {winner && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-gray-800 text-center">
            <h1 className="text-3xl font-bold mb-4">
              Player {winner} Wins!
            </h1>
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-blue-500 text-white text-lg rounded-md hover:bg-blue-600 transition"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Game UI */}
      <div className="w-[800px] flex flex-col gap-0 z-0">
        <GameStatus 
          currentPlayer={currentPlayer}
          turn={turn}
          hasQueen={hasQueen}
          playerColors={playerColors}
          board={board}
          hasLost={hasLost}
          canMakeMove={canMakeMove}
          gameOver={!!winner}
          onPassTurn={() => {
            setCurrentPlayer((p) => (p === 1 ? 2 : 1));
            setTurn((t) => t + 1);
            setSelectedPiece(null);
            setSelectedType(null);
            setHighlightedTiles([]);
          }}
          onForfeit={handleForfeit}
          onZoomIn={() => setHexSize((prev) => Math.min(prev + 5, 100))}
          onZoomOut={() => setHexSize((prev) => Math.max(prev - 5, 20))}
    
        />

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

        <div
          className="relative aspect-square bg-white rounded-lg overflow-hidden"
          style={{ width: "800px", height: "800px" }}
        >
          <div className="absolute inset-0 origin-center scale-[1]">
            <GameBoard
              board={board}
              setBoard={setBoard}
              selectedPiece={selectedPiece}
              setSelectedPiece={setSelectedPiece}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              hexSize={hexSize}
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
