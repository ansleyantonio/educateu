/* eslint-disable @typescript-eslint/no-explicit-any */

import { countryList } from "@/components/json/CountriesJson";
import { getUserAccess } from "@/utils/permissions/permissions";
import { useMatchedModule } from "@/utils/useMatchedModule/useMatchedModule";
import { CustomField } from "../../fields/cusInputField";

const Academic_background_step_2 = ({ form, viewOnly = false }: any) => {
  const years = Array.from({ length: 50 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return year.toString();
  });

  const matchedModule = useMatchedModule();
  const permissions = matchedModule?.modulePermission ?? [];

  const hasPostAndDeletePermission =
    getUserAccess(permissions) === "full-access";

  viewOnly = viewOnly || !hasPostAndDeletePermission;

  return (
    <>
      <div className="w-full grid grid-cols-1 items-top gap-x-4 gap-y-5 lg:grid-cols-2">
        <CustomField.SelectField
          form={form}
          name="academicBackground.highestLevelOfQualification"
          labelName="Highest Level of Qualification"
          options={[
            {
              label: "HighSchool",
              value: "highSchool",
            },
            {
              label: "Bachelors",
              value: "bachelors",
            },
            {
              label: "Masters",
              value: "masters",
            },
            {
              label: "Doctorate",
              value: "doctorate",
            },
          ]}
          placeholder="select  Qualification"
          viewOnly={viewOnly}
        />

        <CustomField.SelectField
          form={form}
          name="academicBackground.areaOfQualification"
          labelName="Area of Qualification"
          options={[
            { value: "None", label: "None" },
            { value: "ComputerScience", label: "Computer Science" },
            { value: "Engineering", label: "Engineering" },
            { value: "Business", label: "Business" },
            { value: "Arts", label: "Arts" },
            { value: "Science", label: "Science" },
          ]}
          placeholder="Select area"
          viewOnly={viewOnly}
        />

        <CustomField.SelectField
          form={form}
          name="academicBackground.gradeOrResult"
          labelName="Grade/Result"
          options={[
            { value: "None", label: "None" },
            { value: "A", label: "A" },
            { value: "B", label: "B" },
            { value: "C", label: "C" },
            { value: "D", label: "D" },
            { value: "Pass", label: "Pass" },
          ]}
          placeholder="Select grade"
          viewOnly={viewOnly}
        />

        {/* Year Completed */}
        <CustomField.SelectField
          form={form}
          name="academicBackground.yearCompleted"
          labelName="Year Completed"
          options={[
            { value: "None", label: "None" },
            ...years.map((year) => ({
              value: String(year),
              label: String(year),
            })),
          ]}
          placeholder="Select year"
          viewOnly={viewOnly}
        />

        {/* Country of Issue (already using Custom) */}
        <CustomField.SelectField
          form={form}
          name="academicBackground.countryOfIssue"
          labelName="Country of Issue"
          options={countryList}
          placeholder="Select Country"
          viewOnly={viewOnly}
        />

        {/* Institution Name */}
        <CustomField.Text
          form={form}
          name="academicBackground.institutionName"
          labelName="Institution Name"
          placeholder="institution Name"
          viewOnly={viewOnly}
        />
      </div>
    </>
  );
};

export default Academic_background_step_2;
