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
  .merge(course_selection)
  .merge(personal_statement)
  .merge(academic_background)
  .merge(disability_and_accessibility)
  .merge(next_of_kin)
  .merge(fund)
  .merge(references_fromSchema)
  .merge(criminal_background)
  .merge(supporting_documents);

// Combine schemas into one final schema
export const formSchema = z.object({
  personalInformation: personal_information,
  academicBackground: academic_background,
  courseSelection: course_selection,
  personalStatement: personal_statement,
  disabilityAndAccessibility: disability_and_accessibility,
  nextOfKin: next_of_kin,
  fund: fund,
  referencesFromSchema: references_fromSchema,
  criminalBackground: criminal_background,
  supportingDocument: supporting_documents,
});

// update
const UpdateFromSchema = CreateFromSchema.partial();
export const new_application = {
  CreateFromSchema,
  UpdateFromSchema,
};
export const applicationUpdateFormSchemaByAgent = z
  .object({
    courseSelection: course_selection.optional(),
    personalInformation: personal_information.optional(),
    academicBackground: academic_background.optional(),
    personalStatement: personal_statement.optional(),
    disabilityAndAccessibility: disability_and_accessibility.optional(),
    nextOfKin: next_of_kin.optional(),
    fund: fund.optional(),
    referencesFromSchema: references_fromSchema.optional(),
    criminalBackground: criminal_background.optional(),
    // supportingDocument: supporting_documents.optional(),
  })
  .partial();
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
