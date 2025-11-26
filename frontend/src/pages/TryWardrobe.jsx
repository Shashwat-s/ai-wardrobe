import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWardrobe } from '../firebase/firestore';
import { generateTryOn } from '../api/tryonApi';
import Navbar from '../components/Navbar';
import ClothingGrid from '../components/ClothingGrid';
import SelectedClothingBadge from '../components/SelectedClothingBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Save, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { saveOutfit } from '../firebase/firestore';
import { uploadFile } from '../firebase/storage';

const TryWardrobe = () => {
  const { currentUser, userProfile } = useAuth();
  const [wardrobe, setWardrobe] = useState({ topwear: [], bottomwear: [] });
  const [selectedTop, setSelectedTop] = useState(null);
  const [selectedBottom, setSelectedBottom] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [originalProfilePhoto, setOriginalProfilePhoto] = useState(null); // Store original photo URL
  const [activeTab, setActiveTab] = useState('topwear');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [instructions, setInstructions] = useState(''); // Custom styling instructions
  const navigate = useNavigate();

  useEffect(() => {
    loadWardrobe();
    // Store and set initial preview to user's profile photo
    if (userProfile?.profilePhotoURL) {
      setOriginalProfilePhoto(userProfile.profilePhotoURL);
      setPreviewImage(userProfile.profilePhotoURL);
    }
  }, [currentUser, userProfile]);

  const loadWardrobe = async () => {
    try {
      const data = await getWardrobe(currentUser.uid);
      setWardrobe(data);
      
      if (data.topwear.length === 0 || data.bottomwear.length === 0) {
        toast.error('Please upload wardrobe items first');
        navigate('/upload-wardrobe');
      }
    } catch (error) {
      console.error('Error loading wardrobe:', error);
      toast.error('Failed to load wardrobe');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectClothing = (item, type) => {
    // Just update selection, don't generate yet
    if (type === 'topwear') {
      setSelectedTop(item);
    } else {
      setSelectedBottom(item);
    }
  };

  const handleGenerate = async () => {
    if (generating) {
      toast.error('Please wait for current try-on to complete');
      return;
    }

    if (!selectedTop && !selectedBottom) {
      toast.error('Please select at least one clothing item');
      return;
    }

    setGenerating(true);
    try {
      // Always use the original profile photo, never the generated preview
      const personImage = originalProfilePhoto || userProfile?.profilePhotoURL;
      
      if (!personImage) {
        toast.error('No profile photo found. Please upload a profile photo first.');
        navigate('/upload-profile-photo');
        return;
      }

      // Ensure we're using a real URL, not a base64 data URI
      if (personImage.startsWith('data:')) {
        toast.error('Please upload a profile photo from your wardrobe page');
        navigate('/upload-profile-photo');
        return;
      }

      console.log('Generating try-on with:');
      console.log('  Top:', selectedTop?.url);
      console.log('  Bottom:', selectedBottom?.url);
      console.log('  Person:', personImage);
      console.log('  Instructions:', instructions);

      let result;

      // Case 1: Both topwear and bottomwear selected
      if (selectedTop && selectedBottom) {
        toast('Applying topwear...', { icon: '👕' });
        const withTop = await generateTryOn(
          personImage,
          selectedTop.url,
          'upper',
          instructions
        );

        if (!withTop) {
          toast.error('Failed to apply topwear');
          return;
        }

        // Apply bottomwear to the result
        toast('Applying bottomwear...', { icon: '👖' });
        result = await generateTryOn(
          withTop,
          selectedBottom.url,
          'lower',
          instructions
        );
        
        if (result) {
          toast.success('Complete outfit generated! 🎉');
        }
      } 
      // Case 2: Only topwear selected
      else if (selectedTop) {
        toast('Applying topwear...', { icon: '👕' });
        result = await generateTryOn(
          personImage,
          selectedTop.url,
          'upper',
          instructions
        );
        if (result) {
          toast.success('Topwear applied! 👕');
        }
      } 
      // Case 3: Only bottomwear selected
      else if (selectedBottom) {
        toast('Applying bottomwear...', { icon: '👖' });
        result = await generateTryOn(
          personImage,
          selectedBottom.url,
          'lower',
          instructions
        );
        if (result) {
          toast.success('Bottomwear applied! 👖');
        }
      }

      if (!result) {
        toast.error('Failed to generate try-on');
        return;
      }

      setPreviewImage(result);
    } catch (error) {
      console.error('Try-on error:', error);
      toast.error(error.message || 'Failed to generate try-on');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveOutfit = async () => {
    if (!selectedTop && !selectedBottom) {
      toast.error('Please select at least one clothing item');
      return;
    }

    if (!previewImage) {
      toast.error('No outfit preview to save');
      return;
    }

    setSaving(true);
    try {
      // Convert preview URL to blob if it's a data URL
      let outputUrl = previewImage;
      
      if (previewImage.startsWith('data:')) {
        const response = await fetch(previewImage);
        const blob = await response.blob();
        const fileName = `outfit_${Date.now()}.jpg`;
        const path = `users/${currentUser.uid}/outfits/${fileName}`;
        outputUrl = await uploadFile(blob, path);
      }

      await saveOutfit(currentUser.uid, {
        topwear_url: selectedTop?.url || '',
        bottomwear_url: selectedBottom?.url || '',
        output_image_url: outputUrl,
      });

      toast.success('Outfit saved!');
      navigate('/saved-outfits');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save outfit');
    } finally {
      setSaving(false);
    }
  };

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
      
      {/* Mobile-First Layout */}
      <div className="max-w-7xl mx-auto px-4 py-4 pb-24 md:pb-8">
        {/* Desktop: Split Screen | Mobile: Stacked */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Side: Preview (Mobile: Top, Desktop: Left) */}
          <div className="w-full md:w-1/2 lg:w-2/5">
            <div className="sticky top-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Preview</h2>
              
              {/* Preview Image */}
              <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden aspect-[3/4] mb-4">
                {generating ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full spinner mx-auto" />
                      <p className="mt-4 text-gray-600 font-medium">Generating try-on...</p>
                      <p className="text-sm text-gray-500">This may take a moment</p>
                    </div>
                  </div>
                ) : previewImage ? (
                  <img
                    key={previewImage.substring(0, 50)} // Force re-render on change
                    src={previewImage}
                    alt="Try-on preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image failed to load:', previewImage.substring(0, 100));
                      toast.error('Failed to display image');
                    }}
                    onLoad={() => console.log('Image loaded successfully')}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="text-center p-6">
                      <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">Select clothing to try on</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Selected Items Display */}
              <div className="space-y-3 mb-4">
                <SelectedClothingBadge
                  item={selectedTop}
                  label="Selected Topwear"
                  onClear={() => setSelectedTop(null)}
                />
                <SelectedClothingBadge
                  item={selectedBottom}
                  label="Selected Bottomwear"
                  onClear={() => setSelectedBottom(null)}
                />
              </div>

              {/* Styling Instructions */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Styling Instructions (Optional)
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="E.g., 'Keep the shirt untucked', 'Drape the saree elegantly', 'Make it formal style'..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  rows={3}
                  disabled={generating}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Add specific instructions to control how the outfit should look
                </p>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={(!selectedTop && !selectedBottom) || generating}
                className="w-full flex items-center justify-center space-x-2 bg-primary-600 text-white py-4 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg touch-feedback mb-4"
              >
                <Sparkles className="w-5 h-5" />
                <span>{generating ? 'Generating...' : 'Generate Try-On'}</span>
              </button>

              {/* Save Button */}
              <button
                onClick={handleSaveOutfit}
                disabled={(!selectedTop && !selectedBottom) || !previewImage || saving || generating}
                className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-4 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg touch-feedback"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full spinner" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Outfit</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Side: Clothing Selection (Mobile: Bottom, Desktop: Right) */}
          <div className="w-full md:w-1/2 lg:w-3/5">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Wardrobe</h2>
            
            {/* Tabs */}
            <div className="flex space-x-2 mb-6 bg-white rounded-lg p-1 shadow-md">
              <button
                onClick={() => setActiveTab('topwear')}
                className={`flex-1 py-3 px-4 rounded-md font-medium transition touch-feedback ${
                  activeTab === 'topwear'
                    ? 'bg-primary-600 text-white shadow'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Topwear
              </button>
              <button
                onClick={() => setActiveTab('bottomwear')}
                className={`flex-1 py-3 px-4 rounded-md font-medium transition touch-feedback ${
                  activeTab === 'bottomwear'
                    ? 'bg-primary-600 text-white shadow'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Bottomwear
              </button>
            </div>

            {/* Clothing Grid - Scrollable on mobile */}
            <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
              {activeTab === 'topwear' ? (
                <div className="md:max-h-[600px] md:overflow-y-auto">
                  <ClothingGrid
                    items={wardrobe.topwear}
                    onSelect={(item) => handleSelectClothing(item, 'topwear')}
                    selectedItem={selectedTop}
                    type="Topwear"
                  />
                </div>
              ) : (
                <div className="md:max-h-[600px] md:overflow-y-auto">
                  <ClothingGrid
                    items={wardrobe.bottomwear}
                    onSelect={(item) => handleSelectClothing(item, 'bottomwear')}
                    selectedItem={selectedBottom}
                    type="Bottomwear"
                  />
                </div>
              )}
            </div>

            {/* Help Text */}
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Select items from each category to create your outfit. 
                The AI will generate a realistic try-on preview.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TryWardrobe;
