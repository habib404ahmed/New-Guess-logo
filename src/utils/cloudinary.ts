// Cloudinary Upload Utility for Unsigned Uploads
// Cloud Name: vjqnrvyr
// Upload Preset: freshers_upload

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
  console.log('----------------------------------------------------');
  console.log('Uploading file:', file.name);
  console.log('File type:', file.type);
  console.log('File size:', file.size);

  const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|m4v|avi|mkv)$/i.test(file.name);
  
  // Try auto/upload first, then video/upload as fallback for maximum compatibility
  const endpoints = isVideo
    ? [
        'https://api.cloudinary.com/v1_1/vjqnrvyr/auto/upload',
        'https://api.cloudinary.com/v1_1/vjqnrvyr/video/upload',
      ]
    : [
        'https://api.cloudinary.com/v1_1/vjqnrvyr/auto/upload',
        'https://api.cloudinary.com/v1_1/vjqnrvyr/image/upload',
      ];

  let lastError: Error | null = null;

  for (const targetUrl of endpoints) {
    try {
      console.log('Attempting Cloudinary upload to:', targetUrl);

      const secureUrl = await new Promise<string>((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'freshers_upload');

        const xhr = new XMLHttpRequest();
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
              console.log('Cloudinary response:', response);
              if (response.secure_url) {
                console.log('✅ Upload Succeeded! secure_url:', response.secure_url);
                resolve(response.secure_url);
              } else {
                reject(new Error('Cloudinary response missing secure_url field'));
              }
            } catch (err) {
              reject(new Error('Failed to parse Cloudinary response JSON'));
            }
          } else {
            console.error(`Cloudinary upload failed on ${targetUrl} (HTTP ${xhr.status}):`, xhr.responseText);
            reject(new Error(`Cloudinary upload failed (HTTP ${xhr.status}): ${xhr.responseText}`));
          }
        };

        xhr.onerror = () => {
          reject(new Error('Network or CORS error occurred during Cloudinary upload'));
        };

        xhr.send(formData);
      });

      return secureUrl;
    } catch (err: any) {
      lastError = err;
      console.warn(`Endpoint ${targetUrl} failed, trying fallback...`, err);
    }
  }

  throw lastError || new Error('All Cloudinary upload endpoints failed');
};
