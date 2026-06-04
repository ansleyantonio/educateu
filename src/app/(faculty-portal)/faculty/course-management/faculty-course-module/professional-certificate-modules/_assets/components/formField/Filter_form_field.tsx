/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { CustomField } from "@/components/common/fields/cusInputField";

interface FormType {
  form: any;
  viewOnly?: boolean;
}
const Filter_Form_field = ({ form }: FormType) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <CustomField.Text
          form={form}
          name="moduleTitle"
          labelName="module Title"
          placeholder="module Title"
        />
        <CustomField.Text
          form={form}
          name="moduleCode"
          labelName="module Code"
          placeholder="module Code"
        />

        <CustomField.SingleSelectField
          form={form}
          name="moduleType"
          labelName="module Type"
          placeholder="module Type"
          options={["Diploma", "Degree"]}
        />

        <CustomField.Text
          form={form}
          name="estimatedTimeToComplete"
          labelName="estimated Time To Complete"
          placeholder="estimated Time To Complete"
        />
        <CustomField.SelectField
          form={form}
          name="faculty"
          labelName="faculty"
          placeholder="faculty"
          options={["abc", "xyz", "John Doe"]}
          type="single"
        />

        <CustomField.SingleSelectField
          form={form}
          name="moduleStatus"
          labelName="module Status"
          placeholder="module Status"
          options={["ACTIVE", "INACTIVE"]}
        />
      </div>
    </>
  );
};

export default Filter_Form_field;
