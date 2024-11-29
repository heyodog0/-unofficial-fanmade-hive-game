// components/GameStatus.jsx
import React from 'react';

const GameStatus = ({ currentPlayer, turn, hasLost, queenPlaced }) => {
  return (
    <div className="mb-4">
      <h2 className="text-xl mb-2">Player {currentPlayer}'s Turn (Turn {turn})</h2>
      {hasLost(1) && <h3>Player 2 Wins!</h3>}
      {hasLost(2) && <h3>Player 1 Wins!</h3>}
      {turn > 6 && !queenPlaced && <h3>Must place Queen by turn 4!</h3>}
    </div>
  );
};

export default GameStatus;