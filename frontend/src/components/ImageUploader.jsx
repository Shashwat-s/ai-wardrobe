import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

const ImageUploader = ({ onUpload, accept = 'image/*', multiple = false, label = 'Upload Image' }) => {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!multiple && files.length > 1) {
      toast.error('Please select only one file');
      return;
    }

    // Validate file types
    const validFiles = Array.from(files).filter((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Show preview for single file
    if (!multiple && validFiles.length === 1) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(validFiles[0]);
    }

    // Upload files
    setUploading(true);
    try {
      await onUpload(multiple ? validFiles : validFiles[0]);
      toast.success('Upload successful!');
      
      if (!multiple) {
        // Keep preview after successful upload
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Upload failed');
      setPreview(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
      />

      {preview && !multiple ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-64 object-cover rounded-lg shadow-lg"
          />
          <button
            onClick={clearPreview}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition touch-feedback"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <label
          htmlFor="file-upload"
          className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition ${
            uploading
              ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
              : 'border-primary-300 bg-primary-50 hover:bg-primary-100'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full spinner" />
              <p className="mt-4 text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-12 h-12 text-primary-600" />
              <p className="mt-4 text-lg font-medium text-gray-700">{label}</p>
              <p className="mt-2 text-sm text-gray-500">
                {multiple ? 'Click to select multiple images' : 'Click to select an image'}
              </p>
              <p className="mt-1 text-xs text-gray-400">PNG, JPG up to 10MB</p>
            </div>
          )}
        </label>
      )}
    </div>
  );
};

export default ImageUploader;
