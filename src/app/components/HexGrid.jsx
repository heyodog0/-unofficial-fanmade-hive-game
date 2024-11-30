import React from 'react';

const HexGrid = ({ 
  size,
  position,
  valid,        // for new piece placement (green)
  validMove,    // for existing piece movement (yellow)
  onClick
}) => {
  const { x, y } = position;

  // Simplest possible highlight logic
  const highlightColor = validMove 
    ? 'rgba(255, 255, 0, 0.3)'  // yellow for moves
    : valid 
      ? 'rgba(0, 255, 0, 0.2)'  // green for placement
      : 'transparent';

  const points = Array(6).fill().map((_, i) => {
    const angle = (i * 60 - 30) * Math.PI / 180;
    return `${x + size * Math.cos(angle)},${y + size * Math.sin(angle)}`;
  }).join(' ');

  return (
    <polygon
      points={points}
      fill={highlightColor}
      stroke="#ddd"
      strokeWidth="0.05"
      className="cursor-pointer transition-colors duration-200 hover:opacity-80"
      onClick={onClick}
    />
  );
};

export default HexGrid;