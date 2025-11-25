import apiClient from './client';

/**
 * Call the try-on API endpoint
 * @param {string} personImageUrl - URL of the person's image
 * @param {string} clothingImageUrl - URL of the clothing item
 * @param {string} type - Type of clothing ('upper' or 'lower')
 * @returns {Promise<string>} - URL of the generated image
 */
export const generateTryOn = async (personImageUrl, clothingImageUrl, type) => {
  try {
    console.log('Sending try-on request:', { personImageUrl, clothingImageUrl, type });
    
    const response = await apiClient.post('/tryon', {
      person_image_url: personImageUrl,
      clothing_image_url: clothingImageUrl,
      type: type,
    });

    console.log('Try-on response:', response.data);

    if (!response.data.output_url) {
      console.error('Response missing output_url:', response.data);
      throw new Error('No output URL received from server');
    }

    return response.data.output_url;
  } catch (error) {
    console.error('Error calling try-on API:', error);
    console.error('Error response:', error.response?.data);
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.detail || 
      error.message || 
      'Failed to generate try-on image'
    );
  }
};

/**
 * Health check endpoint
 */
export const healthCheck = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};
