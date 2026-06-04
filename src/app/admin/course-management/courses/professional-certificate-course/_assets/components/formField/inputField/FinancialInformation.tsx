/* eslint-disable @typescript-eslint/no-explicit-any */
import { UseFormReturn } from "react-hook-form";
import { CustomField } from "@/components/common/fields/cusInputField";

interface IFormType {
  form: UseFormReturn<any>;
  isEdit?: boolean;
}

const FinancialInformation = ({ form, isEdit }: IFormType) => {
  return (
    <div className="rounded-md border shadow-md border-1 border-[#EAEDF0]">
      <h1 className="py-2 px-4 rounded-t-md border-b bg-[#FFFFFF] border-[#EAEDF0] text-bold text-[#272E35]">
        Financial Information
      </h1>
      <div className="grid grid-cols-2 gap-4 py-6 px-3 rounded-md bg-[#FFFFFF]">
        <CustomField.Number
          form={form}
          placeholder="Enter Course Fees"
          name={"courseFees"}
          labelName={"Course Fees"}
          optional={false}
        />

        <CustomField.SelectField
          viewOnly={isEdit}
          form={form}
          name={"fundingModel"}
          labelName={"Funding Model"}
          placeholder={"Select Funding Model"}
          options={[
            { value: "SELF_FUNDED", label: "Self Funded" },
            { value: "EMPLOYER_FUNDED", label: "Employer Funded" },
          ]}
        />
        <CustomField.SelectField
          viewOnly={isEdit}
          form={form}
          name={"eligibleForSponsorship"}
          labelName={"Eligible For Sponsorship"}
          placeholder={"Select Eligible For Sponsorship"}
          options={[
            {
              value: "YES",
              label: "Yes",
            },
            {
              value: "NO",
              label: "No",
            },
          ]}
        />
      </div>
    </div>
  );
};

export default FinancialInformation;
