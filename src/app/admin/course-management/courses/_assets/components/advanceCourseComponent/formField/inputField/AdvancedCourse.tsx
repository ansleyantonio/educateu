/* eslint-disable @typescript-eslint/no-explicit-any */
import { CustomField } from "@/components/common/fields/cusInputField";

const AdvanceCourseInputForm = ({
  form,
  isEdit,
}: {
  form: any;
  isEdit: boolean;
}) => {
  return (
    <div className="rounded-md border shadow-md border-1 border-[#EAEDF0]">
      <h1 className="py-2 px-4 rounded-t-md border-b bg-[#FFFFFF] border-[#EAEDF0] text-bold text-[#272E35]">
        GENERAL COURSE INFORMATION
      </h1>

      <div className="py-6 px-3 space-y-4 rounded-md bg-[#FFFFFF]">
        {/* Course Title */}
        <CustomField.Text
          form={form}
          name={"title"}
          labelName={" Course Title"}
          placeholder={"Course Title"}
          optional={false}
          viewOnly={isEdit}
        />

        {/* Course Code */}

        <CustomField.Text
          form={form}
          name={"code"}
          labelName={"Course Code"}
          placeholder={"Course Code"}
          viewOnly={isEdit}
        />

        {/* HESA Course ID */}
        <CustomField.Text
          form={form}
          placeholder={"HESA Course ID "}
          name={"hesaCourseId"}
          labelName={"HESA Course ID "}
          viewOnly={isEdit}
        />

        {/* Course Type */}
        {isEdit && (
          <CustomField.SelectField
            viewOnly={isEdit}
            form={form}
            name={"courseType"}
            disabled={true}
            labelName={" Course Type"}
            placeholder={"Course Type"}
            optional={false}
            options={[
              {
                value: "DEGREE_COURSE",
                label: "DEGREE",
              },
              {
                value: "DIPLOMA_COURSE",
                label: "DIPLOMA",
              },
            ]}
          />
        )}

        {/* Degree */}
        {form.watch("courseType") === "DEGREE_COURSE" && (
          <CustomField.SelectField
            form={form}
            optional={false}
            name={"degreeType"}
            viewOnly={isEdit}
            labelName={"Type Of Degree"}
            placeholder={"Select Type Of Degree"}
            options={[
              {
                value: "UNDERGRADUATE",
                label: "Undergraduate",
              },
              {
                value: "POSTGRADUATE",
                label: "Postgraduate",
              },
            ]}
          />
        )}

        {/* Diploma */}
        {form.watch("courseType") === "DIPLOMA_COURSE" && (
          <CustomField.SelectField
            optional={false}
            form={form}
            viewOnly={isEdit}
            name={"diplomaType"}
            labelName={"Type Of Diploma"}
            placeholder={"Select Type Of Diploma"}
            options={[
              {
                value: "HIGHER_EDUCATION",
                label: "Higher Education",
              },
              {
                value: "VOCATIONAL_OR_PROFESSIONAL",
                label: "Vocational / Professional",
              },
            ]}
          />
        )}

        {/* Intended Award */}
        <CustomField.Text
          form={form}
          viewOnly={isEdit}
          name={"intendedAward"}
          labelName={"Intended Award"}
          optional={false}
          placeholder={"Enter Intended Award"}
        />

        {/* Course Description */}
        <CustomField.TextArea
          form={form}
          name={"courseDescription"}
          labelName={"Course Description "}
          placeholder={"Enter Course Description"}
          optional={false}
          viewOnly={isEdit}
        />

        {/* Study Modes */}
        <CustomField.MultiCheckField
          style="flex flex-wrap mt-2 gap-3 items-center"
          optional={false}
          form={form}
          viewOnly={isEdit}
          name={"studyModes"}
          labelName={"Study Modes"}
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
          placeholder={"Select Study Modes"}
        />
      </div>
    </div>
  );
};

export default AdvanceCourseInputForm;
