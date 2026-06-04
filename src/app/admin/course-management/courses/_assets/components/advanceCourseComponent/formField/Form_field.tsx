/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { UseFormReturn } from "react-hook-form";
import AcademicSessionDurationInputForm from "./inputField/AcademicSessionandDuration";
import AccreditationAdnComplianceInputForm from "./inputField/AccreditationAndCompliance";
import AdvanceCourseInputForm from "./inputField/AdvancedCourse";
import AwardingBodyInformationInputForm from "./inputField/AwardingBodyInformation";
import GovernanceAndQualityAssuranceInputForm from "./inputField/GovernanceAndQualityAssurance";

interface FormType {
  form: UseFormReturn<any>;
  isEdit?: boolean;
  modulesPerCourses?: boolean;
}
const Form_field = ({ form, isEdit = false, modulesPerCourses }: FormType) => {
  return (
    <>
      <AdvanceCourseInputForm form={form} isEdit={isEdit} />
      <AcademicSessionDurationInputForm
        isEdit={isEdit}
        form={form}
        modulesPerCourses={modulesPerCourses}
      />
      <AwardingBodyInformationInputForm
        isEdit={isEdit}
        form={form}
        modulesPerCourses={modulesPerCourses}
      />
      {/* <FinancialInformationInputForm form={form} /> */}
      <AccreditationAdnComplianceInputForm isEdit={isEdit} form={form} />
      <GovernanceAndQualityAssuranceInputForm isEdit={isEdit} form={form} />
    </>
  );
};

export default Form_field;
