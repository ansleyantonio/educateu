/* eslint-disable @typescript-eslint/no-explicit-any */
import { CustomField } from "@/components/common/fields/cusInputField";

const FinancialInformation = ({
  form,
  isEdit,
}: {
  form: any;
  isEdit: boolean;
}) => {
  return (
    <div className="rounded-md border shadow-md border-1 border-[#EAEDF0]">
      <h1 className="py-2 px-4 rounded-t-md border-b bg-[#FFFFFF] border-[#EAEDF0] text-bold text-[#272E35]">
        Financial Information
      </h1>
      <div className="grid grid-cols-2 gap-4 py-6 px-3 rounded-md bg-[#FFFFFF]">
        <CustomField.Text
          viewOnly={isEdit}
          form={form}
          name={"free"}
          labelName={"course Fee"}
          placeholder="course Fee"
        />

        <CustomField.SingleSelectField
          viewOnly={isEdit}
          form={form}
          name={"fundingModel"}
          labelName={"funding Model"}
          placeholder="funding Model"
          options={["SELF_FUNDED", "EMPLOYER_FUNDED"]}
        />

        <CustomField.SingleSelectField
          viewOnly={isEdit}
          form={form}
          name={"eligibleForSponsorship"}
          labelName={"eligible For Sponsorship"}
          placeholder="eligible For Sponsorship"
          options={["YES", "NO"]}
        />
      </div>
    </div>
  );
};

export default FinancialInformation;
