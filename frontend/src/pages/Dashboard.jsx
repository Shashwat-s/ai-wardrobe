import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getOutfits, getWardrobe } from '../firebase/firestore';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Camera, Sparkles, ShoppingBag, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const [wardrobe, setWardrobe] = useState({ topwear: [], bottomwear: [] });
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    try {
      const [wardrobeData, outfitsData] = await Promise.all([
        getWardrobe(currentUser.uid),
        getOutfits(currentUser.uid)
      ]);
      setWardrobe(wardrobeData);
      setOutfits(outfitsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const allClothes = [...wardrobe.topwear, ...wardrobe.bottomwear];
  const totalItems = allClothes.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <LoadingSpinner text="Loading your wardrobe..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            Welcome Back!
          </h1>
          <p className="text-gray-600 text-lg">
            Your personal AI wardrobe awaits
          </p>
        </div>

        {/* Revolving Wardrobe Circle */}
        <div className="relative w-full max-w-2xl mx-auto mb-16" style={{ aspectRatio: '1/1' }}>
          {/* Center Profile Photo */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="relative">
              <div className="w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden shadow-2xl border-4 border-white ring-4 ring-purple-200">
                {userProfile?.profilePhotoURL ? (
                  <img
                    src={userProfile.profilePhotoURL}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                    <Camera className="w-20 h-20 text-white" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-3 shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Revolving Clothes Circle */}
          {totalItems > 0 && (
            <div className="absolute inset-0 animate-spin-slow">
              {allClothes.map((item, index) => {
                const angle = (360 / totalItems) * index;
                const radius = 45; // percentage from center
                const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
                const y = 50 + radius * Math.sin((angle * Math.PI) / 180);

                return (
                  <div
                    key={item.id || index}
                    className="absolute w-16 h-16 md:w-24 md:h-24 transform -translate-x-1/2 -translate-y-1/2 animate-float"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      animationDelay: `${index * 0.1}s`,
                    }}
                  >
                    <div className="relative group">
                      <div className="w-full h-full rounded-2xl overflow-hidden shadow-lg bg-white p-2 transform transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:z-20">
                        <img
                          src={item.url}
                          alt={item.name || 'Clothing item'}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      {/* Tooltip on hover */}
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {item.name || 'Item'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {totalItems === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No wardrobe items yet</p>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center transform hover:scale-105 transition">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <ShoppingBag className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-2">{totalItems}</h3>
            <p className="text-gray-600">Wardrobe Items</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 text-center transform hover:scale-105 transition">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-4">
              <Heart className="w-8 h-8 text-pink-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-2">{outfits.length}</h3>
            <p className="text-gray-600">Saved Outfits</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 text-center transform hover:scale-105 transition">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-2">AI</h3>
            <p className="text-gray-600">Powered Try-On</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => navigate('/try-wardrobe')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl shadow-lg p-8 text-left transform hover:scale-105 transition group"
          >
            <Sparkles className="w-12 h-12 mb-4 group-hover:rotate-12 transition" />
            <h3 className="text-2xl font-bold mb-2">Try Outfits</h3>
            <p className="text-purple-100">
              Mix and match your wardrobe with AI-powered virtual try-on
            </p>
          </button>

          <button
            onClick={() => navigate('/saved-outfits')}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl shadow-lg p-8 text-left transform hover:scale-105 transition group"
          >
            <Heart className="w-12 h-12 mb-4 group-hover:scale-110 transition" />
            <h3 className="text-2xl font-bold mb-2">Saved Outfits</h3>
            <p className="text-blue-100">
              View and manage your favorite outfit combinations
            </p>
          </button>
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translate(-50%, -50%) translateY(0px);
          }
          50% {
            transform: translate(-50%, -50%) translateY(-10px);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 30s linear infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
