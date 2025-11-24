import React from 'react';
import { X } from 'lucide-react';

const ClothingGrid = ({ items, onSelect, onDelete, selectedItem, type = 'Clothing' }) => {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No {type.toLowerCase()} items yet</p>
        <p className="text-sm text-gray-400 mt-2">Upload some items to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item, index) => {
        if (!item || !item.url) {
          console.error('Invalid item at index', index, item);
          return null;
        }
        
        return (
          <div
            key={item.url || index}
            className={`relative group cursor-pointer rounded-lg overflow-hidden shadow-md transition ${
              selectedItem?.url === item.url
                ? 'ring-4 ring-primary-500 scale-105'
                : 'hover:scale-105'
            }`}
            onClick={() => onSelect && onSelect(item)}
          >
            <div className="aspect-square">
              <img
                src={item.url}
                alt={`${type} ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  console.error('Image failed to load:', item.url);
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage Error%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>

            {/* Delete button */}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item);
                }}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600 touch-feedback"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Selected indicator */}
            {selectedItem?.url === item.url && (
              <div className="absolute inset-0 bg-primary-500 bg-opacity-20 flex items-center justify-center">
                <div className="bg-white rounded-full p-2">
                  <svg
                    className="w-6 h-6 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ClothingGrid;
