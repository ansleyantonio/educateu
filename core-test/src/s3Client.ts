/*
 * AWS S3 Client configuration for EducateU Core Backend
 *
 * This file sets up and configures the AWS S3 client for file storage operations.
 * It handles the connection to AWS S3 service using credentials from environment
 * variables and provides the client instance for use throughout the application.
 *
 * Required Environment Variables:
 * - AWS_REGION: The AWS region where the S3 bucket is located
 * - AWS_ACCESS_KEY_ID: AWS access key for authentication
 * - AWS_SECRET_ACCESS_KEY: AWS secret key for authentication
 */

import { S3Client } from "@aws-sdk/client-s3";

/*
 * Configured AWS S3 client instance
 *
 * This client is configured with credentials and region information from
 * environment variables. It provides the interface for all S3 operations
 * including file uploads, downloads, and management operations.
 *
 * The client uses AWS SDK v3 which provides better performance and smaller
 * bundle sizes compared to previous versions.
 */
export const s3 = new S3Client({
  region: process.env.AWS_REGION!, // AWS region for S3 operations
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!, // AWS access key
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!, // AWS secret key
  },
});
