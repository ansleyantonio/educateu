/* eslint-disable @typescript-eslint/no-explicit-any */
import { CustomField } from "@/components/common/fields/cusInputField";
import { UseFormReturn } from "react-hook-form";

interface IFormType {
  form: UseFormReturn<any>;
  isEdit?: boolean;
}

const Accreditation = ({ form, isEdit }: IFormType) => {
  return (
    <div className="rounded-md border shadow-md border-1 border-[#EAEDF0]">
      <h1 className="py-2 px-4 rounded-t-md border-b bg-[#FFFFFF] border-[#EAEDF0] text-bold text-[#272E35]">
        Accreditation
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 py-6 px-3 rounded-md bg-[#FFFFFF]">
        <CustomField.Text
          viewOnly={isEdit}
          form={form}
          placeholder="Enter Accreditation Body"
          name={"professionalAccreditation"}
          labelName={"Professional Accreditation"}
          optional={false}
        />

        <CustomField.Text
          viewOnly={isEdit}
          form={form}
          placeholder="Enter Accrediting Body Code"
          name={"accreditationBodyCode"}
          labelName={"Accrediting Body Code"}
        />
        <CustomField.SelectField
          viewOnly={isEdit}
          form={form}
          placeholder="Enter Accreditation Status"
          name={"accreditationStatus"}
          labelName={"Accreditation Status"}
          optional={false}
          options={[
            {
              value: "ACCREDITED",
              label: "Accredited",
            },
            {
              value: "PROVISIONALLY_ACCREDITED",
              label: "Provisionally Accredited",
            },
            {
              value: "NOT_ACCREDITED",
              label: "Not Accredited",
            },
          ]}
        />

        <CustomField.DatePickerAnd
          isDisabled={isEdit}
          form={form}
          placeholder="Enter Accreditation Start Date"
          name={"accreditationStartDate"}
          labelName={"Accreditation Start Date"}
        />
        <CustomField.DatePickerAnd
          isDisabled={isEdit}
          form={form}
          placeholder="Enter Accreditation End Date"
          name={"accreditationEndDate"}
          labelName={"Accreditation End Date"}
        />
      </div>
    </div>
  );
};

export default Accreditation;
