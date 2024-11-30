// HexGrid.jsx
const HexGrid = ({ size, valid, validMove, onClick, position, isOccupied }) => {
    const { x, y } = position;
    
    const getFillColor = () => {
      // Only show valid move highlights (yellow) on empty spaces
      if (validMove && !isOccupied) return 'rgba(255, 255, 0, 0.3)';
      // Only show valid placement highlights (green) on empty spaces
      if (valid && !isOccupied) return 'rgba(0, 255, 0, 0.2)';
      return 'transparent';
    };
  
    const points = Array(6).fill().map((_, i) => {
      const angle = (i * 60 - 30) * Math.PI / 180;
      return `${x + size * Math.cos(angle)},${y + size * Math.sin(angle)}`;
    }).join(' ');
  
    return (
      <polygon
        points={points}
        fill={getFillColor()}
        stroke="#ddd"
        strokeWidth="0.5"
        opacity="1"
        className="cursor-pointer hover:opacity-80"
        onClick={onClick}
      />
    );
};
  
  export default HexGrid;