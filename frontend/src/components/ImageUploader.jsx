import React, { useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ImageUploader = ({ onUpload, accept = 'image/*, .heic, .heif', multiple = false, label = 'Upload Image', enableBackgroundRemoval = false }) => {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [removeBackground, setRemoveBackground] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!multiple && files.length > 1) {
      toast.error('Please select only one file');
      return;
    }

    // Process files (convert HEIC if needed)
    const processedFiles = [];
    setConverting(true);

    //Helper function to remove background
    const applyBackgroundRemoval = async (file) => {
      toast.loading('Removing background...', { id: 'bg-remove' });

      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:8000/remove-background', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Background removal failed');
      }

      const blob = await response.blob();
      const bgRemovedFile = new File(
        [blob],
        file.name.replace(/\.(jpg|jpeg|png)$/i, '_nobg.png'),
        { type: 'image/png' }
      );

      toast.success('Background removed!', { id: 'bg-remove' });
      return bgRemovedFile;
    };

    try {
      for (const file of Array.from(files)) {
        // Check for HEIC/HEIF
        const isHeic = file.type === 'image/heic' ||
          file.type === 'image/heif' ||
          file.name.toLowerCase().endsWith('.heic') ||
          file.name.toLowerCase().endsWith('.heif');

        if (isHeic) {
          try {
            toast.loading('Converting iPhone photo...', { id: 'heic-convert' });

            // Send to backend for conversion
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('http://localhost:8000/convert-image', {
              method: 'POST',
              body: formData,
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.details || 'Conversion failed on server');
            }

            const blob = await response.blob();
            let convertedFile = new File(
              [blob],
              file.name.replace(/\.(heic|heif)$/i, '.jpg'),
              { type: 'image/jpeg' }
            );

            console.log(`Converted HEIC: ${file.size} -> ${convertedFile.size} bytes`);

            // Apply background removal if enabled
            if (removeBackground && enableBackgroundRemoval) {
              convertedFile = await applyBackgroundRemoval(convertedFile);
            }

            processedFiles.push(convertedFile);
            toast.success('Photo converted!', { id: 'heic-convert' });
          } catch (err) {
            console.error('HEIC conversion failed:', err);
            toast.error(`Could not convert iPhone photo: ${err.message}`, { id: 'heic-convert' });
            continue;
          }
        } else if (file.type.startsWith('image/')) {
          // Apply background removal if enabled
          if (removeBackground && enableBackgroundRemoval) {
            try {
              const bgRemovedFile = await applyBackgroundRemoval(file);
              processedFiles.push(bgRemovedFile);
            } catch (err) {
              console.error('Background removal failed:', err);
              toast.error('Background removal failed. Using original image.');
              processedFiles.push(file);
            }
          } else {
            processedFiles.push(file);
          }
        } else {
          toast.error(`${file.name} is not an image file`);
        }
      }
    } finally {
      setConverting(false);
    }

    if (processedFiles.length === 0) return;

    // Show preview for single file
    if (!multiple && processedFiles.length === 1) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(processedFiles[0]);
    }

    // Upload files
    setUploading(true);
    try {
      await onUpload(multiple ? processedFiles : processedFiles[0]);
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
    <div className="w-full space-y-4">
      {enableBackgroundRemoval && (
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={removeBackground}
            onChange={(e) => setRemoveBackground(e.target.checked)}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700 font-medium">Remove background automatically</span>
        </label>
      )}

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
            style={{ backgroundColor: 'transparent' }}
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
          className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition ${uploading || converting
              ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
              : 'border-primary-300 bg-primary-50 hover:bg-primary-100'
            }`}
        >
          {uploading || converting ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
              <p className="mt-4 text-sm text-gray-600">
                {converting ? 'Processing image...' : 'Uploading...'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-12 h-12 text-primary-600" />
              <p className="mt-4 text-lg font-medium text-gray-700">{label}</p>
              <p className="mt-2 text-sm text-gray-500">
                {multiple ? 'Click to select multiple images' : 'Click to select an image'}
              </p>
              <p className="mt-1 text-xs text-gray-400">PNG, JPG, HEIC up to 10MB</p>
            </div>
          )}
        </label>
      )}
    </div>
  );
};

export default ImageUploader;
