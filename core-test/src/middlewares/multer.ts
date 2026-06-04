/*
 * Multer configuration for file upload handling
 *
 * This file configures Multer middleware for handling file uploads to AWS S3.
 * It provides type definitions for S3 file objects and sets up storage
 * configuration with appropriate file size limits and filters.
 *
 * Features:
 * - Direct uploads to AWS S3 using multer-s3
 * - Automatic file key generation with timestamps and user IDs
 * - Content-Type preservation from original files
 * - File size limitation (5MB)
 * - Support for all file types
 */

import multer from "multer";
import multerS3 from "multer-s3";
import { RequestWithUser } from "../types";
import { s3 } from "../s3Client";

/*
 * Extended Multer file interface for S3 uploads
 *
 * This interface extends the standard Express.Multer.File to include
 * S3-specific properties that are available when using multer-s3.
 */
export interface MulterS3File extends Express.Multer.File {
  location: string; // File URL in S3
  key: string; // File key/path in S3 bucket
  contentType: string; // MIME type of the file
}

/*
 * Multer upload configuration with S3 storage
 *
 * This configuration sets up Multer to upload files directly to AWS S3
 * with the following features:
 * - Automatic file key generation using timestamp and user ID
 * - Metadata preservation including field name
 * - Content-Type detection and preservation
 * - File size limits and filtering
 */
export const upload = multer({
  storage: multerS3({
    s3: s3, // S3 client instance
    bucket: process.env.AWS_BUCKET_NAME!, // S3 bucket name from environment
    /*
     * Metadata function - adds custom metadata to S3 object
     */
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    /*
     * Key generation function - creates unique file path in S3
     */
    key: (req: RequestWithUser, file, cb) => {
      // Generate unique key using timestamp and user ID for organization
      cb(null, `uploads/${Date.now()}-${req.user?.id ?? req.student?.id}`);
    },
    /*
     * Content-Type function - preserves original file MIME type
     */
    contentType: (req, file, cb) => {
      // Preserve original MIME type for proper file handling
      cb(null, file.mimetype);
    },
  }),
  limits: { fileSize: 1024 * 1024 * 1024 }, // 1GB file size limit
  /*
   * File filter function - determines which files are accepted
   * Currently allows all file types for maximum flexibility
   */
  fileFilter(req, file, callback) {
    // Allow all file types - can be customized for specific requirements
    callback(null, true);
  },
});

/*
 * Public Multer upload configuration with S3 storage (for unauthenticated uploads)
 *
 * This configuration sets up Multer to upload files directly to AWS S3 without requiring
 * user authentication. It generates unique file keys without user ID since there's
 * no authenticated user in the request.
 */
export const uploadPublic = multer({
  storage: multerS3({
    s3: s3, // S3 client instance
    bucket: process.env.AWS_BUCKET_NAME!, // S3 bucket name from environment
    /*
     * Metadata function - adds custom metadata to S3 object
     */
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    /*
     * Key generation function - creates unique file path in S3 (for public uploads)
     */
    key: (req, file, cb) => {
      // Generate unique key using timestamp only (no user ID for public uploads)
      cb(null, `uploads-public/${Date.now()}-${Math.random().toString(36).substring(2, 10)}`);
    },
    /*
     * Content-Type function - preserves original file MIME type
     */
    contentType: (req, file, cb) => {
      // Preserve original MIME type for proper file handling
      cb(null, file.mimetype);
    },
  }),
  limits: { fileSize: 1024 * 1024 * 1024 }, // 1GB file size limit
  /*
   * File filter function - determines which files are accepted
   * Currently allows all file types for maximum flexibility
   */
  fileFilter(req, file, callback) {
    // Allow all file types - can be customized for specific requirements
    callback(null, true);
  },
});

/*
 * Legacy local disk storage configuration (commented out)
 *
 * This section contains the previous implementation that stored files
 * locally on the server's filesystem. It has been replaced with S3
 * storage for better scalability and reliability.
 *
 * The commented code includes:
 * - Local disk storage with automatic directory creation
 * - Unique filename generation with timestamps
 * - File type filtering for specific formats (JPEG, PNG, PDF)
 * - File size limitations
 *
 * This code is preserved for reference and potential fallback scenarios.
 */
