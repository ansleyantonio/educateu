const fieldLabels: Record<string, string> = {
  // Top-level Application
  status: "Application status",
  stage: "Application stage",
  outcome: "Final outcome",
  interviewOutcome: "Interview outcome",

  // Personal Information
  "personalInformation.firstName": "First name",
  "personalInformation.lastName": "Last name",
  "personalInformation.email": "Email address",
  "personalInformation.dateOfBirth": "Date of birth",
  "personalInformation.countryOfBirth": "Country of birth",
  "personalInformation.currentNationality": "Nationality",
  "personalInformation.sex": "Sex",
  "personalInformation.otherSex": "Other Sex",
  "personalInformation.ethnicity": "Ethnicity",
  "personalInformation.mobileNumber": "Mobile number",
  "personalInformation.countryOfResidence": "Country of residence",
  "personalInformation.currentAddress": "Current address",
  "personalInformation.currentPostCode": "Current postcode",
  "personalInformation.permanentAddress": "Permanent address",
  "personalInformation.nationalIdentityType": "National ID type",
  "personalInformation.nationalIdentityNumber": "National ID number",

  // Academic Background
  "academicBackground.highestLevelOfQualification": "Highest qualification",
  "academicBackground.areaOfQualification": "Field of study",
  "academicBackground.gradeOrResult": "Grade/Result",
  "academicBackground.yearCompleted": "Year completed",
  "academicBackground.countryOfIssue": "Country of issue",
  "academicBackground.institutionName": "Institution name",

  // Course Selection
  "courseSelection.session.name": "Session",
  "courseSelection.awardingBody.name": "Awarding body",
  "courseSelection.course.course.name": "Selected course",
  "courseSelection.intake": "Intake",
  "courseSelection.yearOfCourse": "Year of course",

  // Personal Statement
  "personalStatement.statement": "Personal statement",

  // Disability and Accessibility
  "disabilityAndAccessibility.disabilityAndAccessibility": "Disability/Accessibility needs",

  // Next of Kin
  "nextOfKin.fullName": "Next of kin (Name)",
  "nextOfKin.relationship": "Next of kin (Relationship)",
  "nextOfKin.phoneOrMobile": "Next of kin (Phone)",
  "nextOfKin.address": "Next of kin (Address)",

  // Funding
  "fund.source": "Funding source",

  // Reference
  "reference.relationship": "Reference relationship",

  // Criminal Background
  "criminalBackground.offenseOrPenalty": "Offense/Penalty",
  "criminalBackground.offenseOrPenaltyDetails": "Offense/Penalty details",
  "criminalBackground.disqualificationOrSanction": "Disqualification/Sanction",
  "criminalBackground.disqualificationOrSanctionDetails": "Disqualification/Sanction details",
  "criminalBackground.policeClearance": "Police clearance",

  // Supporting Documents
  "supportingDocument.nationalIdentification": "National ID documents",
  "supportingDocument.policeClearance": "Police clearance documents",
  "supportingDocument.otherDocument": "Other supporting documents",
};

const ignoredKeys = new Set(["sessionId", "courseId", "awardingBodyId", "id"]);

const ignoredPaths = new Set([
  "courseSelection.awardingBody.intakePeriods",
  "courseSelection.awardingBody.requiredDocuments",
  "courseSelection.awardingBody.othersInfo",
  "courseSelection.course.studyModes",
  "courseSelection.course.courseSnapshot",
  "courseSelection.course.course",
  "courseSelection.course.courseSnapshot.awardingBody",
  "courseSelection.course.courseSnapshot.courseModules",
  "courseSelection.course.courseSnapshot.modules",
  "courseSelection.course.courseSnapshot.studyModes",
]);

export function formatChanges(
  oldData: Record<string, unknown> | null,
  newData: Record<string, unknown> | null,
  parentKey = "",
): string[] {
  if (!oldData || !newData) return [];

  const changes: string[] = [];

  for (const key of Object.keys(newData)) {
    if (ignoredKeys.has(key)) continue;

    const fullKey = parentKey ? `${parentKey}.${key}` : key;

    if (fullKey === "supportingDocument.supportingDocumentAttachments") {
      interface SupportingDocumentAttachment {
        name: string;
        attachment?: {
          paths?: string;
        };
      }

      const oldDocs = Array.isArray(oldData[key]) ? (oldData[key] as SupportingDocumentAttachment[]) : [];
      const newDocs = Array.isArray(newData[key]) ? (newData[key] as SupportingDocumentAttachment[]) : [];

      const oldMap = Object.fromEntries(oldDocs.map((d) => [d.name, d.attachment?.paths]));
      const newMap = Object.fromEntries(newDocs.map((d) => [d.name, d.attachment?.paths]));

      for (const docKey of Object.keys(newMap)) {
        if (oldMap[docKey] !== newMap[docKey]) {
          const label =
            fieldLabels[`supportingDocument.${docKey}`] ||
            `Supporting document (${docKey.charAt(0).toUpperCase()}${docKey.slice(1)})`;
          changes.push(`${label} updated`);
        }
      }

      continue;
    }

    const isAuditable = Object.keys(fieldLabels).some((f) => f.startsWith(fullKey));
    if (!isAuditable) continue;

    const oldVal = oldData[key];
    const newVal = newData[key];

    if (typeof newVal === "object" && newVal !== null && !Array.isArray(newVal)) {
      changes.push(
        ...formatChanges((oldVal as Record<string, unknown>) ?? {}, newVal as Record<string, unknown>, fullKey),
      );
    } else if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      const label = fieldLabels[fullKey] || fullKey;
      if (oldVal !== undefined && oldVal !== null && oldVal !== newVal) {
        changes.push(`${label} changed from "${oldVal}" → "${newVal ?? ""}"`);
      } else if (oldVal == null && newVal != null) {
        changes.push(`${label} set to "${newVal}"`);
      }
    }
  }

  return changes;
}
