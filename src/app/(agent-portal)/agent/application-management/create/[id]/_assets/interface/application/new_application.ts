import { references_fromSchema } from "@/type/application_management/create_new_application.ts/references_schema";
import { z } from "zod";
import { academic_background } from "./sections/academic_background";
import { course_selection } from "./sections/course_selection";
import { criminal_background } from "./sections/criminal_background";
import { disability_and_accessibility } from "./sections/disabilities_and_accessibilities";
import { fund } from "./sections/funds";
import { next_of_kin } from "./sections/next_of_kin";
import { personal_information } from "./sections/personal_information";
import { personal_statement } from "./sections/personal_statement";
import { supporting_documents } from "./sections/supporting_documents";

// create new application all step schema file merge
const CreateFromSchema = personal_information
  .merge(academic_background)
  .merge(course_selection)
  .merge(personal_statement)
  .merge(disability_and_accessibility)
  .merge(next_of_kin)
  .merge(fund)
  .merge(references_fromSchema)
  .merge(criminal_background)
  .merge(supporting_documents);

// update
const UpdateFromSchema = CreateFromSchema.partial();

export const new_application = {
  CreateFromSchema,
  UpdateFromSchema,
};

//Extend + refine
export const personal_information_extended = personal_information
  .extend({}) // you can add more fields here if needed
  .refine(
    (data) =>
      data.sex !== "OTHER" || (data.otherSex && data.otherSex.trim() !== ""),
    {
      path: ["otherSex"],
      message: "Please specify",
    }
  );
//Extend + refine
export const disability_and_accessibility_extended =
  disability_and_accessibility.refine(
    (data) => {
      // If "Other" is selected, disabilityAndAccessibilityOther must be filled
      if (data.disabilityAndAccessibility?.includes("Other")) {
        return !!data.disabilityAndAccessibilityOther?.trim();
      }
      return true; // valid if "Other" is not selected
    },
    {
      path: ["disabilityAndAccessibilityOther"],
      message: "Please specify",
    }
  );

//Extend + refine
export const next_of_kin_extended = next_of_kin.refine(
  (data) =>
    data.relationship !== "other" || // must match your SelectField value
    (data.otherRelationship && data.otherRelationship.trim() !== ""),
  {
    path: ["otherRelationship"],
    message: "Please specify the relationship",
  }
);

//Extend + refine
export const references_fromSchema_extended = references_fromSchema.refine(
  (data) =>
    data.relationship !== "other" || // must match your SelectField value
    (data.otherRelationship && data.otherRelationship.trim() !== ""),
  {
    path: ["otherRelationship"],
    message: "Please specify the relationship",
  }
);
// Combine schemas into one final schema
export const formSchema = z.object({
  courseSelection: course_selection.optional(),
  personalInformation: personal_information_extended.optional(),
  academicBackground: academic_background.optional(),
  personalStatement: personal_statement.optional(),
  disabilityAndAccessibility: disability_and_accessibility_extended.optional(),
  nextOfKin: next_of_kin_extended.optional(),
  fund: fund.optional(),
  references: references_fromSchema_extended.optional(),
  criminalBackground: criminal_background.optional(),
  supportingDocument: supporting_documents.optional(),
});
export const finalFormSchema = z.object({
  courseSelection: course_selection,
  personalInformation: personal_information,
  academicBackground: academic_background.optional(),
  personalStatement: personal_statement.optional(),
  disabilityAndAccessibility: disability_and_accessibility.optional(),
  nextOfKin: next_of_kin.optional(),
  fund: fund.optional(),
  references: references_fromSchema.optional(),
  criminalBackground: criminal_background,
  supportingDocument: supporting_documents.optional(),
});

// update for other module like additional file check
export const updateFormSchema = z
  .object({
    personalInformation: personal_information.optional(),
    academicBackground: academic_background.optional(),
    // courseSelection: course_selection,
    personalStatement: personal_statement.optional(),
    // disabilityAndAccessibility: disability_and_accessibility.optional(),
    nextOfKin: next_of_kin.optional(),
    fund: fund.optional(),
    referencesFromSchema: references_fromSchema.optional(),
    // criminalBackground: criminal_background.optional(),
    // supportingDocument: supporting_documents.optional(),
  })
  .partial();
