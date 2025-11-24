import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateUser } from '../firebase/firestore';
import { uploadFile, generateUniqueFileName } from '../firebase/storage';
import ImageUploader from '../components/ImageUploader';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { ArrowRight } from 'lucide-react';

const UploadProfilePhoto = () => {
  const { currentUser, userProfile, setUserProfile } = useAuth();
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (userProfile?.profilePhotoURL) {
      setCurrentPhoto(userProfile.profilePhotoURL);
    }
  }, [userProfile]);

  const handleUpload = async (file) => {
    try {
      const fileName = generateUniqueFileName(file.name);
      const path = `users/${currentUser.uid}/profile/${fileName}`;
      
      const downloadURL = await uploadFile(file, path);
      
      // Update Firestore
      await updateUser(currentUser.uid, {
        profilePhotoURL: downloadURL,
      });

      // Update local state
      setUserProfile({
        ...userProfile,
        profilePhotoURL: downloadURL,
      });
      
      setCurrentPhoto(downloadURL);
      toast.success('Profile photo updated!');
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleContinue = () => {
    if (!currentPhoto) {
      toast.error('Please upload a full-body photo first');
      return;
    }
    navigate('/upload-wardrobe');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Upload Your Photo</h1>
          <p className="text-gray-600">
            Upload a full-body photo of yourself for the virtual try-on
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {currentPhoto ? (
            <div className="space-y-6">
              <div className="text-center">
                <img
                  src={currentPhoto}
                  alt="Profile"
                  className="w-full max-w-md mx-auto h-96 object-cover rounded-lg shadow-lg"
                />
                <p className="mt-4 text-sm text-gray-600">
                  Looking good! You can update this photo anytime.
                </p>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Upload a new photo</h3>
                <ImageUploader
                  onUpload={handleUpload}
                  label="Replace Photo"
                />
              </div>

              <button
                onClick={handleContinue}
                className="w-full flex items-center justify-center space-x-2 bg-primary-600 text-white py-4 rounded-lg font-medium hover:bg-primary-700 transition touch-feedback"
              >
                <span>Continue to Wardrobe</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <ImageUploader
                onUpload={handleUpload}
                label="Upload Full-Body Photo"
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Tips for best results:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Stand in good lighting</li>
                  <li>• Show your full body from head to toe</li>
                  <li>• Face the camera directly</li>
                  <li>• Wear fitted clothing</li>
                  <li>• Use a plain background if possible</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadProfilePhoto;
