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
      <div className="grid grid-cols-1 gap-4 items-end md:grid-cols-2">
        <CustomField.Text
          form={form}
          name="title"
          labelName="Module Title"
          placeholder="Enter Module Title"
        />
        {/* <CustomField.Text */}
        {/*   form={form} */}
        {/*   name="code" */}
        {/*   labelName="Module Code" */}
        {/*   placeholder="Enter Module Code" */}
        {/* /> */}

        <CustomField.Text
          form={form}
          name="estimatedTimeToComplete"
          labelName="Estimated Time To Complete (in Minutes)"
          placeholder="Estimated Time To Complete"
        />
      </div>
    </>
  );
};

export default Filter_Form_field;
