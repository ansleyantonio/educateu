export function hexToRgba(hex: string, opacity: number): string {
  const sanitizedHex = hex.replace("#", "");
  const fullHex =
    sanitizedHex.length === 3
      ? sanitizedHex.split("").map((c) => c + c).join("")
      : sanitizedHex;

  const r = parseInt(fullHex.substring(0, 2), 16);
  const g = parseInt(fullHex.substring(2, 4), 16);
  const b = parseInt(fullHex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}