/* eslint-disable @typescript-eslint/no-explicit-any */
import { CustomField } from "@/components/common/fields/cusInputField";

const FinancialInformationInputForm = ({ form }: { form: any }) => {
  return (
    <div className="rounded-md border shadow-md border-1 border-[#EAEDF0]">
      <h1 className="py-2 px-4 rounded-t-md border-b bg-[#FFFFFF] border-[#EAEDF0] text-bold text-[#272E35]">
        Financial Information
      </h1>
      <div className="grid grid-cols-2 gap-4 py-6 px-3 rounded-md bg-[#FFFFFF]">
        {/* Tuition Fee Per Year */}
        <CustomField.Text
          form={form}
          name={"tuitionFeePerYear"}
          labelName={"Tuition Fee Per Year"}
          placeholder={"Tuition Fee Per Year"}
          optional={false}
        />

        {/* Tuition Fee Per Module */}
        <CustomField.Text
          form={form}
          name={"tuitionFeePerModule"}
          labelName={"Tuition Fee Per Module"}
          placeholder={"Tuition Fee Per Module"}
        />

        {/* Funding Information */}
        <CustomField.SelectField
          form={form}
          name={"fundingInformation"}
          labelName={"Funding Information"}
          placeholder={"Funding Information"}
          options={[
            {
              value: "scholarship",
              label: "Scholarship",
            },
            { value: "sponsorship", label: "Sponsorship" },
          ]}
          optional={false}
        />
      </div>
    </div>
  );
};

export default FinancialInformationInputForm;
