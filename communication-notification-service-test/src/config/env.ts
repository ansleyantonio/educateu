import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Environment variables configuration
export const env = {
  NODE_ENV: process.env['NODE_ENV'] ?? 'development',
  PORT: parseInt(process.env['PORT'] ?? '3000', 10),
  EMAIL_HOST: process.env['EMAIL_HOST'] ?? 'smtp.gmail.com',
  EMAIL_PORT: parseInt(process.env['EMAIL_PORT'] ?? '587', 10),
  EMAIL_USER: process.env['EMAIL_USER'] ?? '',
  EMAIL_PASS: process.env['EMAIL_PASS'] ?? '',
  STUDENT_LOGIN_URL: process.env['STUDENT_LOGIN_URL'] ?? process.env['CLIENT_URL'] ?? 'http://localhost:3000',
  CLIENT_URL: process.env['CLIENT_URL'] ?? 'http://localhost:3000',
  // Twilio SMS Configuration
  TWILIO_ACCOUNT_SID: process.env['TWILIO_ACCOUNT_SID'] ?? '',
  TWILIO_AUTH_TOKEN: process.env['TWILIO_AUTH_TOKEN'] ?? '',
  TWILIO_PHONE_NUMBER: process.env['TWILIO_PHONE_NUMBER'] ?? '',
  TWILIO_MESSAGING_SERVICE_SID: process.env['TWILIO_MESSAGING_SERVICE_SID'] ?? '',
} as const;