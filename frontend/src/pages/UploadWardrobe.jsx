import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { saveWardrobeItem, saveWardrobeItems, getWardrobe, deleteWardrobeItem } from '../firebase/firestore';
import { uploadFile, generateUniqueFileName, deleteFile } from '../firebase/storage';
import Navbar from '../components/Navbar';
import ImageUploader from '../components/ImageUploader';
import ClothingGrid from '../components/ClothingGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { ArrowRight, Shirt } from 'lucide-react';

const UploadWardrobe = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('topwear');
  const [wardrobe, setWardrobe] = useState({ topwear: [], bottomwear: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadWardrobe();
  }, [currentUser]);

  const loadWardrobe = async () => {
    try {
      const data = await getWardrobe(currentUser.uid);
      console.log('Loaded wardrobe data:', data);
      setWardrobe({
        topwear: Array.isArray(data?.topwear) ? data.topwear : [],
        bottomwear: Array.isArray(data?.bottomwear) ? data.bottomwear : [],
      });
    } catch (error) {
      console.error('Error loading wardrobe:', error);
      toast.error('Failed to load wardrobe');
      setWardrobe({ topwear: [], bottomwear: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (files) => {
    const fileArray = Array.isArray(files) ? files : [files];

    try {
      // First, upload all files to storage with background removal
      const uploadPromises = fileArray.map(async (file) => {
        const fileName = generateUniqueFileName(file.name);
        const path = `users/${currentUser.uid}/wardrobe/${activeTab}/${fileName}`;
        // Enable background removal for wardrobe items
        const downloadURL = await uploadFile(file, path, true);
        return { url: downloadURL };
      });

      const uploadedItems = await Promise.all(uploadPromises);

      // Then save all items to Firestore in a single batch operation
      await saveWardrobeItems(currentUser.uid, activeTab, uploadedItems);

      await loadWardrobe();
      toast.success(`${fileArray.length} item(s) uploaded with background removed!`);
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleDelete = async (item) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await deleteFile(item.url);
      await deleteWardrobeItem(currentUser.uid, activeTab, item.url);
      await loadWardrobe();
      toast.success('Item deleted');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete item');
    }
  };

  const handleContinue = () => {
    if (wardrobe.topwear.length === 0 || wardrobe.bottomwear.length === 0) {
      toast.error('Please upload at least one topwear and one bottomwear item');
      return;
    }
    navigate('/try-wardrobe');
  };

  const totalItems = wardrobe.topwear.length + wardrobe.bottomwear.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <LoadingSpinner text="Loading wardrobe..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Build Your Wardrobe</h1>
          <p className="text-gray-600">
            Upload photos of your clothing items
          </p>
          <div className="mt-2 text-sm text-primary-600 font-medium">
            {totalItems} items uploaded
          </div>
        </div>

        {/* Tab Selection */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => setActiveTab('topwear')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition touch-feedback ${activeTab === 'topwear'
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              Topwear ({wardrobe.topwear.length})
            </button>
            <button
              onClick={() => setActiveTab('bottomwear')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition touch-feedback ${activeTab === 'bottomwear'
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              Bottomwear ({wardrobe.bottomwear.length})
            </button>
          </div>

          <div className="mb-6">
            <ImageUploader
              onUpload={handleUpload}
              multiple
              enableBackgroundRemoval={false}
              label={`Upload ${activeTab === 'topwear' ? 'Tops' : 'Bottoms'}`}
            />
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">
              Your {activeTab === 'topwear' ? 'Tops' : 'Bottoms'}
            </h3>
            <ClothingGrid
              items={wardrobe[activeTab]}
              onDelete={handleDelete}
              type={activeTab === 'topwear' ? 'Topwear' : 'Bottomwear'}
            />
          </div>
        </div>

        {totalItems > 0 && (
          <button
            onClick={handleContinue}
            className="w-full flex items-center justify-center space-x-2 bg-primary-600 text-white py-4 rounded-lg font-medium hover:bg-primary-700 transition shadow-lg touch-feedback"
          >
            <Shirt className="w-5 h-5" />
            <span>Try On Outfits</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default UploadWardrobe;
