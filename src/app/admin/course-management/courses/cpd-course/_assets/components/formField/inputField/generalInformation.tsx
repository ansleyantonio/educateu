/* eslint-disable @typescript-eslint/no-explicit-any */
import { CustomField } from "@/components/common/fields/cusInputField";

const GeneralInformation = ({
  form,
  isEdit,
}: {
  form: any;
  isEdit: boolean;
}) => {
  return (
    <div className="rounded-md border shadow-md border-1 border-[#EAEDF0]">
      <h1 className="py-2 px-4 rounded-t-md border-b bg-[#FFFFFF] border-[#EAEDF0] text-bold text-[#272E35]">
        General Course Information
      </h1>
      <div className="grid grid-cols-2 gap-4 py-6 px-3 rounded-md bg-[#FFFFFF]">
        {/* Course Title */}
        <CustomField.Text
          form={form}
          name={"title"}
          labelName={"Course Title"}
          placeholder="Enter course title"
          optional={false}
          viewOnly={isEdit}
        />

        {/* Course Code */}
        {/* {isEdit && ( */}
        <CustomField.Text
          viewOnly={isEdit}
          form={form}
          name={"code"}
          labelName={"Course Code"}
          placeholder="Enter course code"
          // optional={false}
        />
        {/* )} */}

        {/* Course Duration */}
        <CustomField.Text
          viewOnly={isEdit}
          form={form}
          name={"durationLength"}
          labelName={"Course duration in Minutes"}
          placeholder="Enter course duration"
        />
      </div>

      <div className="px-3">
        {/* Course Description */}
        <CustomField.TextArea
          viewOnly={isEdit}
          maxLength={1200}
          form={form}
          name={"courseDescription"}
          labelName={"Course Description"}
          placeholder="Enter course description"
        />
      </div>

      <div className="p-6">
        {/* Study Modes */}
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
