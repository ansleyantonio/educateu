export function dateFormat(dateString: string): string {
  const date = new Date(dateString);

  const month = date.getMonth() + 1; // getMonth() returns 0-based month (0 = January)
  const day = date.getDate();
  const year = date.getFullYear();

  return `${month}/${day}/${year}`;
}
