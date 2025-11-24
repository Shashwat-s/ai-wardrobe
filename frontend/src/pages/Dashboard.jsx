import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getOutfits, deleteOutfit } from '../firebase/firestore';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Trash2, X } from 'lucide-react';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOutfit, setSelectedOutfit] = useState(null);

  useEffect(() => {
    loadOutfits();
  }, [currentUser]);

  const loadOutfits = async () => {
    try {
      const data = await getOutfits(currentUser.uid);
      setOutfits(data);
    } catch (error) {
      console.error('Error loading outfits:', error);
      toast.error('Failed to load outfits');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (outfitId) => {
    if (!confirm('Are you sure you want to delete this outfit?')) return;

    try {
      await deleteOutfit(currentUser.uid, outfitId);
      await loadOutfits();
      setSelectedOutfit(null);
      toast.success('Outfit deleted');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete outfit');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <LoadingSpinner text="Loading saved outfits..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Saved Outfits</h1>
          <p className="text-gray-600">
            Your collection of virtual try-on outfits
          </p>
        </div>

        {outfits.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block p-6 bg-white rounded-full shadow-lg mb-4">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <p className="text-gray-600 text-lg">No saved outfits yet</p>
            <p className="text-gray-500 text-sm mt-2">
              Try on some clothes and save your favorite combinations!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {outfits.map((outfit) => (
              <div
                key={outfit.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden card-hover cursor-pointer"
                onClick={() => setSelectedOutfit(outfit)}
              >
                <div className="aspect-[3/4]">
                  <img
                    src={outfit.output_image_url}
                    alt="Saved outfit"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-500">
                    {outfit.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently saved'}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(outfit.id);
                      }}
                      className="flex-1 flex items-center justify-center space-x-2 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition touch-feedback"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Screen Modal */}
      {selectedOutfit && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedOutfit(null)}
        >
          <button
            onClick={() => setSelectedOutfit(null)}
            className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100 transition touch-feedback z-10"
          >
            <X className="w-6 h-6 text-gray-800" />
          </button>

          <div className="relative max-w-2xl w-full max-h-[90vh] flex flex-col">
            <img
              src={selectedOutfit.output_image_url}
              alt="Outfit detail"
              className="w-full h-auto object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            
            <div className="mt-4 bg-white rounded-lg p-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-semibold text-gray-800 mb-3">Outfit Items</h3>
              <div className="flex gap-4">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Topwear</p>
                  <img
                    src={selectedOutfit.topwear_url}
                    alt="Top"
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Bottomwear</p>
                  <img
                    src={selectedOutfit.bottomwear_url}
                    alt="Bottom"
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                </div>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(selectedOutfit.id);
                }}
                className="w-full mt-4 flex items-center justify-center space-x-2 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition touch-feedback"
              >
                <Trash2 className="w-5 h-5" />
                <span className="font-medium">Delete Outfit</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
