import React from "react";
import { AiOutlineZoomIn, AiOutlineZoomOut } from "react-icons/ai";

const GameStatus = ({
  currentPlayer,
  turn,
  playerColors,
  onPassTurn,
  onForfeit,
  onZoomIn,
  onZoomOut,
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-800 text-white rounded-lg shadow-lg">
      {/* Player Turn Section */}
      <div className="flex items-center gap-4">
        <div
          className="w-6 h-6 rounded-full shadow-md"
          style={{
            backgroundColor:
              currentPlayer === 1 ? playerColors[1] : playerColors[2],
          }}
        ></div>
        <p className="text-lg font-semibold">
          Player {currentPlayer}'s Turn{" "}
          <span className="text-sm font-light">(Turn {turn})</span>
        </p>
      </div>

      {/* Action Buttons Section */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPassTurn}
          className="px-4 py-2 bg-yellow-400 text-sm font-medium rounded-md hover:bg-yellow-500 transition transform hover:scale-105 shadow-sm"
        >
          Pass Turn
        </button>
        <button
          onClick={onForfeit}
          className="px-4 py-2 bg-red-500 text-sm font-medium rounded-md hover:bg-red-600 transition transform hover:scale-105 shadow-sm"
        >
          Forfeit
        </button>
      </div>

      {/* Zoom Controls Section */}
      <div className="flex items-center gap-2">
        <button
          onClick={onZoomOut}
          className="flex items-center justify-center w-10 h-10 bg-gray-700 rounded-full shadow-md hover:bg-gray-600 transition transform hover:scale-110"
          title="Zoom Out"
        >
          <AiOutlineZoomOut className="text-2xl text-white" />
        </button>
        <button
          onClick={onZoomIn}
          className="flex items-center justify-center w-10 h-10 bg-gray-700 rounded-full shadow-md hover:bg-gray-600 transition transform hover:scale-110"
          title="Zoom In"
        >
          <AiOutlineZoomIn className="text-2xl text-white" />
        </button>
      </div>
    </div>
  );
};

export default GameStatus;
