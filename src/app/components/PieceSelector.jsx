// components/PieceSelector.jsx
import React from 'react';
import { Crown, Bug, Spider, Grasshopper, Ant, Plus, Move } from 'lucide-react';

const PieceIcons = {
  queen: Crown,
  beetle: Bug,
  spider: Spider,
  grasshopper: Grasshopper,
  ant: Ant
};

const PieceSelector = ({ pieces, selectedType, onSelect, isPlacingNew }) => {
  if (!isPlacingNew) return null;
  
  return (
    <div className="flex gap-2 mb-4">
      {Object.entries(pieces).map(([name, maxCount]) => {
        const Icon = PieceIcons[name];
        const count = pieces[name];
        return (
          <button
            key={name}
            onClick={() => onSelect(name)}
            disabled={count === 0}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all
              ${selectedType === name 
                ? 'bg-blue-500 text-white shadow-lg scale-105' 
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}
              ${count === 0 ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <Icon size={20} />
            <span className="capitalize">{name}</span>
            <span className="text-sm opacity-75">
              ({count} left)
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default PieceSelector;