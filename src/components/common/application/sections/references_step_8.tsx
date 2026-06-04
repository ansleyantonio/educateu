/* eslint-disable @typescript-eslint/no-explicit-any */

import { getUserAccess } from "@/utils/permissions/permissions";
import { useMatchedModule } from "@/utils/useMatchedModule/useMatchedModule";
import { CustomField } from "../../fields/cusInputField";

const References_step_8 = ({ form, viewOnly = false }: any) => {
  const matchedModule = useMatchedModule();
  const permissions = matchedModule?.modulePermission ?? [];

  const hasPostAndDeletePermission =
    getUserAccess(permissions) === "full-access";

  const isDisabled = viewOnly || !hasPostAndDeletePermission;

  const optionsList = [
    { value: "none", label: "(None)" },
    {
      value: "academic_tutor_lecturer_professor",
      label: "Academic Tutor / Lecturer / Professor",
    },
    { value: "employer_line_manager", label: "Employer / Line Manager" },
    { value: "work_supervisor", label: "Work Supervisor" },
    {
      value: "professional_colleague_mentor",
      label: "Professional Colleague / Mentor",
    },
    {
      value: "character_reference_personal",
      label: "Character Reference (Personal)",
    },
    {
      value: "community_leader_volunteer_coordinator",
      label: "Community Leader / Volunteer Coordinator",
    },
    { value: "OTHER", label: "Other" },
  ];

  // watch relationship value
  const relationship = form.watch("reference.relationship");

  // if relationship value is Other then otherRelationship value "" set
  if (relationship !== "OTHER") {
    form.setValue("reference.otherRelationship", "");
  }

  return (
    <div className="w-full grid grid-cols-1 items-top gap-x-4 gap-y-5">
      <CustomField.Text
        form={form}
        name="reference.email"
        labelName="Email"
        placeholder="Email"
        optional={false}
        viewOnly={isDisabled}
      />
      <CustomField.SelectField
        form={form}
        name="reference.relationship"
        labelName="Relationship"
        placeholder="Select relationship"
        options={optionsList}
        viewOnly={isDisabled}
      />

      {relationship === "OTHER" && (
        <CustomField.Text
          form={form}
          name="reference.otherRelationship"
          labelName="Relationship (Other)"
          placeholder="Relationship (Other)"
          viewOnly={isDisabled}
        />
      )}
    </div>
  );
};

export default References_step_8;
