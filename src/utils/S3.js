const {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const mime = require("mime-types");
require("dotenv").config();

// Initialize S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-west-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Uploads a single file to S3. Uses direct upload for files < 5MB and multipart upload for files ≥ 5MB.
 */
const uploadMultipart = async (file, folder, entityId) => {
  console.log(`Upload started for file: ${file.originalname}`);
  const startTime = Date.now();
  const fileName = `${folder}/${entityId}/${Date.now()}_${file.originalname}`;
  const fileSize = file.buffer.length;
  const contentType = file.mimetype || mime.lookup(file.originalname) || "application/octet-stream";

  if (fileSize < 5 * 1024 * 1024) {
    console.log("File size is less than 5MB, uploading directly...");
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: contentType,
    });

    await s3.send(uploadCommand);
    const endTime = Date.now();
    console.log(`File uploaded directly in ${(endTime - startTime) / 1000} seconds.`);
    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
  }

  console.log("File size is 5MB or more, using Multipart Upload...");
  const partSize = 5 * 1024 * 1024;
  const totalParts = Math.ceil(fileSize / partSize);

  const createUpload = new CreateMultipartUploadCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    ContentType: contentType,
  });

  const uploadResponse = await s3.send(createUpload);
  const uploadId = uploadResponse.UploadId;
  console.log(`Multipart upload initiated with UploadId: ${uploadId}`);

  try {
    const uploadPromises = [];
    for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
      const start = (partNumber - 1) * partSize;
      const end = Math.min(start + partSize, fileSize);
      const chunk = file.buffer.slice(start, end);

      const uploadPartCommand = new UploadPartCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        UploadId: uploadId,
        PartNumber: partNumber,
        Body: chunk,
      });

      console.log(`Uploading part ${partNumber}...`);
      uploadPromises.push(
        s3.send(uploadPartCommand).then((partUploadResponse) => ({
          ETag: partUploadResponse.ETag,
          PartNumber: partNumber,
        }))
      );
    }

    const uploadedParts = await Promise.all(uploadPromises);

    const completeUpload = new CompleteMultipartUploadCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      UploadId: uploadId,
      MultipartUpload: { Parts: uploadedParts },
    });

    await s3.send(completeUpload);
    const endTime = Date.now();
    console.log(`Multipart upload completed in ${(endTime - startTime) / 1000} seconds.`);
    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
  } catch (error) {
    console.error("Multipart Upload Error:", error);
    await s3.send(
      new AbortMultipartUploadCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        UploadId: uploadId,
      })
    );
    throw new Error("Multipart upload failed.");
  }
};

/**
 * Deletes a file from S3 based on its URL.
 */
const deleteFileFromS3 = async (fileUrl) => {
  try {
    const urlParts = new URL(fileUrl);
    const key = urlParts.pathname.substring(1);

    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    });

    await s3.send(deleteCommand);
    console.log("File deleted from S3:", fileUrl);
  } catch (error) {
    console.error("Error deleting file from S3:", error);
  }
};

/**
 * Uploads multiple files to S3 concurrently.
 * @param {Array<Object>} files - Array of file objects from multer (each with buffer, originalname, mimetype).
 * @param {string} folder - The S3 folder name (e.g., 'categories/<categoryId>/<subCategoryId>').
 * @param {string} entityId - The entity ID (e.g., itemId or itemId_colorId for color-specific images).
 * @returns {Promise<Array<Object>>} - Array of { originalname, url, error } objects for each file.
 */
const bulkUploadFilesToS3 = async (files, folder, entityId) => {
  console.log(`Starting bulk upload for ${files.length} files to folder: ${folder}`);
  const startTime = Date.now();

  // Process uploads concurrently with Promise.all
  const uploadPromises = files.map(async (file) => {
    try {
      const url = await uploadMultipart(file, folder, entityId);
      return { originalname: file.originalname, url, error: null };
    } catch (error) {
      console.error(`Failed to upload ${file.originalname}:`, error.message);
      return { originalname: file.originalname, url: null, error: error.message };
    }
  });

  const results = await Promise.all(uploadPromises);
  const endTime = Date.now();
  console.log(`Bulk upload completed in ${(endTime - startTime) / 1000} seconds.`);

  // Separate successful and failed uploads
  const successful = results.filter((result) => result.url);
  const failed = results.filter((result) => result.error);

  console.log(`Bulk upload summary: ${successful.length} succeeded, ${failed.length} failed`);

  return results;
};

/**
 * Parses an image filename to extract productId, colorId, and isPrimary.
 * Expected formats:
 * - Primary: <productId>_primary.<ext> (e.g., TSHIRT001_primary.jpg)
 * - Color-specific: <productId>_<colorId>_<index>.<ext> (e.g., TSHIRT001_red_01.jpg)
 * @param {string} filename - The image filename.
 * @returns {Object|null} - { productId, colorId, isPrimary, index } or null if invalid.
 */
const parseImageFilename = (filename) => {
  try {
    // Match primary image (e.g., TSHIRT001_primary.jpg)
    const primaryRegex = /^([^_]+)_primary\.\w+$/;
    const primaryMatch = filename.match(primaryRegex);
    if (primaryMatch) {
      return {
        productId: primaryMatch[1],
        colorId: null,
        isPrimary: true,
        index: 0,
      };
    }

    // Match color-specific image (e.g., TSHIRT001_red_01.jpg)
    const colorRegex = /^([^_]+)_([^_]+)_(\d+)\.\w+$/;
    const colorMatch = filename.match(colorRegex);
    if (colorMatch) {
      return {
        productId: colorMatch[1],
        colorId: colorMatch[2],
        isPrimary: false,
        index: parseInt(colorMatch[3], 10),
      };
    }

    console.warn(`Invalid filename format: ${filename}`);
    return null;
  } catch (error) {
    console.error(`Error parsing filename ${filename}:`, error.message);
    return null;
  }
};

/**
 * Cleans up failed uploads by deleting files from S3.
 * @param {Array<string>} fileUrls - Array of S3 URLs to delete.
 * @returns {Promise<void>}
 */
const cleanupFailedUploads = async (fileUrls) => {
  console.log(`Cleaning up ${fileUrls.length} failed uploads`);
  const deletePromises = fileUrls.map(async (fileUrl) => {
    try {
      await deleteFileFromS3(fileUrl);
    } catch (error) {
      console.error(`Failed to delete ${fileUrl}:`, error.message);
    }
  });
  await Promise.all(deletePromises);
  console.log("Cleanup completed");
};

module.exports = {
  uploadMultipart,
  deleteFileFromS3,
  bulkUploadFilesToS3,
  parseImageFilename,
  cleanupFailedUploads,
};