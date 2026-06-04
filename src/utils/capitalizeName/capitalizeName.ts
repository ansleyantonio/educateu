export function capitalizeName(fullName?: string): string {
    if (!fullName) return "";
    return fullName
      .split(" ")
      .map((n) => n.charAt(0).toUpperCase() + n.slice(1))
      .join(" ");
}