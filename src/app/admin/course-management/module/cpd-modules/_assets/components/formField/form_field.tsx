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
      <div className="gap-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 items-top">
          <CustomField.Text
            form={form}
            name="title"
            labelName="module Title"
            placeholder="module Title"
            optional={false}
            viewOnly={isViewOnly}
          />

          <CustomField.Text
            form={form}
            name="code"
            labelName="module Code"
            placeholder="module Code"
            viewOnly={isViewOnly}
          />

          <CustomField.Text
            form={form}
            name="estimatedTimeToComplete"
            labelName="Estimated Time To Complete (in Minutes)"
            placeholder="Estimated Time To Complete"
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
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 items-top">
          <CustomField.TextArea
            form={form}
            name="description"
            labelName="module Description"
            placeholder="module Description"
            viewOnly={isViewOnly}
            optional={false}
          />
          <CustomField.TextArea
            form={form}
            name="learningOutcome"
            labelName="learning Outcome"
            placeholder="learning Outcome"
            viewOnly={isViewOnly}
          />
        </div>
      </div>
    </>
  );
};

export default Form_field;
