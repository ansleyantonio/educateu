
export function generateColorShades(count: number) {
  const pairs: {
    light: string;
    medium: string;
    dark: string;
  }[] = [];

  const saturation = 65; // consistent saturation

  for (let i = 0; i < count; i++) {
    const hue = Math.floor((360 / count) * i); // evenly spaced hues

    pairs.push({
      light: `hsl(${hue}, ${saturation}%, 95%)`,
      medium: `hsl(${hue}, ${saturation}%, 60%)`,
      dark: `hsl(${hue}, ${saturation}%, 40%)`,
    });
  }

  return pairs;
}
