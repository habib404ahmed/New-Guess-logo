// Cloudinary Upload Utility for Unsigned Uploads
// Cloud Name: vjqnrvyr
// Upload Preset: freshers_upload
// Endpoints:
//   Videos: https://api.cloudinary.com/v1_1/vjqnrvyr/video/upload
//   Images: https://api.cloudinary.com/v1_1/vjqnrvyr/image/upload

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
  const resourceType = isVideo ? 'video' : 'image';
  const targetUrl = `https://api.cloudinary.com/v1_1/vjqnrvyr/${resourceType}/upload`;

  console.log('Resource Type:', resourceType);
  console.log('Target Endpoint URL:', targetUrl);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'freshers_upload');

  return new Promise<string>((resolve, reject) => {
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
};
