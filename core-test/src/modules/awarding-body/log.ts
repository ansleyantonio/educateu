export function flattenObject(obj: Record<string, unknown>, prefix = ""): Record<string, unknown> {
  let result: Record<string, unknown> = {};
  for (const key in obj) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (obj[key] && typeof obj[key] === "object" && !Array.isArray(obj[key])) {
      result = { ...result, ...flattenObject(obj[key] as Record<string, unknown>, newKey) };
    } else {
      result[newKey] = obj[key];
    }
  }
  return result;
}

function toHumanReadable(key: string): string {
  const specialCases: Record<string, string> = {
    id: "ID",
    awardingBody: "Awarding Body",
    intakePeriod: "Intake Period",
    selectRequiredDocuments: "Required Documents",
    grades: "Grades",
    status: "Status",
  };

  const readable = key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (specialCases[readable]) return specialCases[readable];
  return readable
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatFieldValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return "Empty";

  if (Array.isArray(value)) {
    if (value.length === 0) return "None";
    if (key.toLowerCase().includes("intakeperiod")) {
      return (value as string[])
        .map(
          (v) =>
            ({
              "january-april": "January–April",
              "may-august": "May–August",
              "september-december": "September–December",
            })[v] || v,
        )
        .join(", ");
    }
    if (key.toLowerCase().includes("selectrequireddocuments")) {
      return (value as string[])
        .map(
          (v) =>
            ({
              "passport-id": "Passport ID",
              transcripts: "Transcripts",
              essay: "Essay",
              cv: "CV",
              "proof-of-name-change": "Proof of Name Change",
              "english-certificates": "English Certificates",
              "personal-statement": "Personal Statement",
              qualification: "Qualification",
              other: "Other",
              "consent-form": "Consent Form",
            })[v] || v,
        )
        .join(", ");
    }
    if (key.toLowerCase().includes("grades")) {
      return (value as { classification?: string; percentageRange?: string; ukGpaEquivalent?: string }[])
        .map((g) => `${g.classification || ""} (${g.percentageRange || ""}, UK GPA: ${g.ukGpaEquivalent ?? ""})`)
        .join("; ");
    }
    return value.join(", ");
  }

  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value instanceof Date)
    return value.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return String(value);
}

export function getFieldChanges(
  oldData: Record<string, unknown> | null,
  newData: Record<string, unknown>,
  trackedFields?: string[],
): string {
  const changes: string[] = [];
  const excludedFields = ["createdAt", "updatedAt", "awardingBodyId", "sessionId"];

  const flatOld = oldData ? flattenObject(oldData) : {};
  const flatNew = flattenObject(newData);

  const isEqual = (a: unknown, b: unknown): boolean => {
    if (a === null || a === undefined || b === null || b === undefined) return a === b;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((item, index) => isEqual(item, b[index]));
    }
    if (typeof a === "object" && typeof b === "object") return JSON.stringify(a) === JSON.stringify(b);
    return a === b;
  };

  const fieldsToCheck = trackedFields && trackedFields.length > 0 ? trackedFields : Object.keys(flatNew);

  for (const key of fieldsToCheck) {
    if (!excludedFields.includes(key) && flatNew[key] !== undefined) {
      const oldValue = flatOld[key];
      const newValue = flatNew[key];
      if (!isEqual(oldValue, newValue)) {
        const readableKey = toHumanReadable(key.replace("othersInfo.", ""));
        changes.push(`${readableKey}: "${formatFieldValue(key, oldValue)}" → "${formatFieldValue(key, newValue)}"`);
      }
    }
  }

  return changes.length > 0 ? `. Changes: ${changes.join("; ")}` : " (no field changes detected)";
}

// --- awarding-body-service.ts ---
