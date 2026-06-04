export function RemoveEmptyFields<T extends object>(obj: T): Partial<T> {
  const cleaned: Partial<T> = {};

  Object.entries(obj).forEach(([key, value]) => {
    const isEmpty =
      value === null ||
      value === undefined ||
      (typeof value === "string" && value.trim() === "") ||
      (Array.isArray(value) && value.length === 0);

    if (!isEmpty) {
      cleaned[key as keyof T] = value;
    }
  });

  return cleaned;
}
