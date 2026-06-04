import crypto from "crypto";

const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY ||
  "4a7e3f8b2c9d1e5f6a0b3c8d2e7f4a9b1c6d3e8f5a2b7c4d9e0f1a6b3c8d5e2f7";
const IV_LENGTH = 16; // For AES, this is always 16

export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY.padEnd(32, "0").slice(0, 32)),
    iv
  );

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
};

export const decrypt = (encryptedText: string): string => {
  const textParts = encryptedText.split(":");
  const iv = Buffer.from(textParts.shift()!, "hex");
  const encryptedData = Buffer.from(textParts.join(":"), "hex");

  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY.padEnd(32, "0").slice(0, 32)),
    iv
  );

  let decrypted = decipher.update(encryptedData, undefined, "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};

// URL-safe encryption/decryption for query parameters
export const encryptUrlSafe = (text: string): string => {
  const encrypted = encrypt(text);
  return Buffer.from(encrypted).toString("base64url");
};

export const decryptUrlSafe = (encryptedText: string): string => {
  const decoded = Buffer.from(encryptedText, "base64url").toString("utf8");
  return decrypt(decoded);
};
