import { references_fromSchema } from "@/type/application_management/create_new_application.ts/references_schema";
import { z } from "zod";
import { academic_background } from "./allSteps/academic_background";
import { course_selection } from "./allSteps/course_selection";
import { criminal_background } from "./allSteps/criminal_background";
import { disability_and_accessibility } from "./allSteps/disabilities_and_accessibilities";
import { fund } from "./allSteps/funds";
import { next_of_kin } from "./allSteps/next_of_kin";
import { personal_information } from "./allSteps/personal_information";
import { personal_statement } from "./allSteps/personal_statement";
import { supporting_documents } from "./allSteps/supporting_documents";

// // create new application all step schema file merge
// const CreateFromSchema = personal_information
//   .merge(academic_background)
//   .merge(course_selection)
//   .merge(personal_statement)
//   .merge(disability_and_accessibility)
//   .merge(next_of_kin)
//   .merge(fund)
//   .merge(references_fromSchema)
//   .merge(criminal_background)
//   .merge(supporting_documents);

// // update
// const UpdateFromSchema = CreateFromSchema.partial();

// export const new_application = {
//   CreateFromSchema,
//   UpdateFromSchema,
// };

//Extend + refine
const personal_information_extended = personal_information
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
const disability_and_accessibility_extended =
  disability_and_accessibility.refine(
    (data) => {
      // If "Other" is selected, disabilityAndAccessibilityOther must be filled
      if (data.disabilityAndAccessibility?.includes("OTHER")) {
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
const next_of_kin_extended = next_of_kin.refine(
  (data) =>
    data.relationship !== "other" || // must match your SelectField value
    (data.otherRelationship && data.otherRelationship.trim() !== ""),
  {
    path: ["otherRelationship"],
    message: "Please specify the relationship",
  }
);

//Extend + refine
const fund_extended = fund.refine(
  (data) =>
    data.source !== "OTHER" || // must match your SelectField value
    (data.otherSource && data.otherSource.trim() !== ""),
  {
    path: ["otherSource"],
    message: "Please specify the source",
  }
);

//Extend + refine
const references_fromSchema_extended = references_fromSchema.refine(
  (data) =>
    data.relationship !== "OTHER" || // must match your SelectField value
    (data.otherRelationship && data.otherRelationship.trim() !== ""),
  {
    path: ["otherRelationship"],
    message: "Please specify the reference",
  }
);
// Combine schemas into one final schema
const formSchema = z.object({
  courseSelection: course_selection.optional(),
  personalInformation: personal_information_extended.optional(),
  academicBackground: academic_background.optional(),
  personalStatement: personal_statement.optional(),
  disabilityAndAccessibility: disability_and_accessibility_extended.optional(),
  nextOfKin: next_of_kin_extended.optional(),
  fund: fund_extended.optional(),
  reference: references_fromSchema_extended.optional(),
  criminalBackground: criminal_background.optional(),
  supportingDocument: supporting_documents.optional(),
});

const UpdateFromSchema = formSchema.partial();

// final Application Submit (click submit Application button)
const finalFormSchema = z.object({
  courseSelection: course_selection,
  personalInformation: personal_information_extended,
  academicBackground: academic_background.optional(),
  personalStatement: personal_statement.optional(),
  disabilityAndAccessibility: disability_and_accessibility_extended.optional(),
  nextOfKin: next_of_kin_extended.optional(),
  fund: fund_extended,
  reference: references_fromSchema_extended.optional(),
  criminalBackground: criminal_background,
  supportingDocument: supporting_documents.optional(),
});

// // update for other module like additional file check
// export const updateFormSchema = z
//   .object({
//     personalInformation: personal_information.optional(),
//     academicBackground: academic_background.optional(),
//     // courseSelection: course_selection,
//     personalStatement: personal_statement.optional(),
//     // disabilityAndAccessibility: disability_and_accessibility.optional(),
//     nextOfKin: next_of_kin.optional(),
//     fund: fund.optional(),
//     referencesFromSchema: references_fromSchema.optional(),
//     // criminalBackground: criminal_background.optional(),
//     // supportingDocument: supporting_documents.optional(),
//   })
//   .partial();

// application update schema  ([singleApplication])
const formSchemaWithoutSupportingDoc = formSchema
  .omit({
    supportingDocument: true,
  })
  .partial();

export const applicationSchema = {
  create: formSchema,
  finalFormSchema: finalFormSchema,
  update: UpdateFromSchema,
  WithoutSupportingDoc: formSchemaWithoutSupportingDoc,
};
