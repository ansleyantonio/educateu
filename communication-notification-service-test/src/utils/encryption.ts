import crypto from 'crypto';

const ENCRYPTION_KEY = process.env["ENCRYPTION_KEY"] ?? 'default_encryption_key_for_development_purposes_only';
const IV_LENGTH = 16; // For AES, this is always 16

// Validate encryption key length
const validateEncryptionKey = (key: string): void => {
  const keyBuffer = Buffer.from(key);
  if (keyBuffer.length !== 32) {
    throw new Error(`Invalid encryption key length: ${keyBuffer.length} bytes. AES-256 requires exactly 32 bytes.`);
  }
};

validateEncryptionKey(ENCRYPTION_KEY);

export const encryptUrlSafe = (text: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const result = iv.toString('hex') + ':' + encrypted;
  // Convert to URL-safe base64
  return Buffer.from(result).toString('base64url');
};

export const decryptUrlSafe = (text: string): string => {
  try {
    // Validate encryption key before decryption
    validateEncryptionKey(ENCRYPTION_KEY);

    // Decode from URL-safe base64
    const decodedText = Buffer.from(text, 'base64url').toString('hex');
    const parts = decodedText.split(':');
    const ivPart = parts.shift();
    if (!ivPart) {
      throw new Error('Invalid encrypted text format');
    }
    const iv = Buffer.from(ivPart, 'hex'); // Use iv in the decipher initialization
    const encryptedText = parts.join(':');

    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt text');
  }
};