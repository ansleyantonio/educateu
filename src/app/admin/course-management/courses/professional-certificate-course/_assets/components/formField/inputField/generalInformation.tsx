/* eslint-disable @typescript-eslint/no-explicit-any */
import { CustomField } from "@/components/common/fields/cusInputField";
import { UseFormReturn } from "react-hook-form";

interface IFormType {
  form: UseFormReturn<any>;
  isEdit?: boolean;
}

const GeneralInformation = ({ form, isEdit = false }: IFormType) => {
  return (
    <div className="rounded-md border shadow-md border-1 border-[#EAEDF0]">
      <h1 className="py-2 px-4 rounded-t-md border-b bg-[#FFFFFF] border-[#EAEDF0] text-bold text-[#272E35]">
        General Course Information
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 py-6 px-3 rounded-md bg-[#FFFFFF]">
        <CustomField.Text
          form={form}
          placeholder="Enter Course Title"
          name={"title"}
          labelName={"Course Title"}
          optional={false}
          viewOnly={isEdit}
        />

        {/* Course Code */}

        <CustomField.Text
          viewOnly={isEdit}
          form={form}
          name={"code"}
          labelName={"Course Code"}
          placeholder="Enter course code"
          // optional={false}
        />

        {/* <CustomField.Text */}
        {/*   form={form} */}
        {/*   placeholder="Enter Course Code" */}
        {/*   name={"code"} */}
        {/*   labelName={"Course Code"} */}
        {/*   optional={false} */}
        {/*   viewOnly={isEdit} */}
        {/* /> */}

        <CustomField.DatePickerAnd
          isDisabled={isEdit}
          form={form}
          placeholder="Enter Course Start Date"
          name={"startDate"}
          labelName={"Course Start Date"}
        />

        <CustomField.DatePickerAnd
          isDisabled={isEdit}
          form={form}
          placeholder="Enter Course End Date"
          name={"endDate"}
          labelName={"Course End Date"}
        />
      </div>
      <div className="px-3">
        <CustomField.Text
          viewOnly={isEdit}
          form={form}
          placeholder="Enter Course Duration"
          name={"durationLength"}
          labelName={"Course duration in Minutes"}
        />
        <CustomField.TextArea
          viewOnly={isEdit}
          form={form}
          placeholder="Enter Course Description"
          name={"courseDescription"}
          labelName={"Course Description"}
          optional={false}
        />
      </div>
      <div className="p-6">
        <CustomField.MultiCheckField
          viewOnly={isEdit}
          form={form}
          placeholder="Select Study Modes"
          name={"studyModes"}
          labelName={"Study Modes"}
          style="flex flex-wrap mt-2 gap-3 items-center"
          options={[
            {
              value: "SELF_PACED",
              label: "Self-Paced",
            },
            {
              value: "INSTRUCTOR_LED",
              label: "Instructor-Led",
            },
            {
              value: "COHORT_BASED",
              label: "Cohort-Based",
            },
            {
              value: "BLENDED_OR_HYBRID_LEARNING",
              label: "Blended or Hybrid Learning",
            },
          ]}
        />
      </div>
    </div>
  );
};

export default GeneralInformation;
