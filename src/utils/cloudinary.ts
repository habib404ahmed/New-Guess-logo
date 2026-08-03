// Cloudinary Upload Utility for Unsigned Uploads
// Cloud Name: vjqnrvyr
// Upload Preset: freshers_upload
// Endpoint: https://api.cloudinary.com/v1_1/vjqnrvyr/auto/upload

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
  // Step 1: File Information
  console.log('----------------------------------------------------');
  console.log('📌 STEP 1: File Selected for Upload');
  console.log('File Name:', file.name);
  console.log('File Size:', (file.size / (1024 * 1024)).toFixed(2) + ' MB');
  console.log('File Type:', file.type || 'Unknown (Detected by extension)');

  const targetUrl = 'https://api.cloudinary.com/v1_1/vjqnrvyr/auto/upload';

  // Step 2: Request Preparation
  console.log('📌 STEP 2: Cloudinary Request Config');
  console.log('Cloud Name:', 'vjqnrvyr');
  console.log('Upload Preset:', 'freshers_upload');
  console.log('Endpoint URL:', targetUrl);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'freshers_upload');

  return new Promise((resolve, reject) => {
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
      console.log('📌 STEP 3 & 4: Cloudinary Response Status:', xhr.status);

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          console.log('Cloudinary Response JSON:', response);
          console.log('secure_url:', response.secure_url);
          console.log('public_id:', response.public_id);
          console.log('asset_id:', response.asset_id);
          console.log('resource_type:', response.resource_type);

          if (response.secure_url) {
            console.log('✅ STEP 5: Upload Succeeded! Uploading metadata to Database...');
            resolve(response.secure_url);
          } else {
            console.error('❌ Cloudinary Error: Response missing secure_url field:', response);
            reject(new Error('Cloudinary response missing secure_url field'));
          }
        } catch (err) {
          console.error('❌ Cloudinary JSON Parse Error:', err, xhr.responseText);
          reject(new Error('Failed to parse Cloudinary response JSON'));
        }
      } else {
        console.error('❌ Cloudinary Upload Failed with COMPLETE Error Response Body:');
        console.error('HTTP Status:', xhr.status);
        console.error('Response Text:', xhr.responseText);
        reject(new Error(`Cloudinary upload failed (HTTP ${xhr.status}): ${xhr.responseText}`));
      }
    };

    xhr.onerror = () => {
      console.error('❌ Cloudinary Network/CORS Error during upload to:', targetUrl);
      reject(new Error('Network or CORS error occurred during Cloudinary upload'));
    };

    xhr.send(formData);
  });
};
