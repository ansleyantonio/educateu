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

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <CustomField.Text
          form={form}
          name="lessonTitle"
          labelName="lesson Title"
          placeholder="lesson Title"
          optional={false}
          viewOnly={isViewOnly}
        />
        <CustomField.Text
          form={form}
          name="lessonCode"
          labelName="lesson Code"
          placeholder="lesson Code"
          optional={false}
          viewOnly={isViewOnly}
        />

        <CustomField.SingleSelectField
          form={form}
          name="lessonType"
          labelName="lesson Type"
          placeholder="lesson Type"
          options={["Diploma", "Degree"]}
          optional={false}
          viewOnly={isViewOnly}
        />

        <CustomField.Text
          form={form}
          name="estimatedTimeToComplete"
          labelName="estimated Time To Complete"
          placeholder="estimated Time To Complete"
          // disabled={true}
          viewOnly={isViewOnly}
        />
        <CustomField.SelectField
          form={form}
          name="faculty"
          labelName="faculty"
          placeholder="faculty"
          options={["abc", "xyz", "John Doe"]}
          type="single"
          viewOnly={isViewOnly}
        />
      </div>
    </>
  );
};

export default Filter_Form_field;
