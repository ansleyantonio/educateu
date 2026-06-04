/* eslint-disable @typescript-eslint/no-explicit-any */
import { CustomField } from "@/components/common/fields/cusInputField";

const GovernanceAndQualityAssuranceInputForm = ({
  form,
  isEdit,
}: {
  form: any;
  isEdit: boolean;
}) => {
  return (
    <div className="rounded-md border shadow-md border-1 border-[#EAEDF0]">
      <h1 className="py-2 px-4 rounded-t-md border-b bg-[#FFFFFF] border-[#EAEDF0] text-bold text-[#272E35]">
        Governance and Quality Assurance
      </h1>
      <div className="grid grid-cols-2 gap-4 py-6 px-3 rounded-md bg-[#FFFFFF]">
        <CustomField.DatePickerAnd
          form={form}
          name={"reviewDate"}
          isDisabled={isEdit}
          labelName={"Review Date"}
          placeholder={"Review Date"}
          optional={false}
        />
        <CustomField.DatePickerAnd
          form={form}
          isDisabled={isEdit}
          name={"approvalDate"}
          labelName={"Course Approval Date"}
          placeholder={"Course Approval Date"}
          optional={false}
        />

        <CustomField.Text
          form={form}
          viewOnly={isEdit}
          name={"courseLeader"}
          labelName={"Course Leader"}
          placeholder={"Course Leader"}
        />
        <CustomField.Text
          form={form}
          name={"governanceNotes"}
          labelName={"Governance Notes"}
          viewOnly={isEdit}
          placeholder={"Governance Notes"}
        />
      </div>
    </div>
  );
};

export default GovernanceAndQualityAssuranceInputForm;
