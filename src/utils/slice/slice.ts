export const SliceText = (text: string, SliceLength: number) => {
  if (!text) return "";
  return text.length > SliceLength ? text.slice(0, SliceLength) + "..." : text;
};
