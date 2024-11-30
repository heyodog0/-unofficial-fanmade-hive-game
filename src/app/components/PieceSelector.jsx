// components/PieceSelector.jsx
import React from 'react';

const PieceSelector = ({ pieces, selectedType, onSelect, isPlacingNew, currentPlayer }) => {
    if (!isPlacingNew) return null;
  
    return (
      <div className="flex gap-2 mb-4">
        {Object.entries(pieces).map(([name, maxCount]) => {
          const count = pieces[name];
          const isDisabled = count === 0;
          
          return (
            <button
              key={name}
              onClick={() => onSelect(name)}
              disabled={isDisabled}
              className={`
                relative w-40 h-24 rounded-lg font-semibold transition-all
                ${selectedType === name 
                  ? 'bg-emerald-500 text-white scale-105 shadow-lg' 
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {/* Add an overlay div that sits on top and catches all clicks */}
              <div className="absolute inset-0 z-10" />
              
              <div className="flex flex-col items-center justify-center pointer-events-none">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <div className="w-full h-full pointer-events-none">
                    <Hexagon 
                      className="pointer-events-none"
                      size={100} 
                      color={currentPlayer === 1 ? 'rgb(59, 130, 246)' : 'rgb(239, 68, 68)'} 
                      fill={currentPlayer === 1 ? 'rgb(59, 130, 246)' : 'rgb(239, 68, 68)'} 
                      strokeWidth={.01} 
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-white pointer-events-none">
                      {/* {name === 'queen' && <Crown size={24} className="pointer-events-none" />}
                      {name === 'beetle' && <Bug size={24} className="pointer-events-none" />}
                      {name === 'spider' && <Spider size={24} className="pointer-events-none" />}
                      {name === 'grasshopper' && <Grasshopper size={24} className="pointer-events-none" />}
                      {name === 'ant' && <Ant size={24} className="pointer-events-none" />} */}
                    </div>
                  </div>
                </div>
                <span className="text-xs mt-1 capitalize pointer-events-none">{name}</span>
                <span className="text-xs opacity-75 pointer-events-none">({count} left)</span>
              </div>
            </button>
          );
        })}
      </div>
    );
  };
  
  export default PieceSelector;