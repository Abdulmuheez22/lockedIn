import cloudinary from "cloudinary";
import type { UploadApiResponse } from "cloudinary";

export const uploadToCloudinary = (
  buffer: Buffer,
  folder: string
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "auto", folder },
      (error, result) => {
        // 1. if there's an error → ?
        // 2. if there's no result → ?
        // 3. otherwise → ?
      }
    );

    // 4. how does the buffer get into the stream?
  });
};