import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getOutfits, getWardrobe } from '../firebase/firestore';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Camera, Sparkles, ShoppingBag, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.scss';

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
      <div className="dashboard-container">
        <Navbar />
        <LoadingSpinner text="Loading your wardrobe..." />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Navbar />

      <div className="dashboard-content">
        {/* Welcome Section */}
        <div className="welcome-section">
          <h1>Welcome Back!</h1>
          <p>Your personal AI wardrobe awaits</p>
        </div>

        {/* Revolving Wardrobe Circle */}
        <div className="wardrobe-circle-container">
          {/* Center Profile Photo */}
          <div className="profile-photo-center">
            <div className="photo-wrapper">
              <div className="photo-frame">
                {userProfile?.profilePhotoURL ? (
                  <img
                    src={userProfile.profilePhotoURL}
                    alt="Profile"
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="placeholder-frame">
                    <Camera className="w-20 h-20 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Revolving Clothes Circle */}
          {totalItems > 0 && (
            <div className="revolving-clothes-circle">
              {allClothes.map((item, index) => {
                const angle = (360 / totalItems) * index;
                const radius = 45; // percentage from center
                const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
                const y = 50 + radius * Math.sin((angle * Math.PI) / 180);

                return (
                  <div
                    key={item.id || index}
                    className="clothing-item-wrapper"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      animationDelay: `${index * 0.1}s`,
                    }}
                  >
                    <div className="item-inner">
                      <div className="item-frame">
                        <img
                          src={item.url}
                          alt={item.name || 'Clothing item'}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {totalItems === 0 && (
            <div className="empty-state">
              <div className="empty-content">
                <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No wardrobe items yet</p>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="icon-wrapper purple">
              <ShoppingBag className="w-8 h-8 text-purple-600" />
            </div>
            <h3>{totalItems}</h3>
            <p>Wardrobe Items</p>
          </div>

          <div className="stat-card">
            <div className="icon-wrapper pink">
              <Heart className="w-8 h-8 text-pink-600" />
            </div>
            <h3>{outfits.length}</h3>
            <p>Saved Outfits</p>
          </div>

          <div className="stat-card">
            <div className="icon-wrapper blue">
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>
            <h3>AI</h3>
            <p>Powered Try-On</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-grid">
          <button
            onClick={() => navigate('/try-wardrobe')}
            className="action-button try-outfits"
          >
            <Sparkles className="w-12 h-12 action-icon" />
            <h3>Try Outfits</h3>
            <p>Mix and match your wardrobe with AI-powered virtual try-on</p>
          </button>

          <button
            onClick={() => navigate('/saved-outfits')}
            className="action-button saved-outfits"
          >
            <Heart className="w-12 h-12 action-icon" />
            <h3>Saved Outfits</h3>
            <p>View and manage your favorite outfit combinations</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
