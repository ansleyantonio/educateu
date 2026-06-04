export function getFieldChanges(oldData: Record<string, unknown> | null, newData: Record<string, unknown>): string {
  const changes: string[] = [];
  const excludedFields = ["createdAt", "updatedAt", "awardingBodyId", "sessionId"];

  if (!oldData) {
    for (const key in newData) {
      if (newData[key] !== undefined && !excludedFields.includes(key)) {
        const readableKey = toHumanReadable(key);
        changes.push(`${readableKey}: "Empty" → "${formatSpecificField(key, newData[key])}"`);
      }
    }
    return changes.length > 0 ? `. Changes: ${changes.join("; ")}` : " (no field changes detected)";
  }

  // Helper function to deeply compare values
  const isEqual = (a: unknown, b: unknown): boolean => {
    if (a === null || a === undefined || b === null || b === undefined) return a === b;
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((item, index) => isEqual(item, b[index]));
    }
    if (typeof a === "object" && typeof b === "object") {
      return JSON.stringify(a) === JSON.stringify(b);
    }
    return a === b;
  };

  // Compare all fields between old and new data
  for (const key in newData) {
    if (!excludedFields.includes(key) && newData[key] !== undefined) {
      const oldValue = oldData[key];
      const newValue = newData[key];

      if (!isEqual(oldValue, newValue)) {
        const readableKey = toHumanReadable(key);
        changes.push(
          `${readableKey}: "${formatSpecificField(key, oldValue) || "Empty"}" → "${formatSpecificField(key, newValue)}"`,
        );
      }
    }
  }

  // Check for removed fields
  for (const key in oldData) {
    if (
      !excludedFields.includes(key) &&
      oldData[key] !== null &&
      oldData[key] !== undefined &&
      (newData[key] === null || newData[key] === undefined)
    ) {
      const readableKey = toHumanReadable(key);
      changes.push(`${readableKey}: "${formatSpecificField(key, oldData[key])}" → Removed`);
    }
  }

  return changes.length > 0 ? `. Changes: ${changes.join("; ")}` : " (no field changes detected)";
}

// Convert field names to human readable format
function toHumanReadable(key: string): string {
  const specialCases: Record<string, string> = {
    id: "ID",
    hesaCourseId: "HESA Course ID",
    courseType: "Course Type",
    degreeType: "Degree Type",
    diplomaType: "Diploma Type",
    studyModes: "Study Modes",
    accreditationStatus: "Accreditation Status",
    applicationId: "Application ID",
    dateOfBirth: "Date of Birth",
    mobileNumber: "Mobile Number",
    postCode: "Post Code",
    nationalIdentityNumber: "National Identity Number",
    wellbeingCheckStatus: "Wellbeing Check Status",
    generalFileCheckStatus: "General File Check Status",
    additionalFileCheckStatus: "Additional File Check Status",
    interviewOutcome: "Interview Outcome",
  };

  // Convert snake_case and camelCase to space separated
  let readable = key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  // Capitalize first letter of each word and handle special cases
  readable = readable
    .split(" ")
    .map((word) => {
      const lowerWord = word.toLowerCase();
      return specialCases[lowerWord] || word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");

  return readable;
}

// Format values for human-readable display with enum-specific formatting
function formatSpecificField(key: string, value: unknown): string {
  if (value === null || value === undefined) return "";

  // Handle enum values
  switch (key.toLowerCase()) {
    // Course enums
    case "coursetype":
      return formatEnumValue(value, {
        DEGREE_COURSE: "Degree Course",
        DIPLOMA_COURSE: "Diploma Course",
        PROFESSIONAL_COURSE: "Professional Course",
        CPD_COURSE: "CPD Course",
      });

    case "degreetype":
      return formatEnumValue(value, {
        UNDERGRADUATE: "Undergraduate",
        POSTGRADUATE: "Postgraduate",
      });

    case "diplomatype":
      return formatEnumValue(value, {
        HIGHER_EDUCATION: "Higher Education",
        VOCATIONAL_OR_PROFESSIONAL: "Vocational/Professional",
      });

    case "studymodes":
      if (Array.isArray(value)) {
        return value
          .map((v) =>
            formatEnumValue(v, {
              SELF_PACED: "Self Paced",
              INSTRUCTOR_LED: "Instructor Led",
              COHORT_BASED: "Cohort Based",
              BLENDED_OR_HYBRID_LEARNING: "Blended/Hybrid Learning",
            }),
          )
          .join(", ");
      }
      return formatEnumValue(value, {
        SELF_PACED: "Self Paced",
        INSTRUCTOR_LED: "Instructor Led",
        COHORT_BASED: "Cohort Based",
        BLENDED_OR_HYBRID_LEARNING: "Blended/Hybrid Learning",
      });

    case "accreditationstatus":
      return formatEnumValue(value, {
        ACCREDITED: "Accredited",
        PROVISIONALLY_ACCREDITED: "Provisionally Accredited",
        NOT_ACCREDITED: "Not Accredited",
      });

    case "status":
      return formatEnumValue(value, {
        PUBLISHED: "Published",
        UNPUBLISHED: "Unpublished",
        ARCHIVED: "Archived",
      });

    // Application enums
    case "applicationstatus":
      return formatEnumValue(value, {
        DRAFT: "Draft",
        PENDING: "Pending",
        APPROVED: "Approved",
        REJECTED: "Rejected",
      });

    case "applicationstage":
      return formatEnumValue(value, {
        NEW: "New",
        ASSIGN: "Assign",
        CHECK: "Check",
        SUBMIT: "Submit",
        OUTCOME: "Outcome",
      });
    case "awardingbody":
      return (value as { name?: string })?.name || "";

    case "session":
      return (value as { name?: string })?.name || "";

    case "wellbeingcheckstatus":
    case "generalfilecheckstatus":
    case "additionalfilecheckstatus":
      return formatEnumValue(value, {
        PENDING: "Pending",
        APPROVED: "Approved",
        REJECTED: "Rejected",
      });

    case "outcome":
      return formatEnumValue(value, {
        PENDING: "Pending",
        APPROVED: "Approved",
        REJECTED: "Rejected",
      });

    case "sex":
      return formatEnumValue(value, {
        MALE: "Male",
        FEMALE: "Female",
      });

    case "policlearance":
    case "offenseorpenalty":
    case "disqualificationorsanction":
      return formatEnumValue(value, {
        YES: "Yes",
        NO: "No",
      });

    // Date fields
    case "dateofbirth":
    case "approvaldate":
    case "reviewdate":
    case "startdate":
    case "enddate":
    case "accreditationstartdate":
    case "accreditationenddate":
    case "yearcompleted":
      if (value instanceof Date) {
        return value.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
      return String(value);

    // Boolean fields
    case "disabilityandaccessibility":
      if (typeof value === "boolean") return value ? "Yes" : "No";
      return String(value);

    // Numeric fields
    case "durationlength":
    case "numberofsemesters":
    case "totalcredits":
    case "yearoneexpectedcredits":
    case "yeartwoexpectedcredits":
    case "yearthreeexpectedcredits":
    case "minimumpassingcreditsperyear":
      return `${value}`;

    // Default formatting
    default:
      if (value instanceof Date) {
        return value.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
      if (Array.isArray(value)) {
        if (value.length === 0) return "None";
        return value.map((item) => formatSpecificField(key, item)).join(", ");
      }
      if (typeof value === "boolean") return value ? "Yes" : "No";
      if (typeof value === "object") return "Object";
      return String(value);
  }
}

// Helper function to format enum values
function formatEnumValue(value: unknown, mapping: Record<string, string>): string {
  const stringValue = String(value);
  return (
    mapping[stringValue] ||
    stringValue
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
  );
}
