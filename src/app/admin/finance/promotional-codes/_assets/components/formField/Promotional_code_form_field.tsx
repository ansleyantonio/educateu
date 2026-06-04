/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { CustomField } from "@/components/common/fields/cusInputField";

interface FormType {
  form: any;
  viewOnly?: boolean;
}
const PromotionCodeForm_field = ({ form, viewOnly }: FormType) => {
  const isViewOnly = viewOnly;
  const NoExpirationDate = form.watch("NoExpirationDate");

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 items-top">
        <CustomField.Text
          form={form}
          name="codeName"
          labelName="code Name"
          placeholder="code Name"
          optional={false}
          viewOnly={isViewOnly}
        />

        <CustomField.SelectField
          form={form}
          name="status"
          labelName="status"
          placeholder="status"
          // optional={false}
          options={["ACTIVE", "INACTIVE"]}
          viewOnly={isViewOnly}
        />
        <CustomField.SelectField
          form={form}
          name="discountType"
          labelName="discount type"
          placeholder="discount type"
          options={["PERCENTAGE", "FIXED_AMOUNT"]}
          viewOnly={isViewOnly}
          optional={false}
        />

        <CustomField.Number
          form={form}
          numberType="float"
          name="discountValue"
          labelName="Discount Value"
          placeholder="Discount Value"
          optional={false}
          viewOnly={isViewOnly}
        />

        <CustomField.DatePickerAnd
          form={form}
          name="startDate"
          labelName="Start Data"
          placeholder="Start Data"
          optional={false}
          viewOnly={isViewOnly}
        />
        {!NoExpirationDate && (
          <CustomField.DatePickerAnd
            form={form}
            name="endDate"
            labelName="End Data"
            placeholder="End Data"
            optional={false}
            viewOnly={isViewOnly}
            // customMessage={"sss"}
          />
        )}
      </div>
      <CustomField.CheckField
        form={form}
        name="NoExpirationDate"
        labelName="No Expiration Date"
        placeholder="No expiration date"
        // optional={false}
        viewOnly={isViewOnly}
      />
    </>
  );
};

export default PromotionCodeForm_field;
