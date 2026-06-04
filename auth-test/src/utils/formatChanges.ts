export function formatChanges(
  existingObj: Record<string, any>,
  newObj: Record<string, any>,
): string[] {
  const changes: string[] = [];

  for (const key of Object.keys(newObj)) {
    const oldValue = existingObj[key];
    const newValue = newObj[key];

    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      const formattedKey = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .replace(/_/g, " ");

      if (oldValue === undefined || oldValue === null) {
        // New field added
        if (Array.isArray(newValue)) {
          changes.push(
            `Added ${formattedKey}: ${formatArrayChanges([], newValue)}`,
          );
        } else if (typeof newValue === "object") {
          changes.push(
            `Added ${formattedKey}: ${formatObjectChanges({}, newValue)}`,
          );
        } else {
          changes.push(`Added ${formattedKey}: ${newValue}`);
        }
      } else if (newValue === undefined || newValue === null) {
        changes.push(`Removed ${formattedKey}`);
      } else if (Array.isArray(newValue) || Array.isArray(oldValue)) {
        // Handle array changes
        const oldArr = Array.isArray(oldValue) ? oldValue : [];
        const newArr = Array.isArray(newValue) ? newValue : [];

        if (oldArr.length === 0) {
          changes.push(
            `Added ${formattedKey}: ${formatArrayChanges([], newArr)}`,
          );
        } else if (newArr.length === 0) {
          changes.push(`Removed ${formattedKey}`);
        } else {
          changes.push(
            `Changed ${formattedKey}: ${formatArrayChanges(oldArr, newArr)}`,
          );
        }
      } else if (typeof newValue === "object" && typeof oldValue === "object") {
        // For nested objects, show only changed values
        changes.push(
          `Changed ${formattedKey}: ${formatObjectChanges(oldValue, newValue)}`,
        );
      } else {
        changes.push(
          `Changed ${formattedKey} from "${oldValue}" to "${newValue}"`,
        );
      }
    }
  }

  // Check for removed keys
  for (const key of Object.keys(existingObj)) {
    if (!(key in newObj)) {
      const formattedKey = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .replace(/_/g, " ");
      changes.push(`Removed ${formattedKey}`);
    }
  }

  return changes;
}

/**
 * Compares two arrays and returns a readable string showing only changed values
 */
function formatArrayChanges(oldArr: any[], newArr: any[]): string {
  if (newArr.length === 0) return "empty";

  const changes: string[] = [];

  newArr.forEach((newItem, index) => {
    const oldItem = oldArr[index];

    if (!oldItem) {
      // New item
      if (typeof newItem === "object" && newItem !== null) {
        changes.push(`[New Commission] ${formatObjectChanges({}, newItem)}`);
      } else {
        changes.push(`[New] ${newItem}`);
      }
    } else if (typeof newItem === "object" && typeof oldItem === "object") {
      // Compare objects and show only changed fields
      const objChanges = getObjectChanges(oldItem, newItem);
      if (objChanges.length > 0) {
        changes.push(objChanges.join(", "));
      }
    } else if (oldItem !== newItem) {
      changes.push(`Changed from "${oldItem}" to "${newItem}"`);
    }
  });

  // Check for removed items
  if (oldArr.length > newArr.length) {
    for (let i = newArr.length; i < oldArr.length; i++) {
      changes.push(`[Removed] commission`);
    }
  }

  return changes.length > 0 ? changes.join("; ") : "no changes";
}

/**
 * Compares two objects and returns array of changed fields only
 */
function getObjectChanges(
  oldObj: Record<string, any>,
  newObj: Record<string, any>,
): string[] {
  const changes: string[] = [];

  for (const key of Object.keys(newObj)) {
    // Skip ID fields and metadata
    if (key === "id" || key.endsWith("Id")) continue;

    const oldValue = oldObj[key];
    const newValue = newObj[key];

    if (
      oldValue !== newValue &&
      JSON.stringify(oldValue) !== JSON.stringify(newValue)
    ) {
      const formattedKey = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .replace(/_/g, " ");

      if (oldValue === undefined || oldValue === null) {
        changes.push(`Added ${formattedKey}: ${newValue}`);
      } else if (newValue === undefined || newValue === null) {
        changes.push(`Removed ${formattedKey}`);
      } else {
        changes.push(`${formattedKey}: ${oldValue} → ${newValue}`);
      }
    }
  }

  return changes;
}

/**
 * Formats an object's changed values into a readable string
 */
function formatObjectChanges(
  oldObj: Record<string, any>,
  newObj: Record<string, any>,
): string {
  const changes = getObjectChanges(oldObj, newObj);
  return changes.length > 0 ? changes.join(", ") : "no changes";
}
