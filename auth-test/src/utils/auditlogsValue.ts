export function getFieldChanges(
  oldData: Record<string, unknown> | null,
  newData: Record<string, unknown>
): string {
  const changes: string[] = [];
  const excludedFields = ["createdAt", "updatedAt"];

  if (!oldData) {
    for (const key in newData) {
      if (newData[key] !== undefined && !excludedFields.includes(key)) {
        changes.push(`${key}: "empty" → "${newData[key]}"`);
      }
    }
    return changes.length > 0
      ? `. Changes: ${changes.join("; ")}`
      : " (no field changes detected)";
  }

  // Helper function to deeply compare values
  const isEqual = (a: unknown, b: unknown): boolean => {
    // Handle null/undefined cases
    if (a === null || a === undefined || b === null || b === undefined) {
      return a === b;
    }

    // Handle Date objects
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() === b.getTime();
    }

    // Handle arrays
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((item, index) => isEqual(item, b[index]));
    }

    // Handle objects
    if (typeof a === "object" && typeof b === "object") {
      const aObj = a as Record<string, unknown>;
      const bObj = b as Record<string, unknown>;
      const aKeys = Object.keys(aObj);
      const bKeys = Object.keys(bObj);

      if (aKeys.length !== bKeys.length) return false;
      return aKeys.every((key) => isEqual(aObj[key], bObj[key]));
    }

    // Handle primitives
    return a === b;
  };

  // Compare all fields between old and new data
  for (const key in newData) {
    if (!excludedFields.includes(key) && newData[key] !== undefined) {
      const oldValue = oldData[key];
      const newValue = newData[key];

      if (!isEqual(oldValue, newValue)) {
        changes.push(
          `${key}: "${formatValue(oldValue) || "empty"}" → "${formatValue(newValue)}"`
        );
      }
    }
  }

  // Also check for fields that were removed (set to null/undefined)
  for (const key in oldData) {
    if (
      !excludedFields.includes(key) &&
      oldData[key] !== null &&
      oldData[key] !== undefined &&
      (newData[key] === null || newData[key] === undefined)
    ) {
      changes.push(`${key}: "${formatValue(oldData[key])}" → removed`);
    }
  }

  return changes.length > 0
    ? `. Changes: ${changes.join("; ")}`
    : " (no field changes detected)";
}

// Helper function to format values for display
function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (value instanceof Date) return value.toLocaleString();
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
