/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { CustomField } from "@/components/common/fields/cusInputField";

interface FormType {
  form: any;
  viewOnly?: boolean;
}
const Filter_Form_field = ({ form, viewOnly }: FormType) => {
  const isViewOnly = viewOnly;

  // watch credit value then set value to estimatedTimeToComplete
  // 1 credit = 10 hours
  // Automatically set estimatedTimeToComplete when credit changes

  // {
  //     title: defaultValues.title || "",
  //     code: defaultValues.code || "",
  //     type: defaultValues.type || "",
  //     estimatedTimeToComplete: Number(defaultValues.estimatedTimeToComplete) || 0,
  //   };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 items-end md:grid-cols-2">
        <CustomField.Text
          form={form}
          name="title"
          labelName="lesson Title"
          placeholder="lesson Title"
          optional={false}
          viewOnly={isViewOnly}
        />
        <CustomField.Text
          form={form}
          name="code"
          labelName="lesson Code"
          placeholder="lesson Code"
          optional={false}
          viewOnly={isViewOnly}
        />

        <CustomField.SelectField
          form={form}
          name="type"
          labelName="lesson Type"
          placeholder="lesson Type"
          options={[
            {
              label: "Diploma",
              value: "DIPLOMA",
            },
            {
              label: "Degree",
              value: "DEGREE",
            },
            {
              label: "CPD",
              value: "CPD",
            },
            {
              label: "Professional Certificate",
              value: "PROFESSIONAL_CERTIFICATE",
            },
          ]}
          optional={false}
          viewOnly={isViewOnly}
        />

        <CustomField.Text
          form={form}
          name="estimatedTimeToComplete"
          labelName={`Estimated Time To Complete ${
            ["DEGREE", "DIPLOMA"].includes(form.watch("type"))
              ? "(in Hours)"
              : ["CPD", "PROFESSIONAL_CERTIFICATE"].includes(form.watch("type"))
              ? "(in Minutes)"
              : ""
          }`}
          placeholder="Estimated Time To Complete"
          // disabled={true}
          viewOnly={isViewOnly}
        />
        {/* <CustomField.SelectField
          form={form}
          name="faculty"
          labelName="faculty"
          placeholder="faculty"
          options={["abc", "xyz", "John Doe"]}
          type="single"
          viewOnly={isViewOnly}
        /> */}
      </div>
    </>
  );
};

export default Filter_Form_field;
