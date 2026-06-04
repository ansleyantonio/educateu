"use client";
import { FormProvider, useForm } from "react-hook-form";
import Form_field from "../../../../_assets/components/formField/form_field";
import { IProfessionalCertificateModuleForm } from "../../../../_assets/schemas/moduleSchema";
import { ProfessionalCertificateModuleDefaultValue } from "../../../../_assets/utils/professional_certificate_moduleDefaultValue";

const ModuleDetailsTab = () => {
  const form = useForm<IProfessionalCertificateModuleForm>({
    defaultValues: ProfessionalCertificateModuleDefaultValue(
      demoProfessionalModule,
    ),
  });

  return (
    <FormProvider {...form}>
      {" "}
      <div className="grid grid-cols-1 gap-4">
        <Form_field viewOnly={true} form={form} />
      </div>
    </FormProvider>
  );
};

export default ModuleDetailsTab;

///TODO: Remove This Mock Data
const demoProfessionalModule = {
  moduleTitle: "Introduction to Web Development",
  moduleCode: "WD101",
  moduleType: "Core",

  estimatedTimeToComplete: "4 weeks",
  faculty: "Department of Computer Science",
  moduleDescription:
    "This module introduces fundamental concepts of web development, including HTML, CSS, JavaScript, and responsive design.",
  learningOutcome:
    "By the end of this module, students will be able to build static websites using HTML and CSS, and apply basic JavaScript interactivity.",
  forumDiscussionBoard: true,
};
