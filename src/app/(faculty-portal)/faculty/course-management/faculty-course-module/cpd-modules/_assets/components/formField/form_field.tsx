/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { CustomField } from "@/components/common/fields/cusInputField";

interface FormType {
  form: any;
  viewOnly?: boolean;
}
const Form_field = ({ form, viewOnly }: FormType) => {
  const isViewOnly = viewOnly;

  // watch credit value then set value to estimatedTimeToComplete
  // 1 credit = 10 hours
  // Automatically set estimatedTimeToComplete when credit changes

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <CustomField.Text
          form={form}
          name="moduleTitle"
          labelName="module Title"
          placeholder="module Title"
          optional={false}
          viewOnly={isViewOnly}
        />
        <CustomField.Text
          form={form}
          name="moduleCode"
          labelName="module Code"
          placeholder="module Code"
          optional={false}
          viewOnly={isViewOnly}
        />

        <CustomField.SingleSelectField
          form={form}
          name="moduleType"
          labelName="module Type"
          placeholder="module Type"
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
        <CustomField.SwitchField
          form={form}
          name="forumDiscussionBoard"
          labelName="forum Discussion Board"
          placeholder="forum Discussion Board"
          // viewOnly={isViewOnly}
          disabled={isViewOnly}
        />
        <CustomField.TextArea
          form={form}
          name="moduleDescription"
          labelName="module Description"
          placeholder="module Description"
          viewOnly={isViewOnly}
        />
        <CustomField.TextArea
          form={form}
          name="learningOutcome"
          labelName="learning Outcome"
          placeholder="learning Outcome"
          viewOnly={isViewOnly}
        />
      </div>
    </>
  );
};

export default Form_field;
