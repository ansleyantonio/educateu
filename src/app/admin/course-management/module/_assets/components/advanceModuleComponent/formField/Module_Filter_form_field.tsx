/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { CustomField } from "@/components/common/fields/cusInputField";

interface FormType {
  form: any;
  viewOnly?: boolean;
}
const ModuleFilter_Form_field = ({ form }: FormType) => {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 items-end md:grid-cols-2">
        <CustomField.Text
          form={form}
          name="title"
          labelName="module Title"
          placeholder="module Title"
        />

        {/* <CustomField.Text
          form={form}
          name="credit"
          labelName="credit"
          placeholder="credit"
        /> */}

        <CustomField.SelectField
          form={form}
          name="credit"
          labelName="credit"
          placeholder="credit"
          options={[
            { label: "15", value: 15 },
            { label: "30", value: 30 },
            { label: "45", value: 45 },
            { label: "60", value: 60 },
          ]}
        />

        <CustomField.Text
          form={form}
          name="estimatedTimeToComplete"
          labelName="estimated Time To Complete"
          placeholder="estimated Time To Complete"
        />
      </div>
    </>
  );
};

export default ModuleFilter_Form_field;
