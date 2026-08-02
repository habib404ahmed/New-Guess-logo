// Cloudinary Upload Utility for Unsigned Uploads
// Cloud Name: vjqnrvyr
// Upload Preset: freshers_upload
// API Endpoint: https://api.cloudinary.com/v1_1/vjqnrvyr/auto/upload

export interface UploadOptions {
  onProgress?: (progressPercent: number) => void;
}

/**
 * Uploads a File (Image or Video) directly to Cloudinary using unsigned upload preset
 * @param file File object (PNG, JPG, MP4, WEBM, MOV, etc.)
 * @param options Optional progress callback
 * @returns Promise<string> Returns the permanent HTTPS Cloudinary secure_url
 */
export const uploadToCloudinary = async (
  file: File,
  options?: UploadOptions
): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'freshers_upload');

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const targetUrl = 'https://api.cloudinary.com/v1_1/vjqnrvyr/auto/upload';
    
    xhr.open('POST', targetUrl);

    if (options?.onProgress && xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          options.onProgress?.(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.secure_url) {
            console.log('✅ Cloudinary Upload Success! secure_url:', response.secure_url);
            resolve(response.secure_url);
          } else {
            console.error('❌ Cloudinary Response Error: Missing secure_url in response payload:', response);
            reject(new Error('Cloudinary response missing secure_url field'));
          }
        } catch (err) {
          console.error('❌ Cloudinary JSON Parsing Error:', err, xhr.responseText);
          reject(new Error('Failed to parse Cloudinary response JSON'));
        }
      } else {
        console.error(`❌ Cloudinary Upload Failed with HTTP status ${xhr.status}:`, xhr.responseText);
        reject(new Error(`Cloudinary upload failed with HTTP status ${xhr.status}`));
      }
    };

    xhr.onerror = () => {
      console.error('❌ Cloudinary Network/CORS Error during upload to:', targetUrl);
      reject(new Error('Network or CORS error occurred during Cloudinary upload'));
    };

    xhr.send(formData);
  });
};
