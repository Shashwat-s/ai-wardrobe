import React from 'react';
import { X } from 'lucide-react';

const SelectedClothingBadge = ({ item, label, onClear }) => {
  if (!item) {
    return (
      <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg">
        <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
          <span className="text-gray-400 text-xs text-center">No {label}</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">Select {label}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-md border-2 border-primary-200 animate-fade-in">
      <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
        <img
          src={item.url}
          alt={label}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-gray-800 truncate">Selected</p>
      </div>
      {onClear && (
        <button
          onClick={onClear}
          className="p-1.5 hover:bg-gray-100 rounded-full transition touch-feedback"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
      )}
    </div>
  );
};

export default SelectedClothingBadge;
