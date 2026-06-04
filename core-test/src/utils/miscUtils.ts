export const generateUniqueCode = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 0xfff);
  const combined = ((timestamp & 0xffffff) << 12) | random;
  return (combined >>> 0).toString(36).toUpperCase().padStart(8, "0");
};
