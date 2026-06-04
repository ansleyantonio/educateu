/* eslint-disable @typescript-eslint/no-explicit-any */
import { CustomField } from "@/components/common/fields/cusInputField";

const Accreditation = ({ form, isEdit }: { form: any; isEdit: boolean }) => {
  return (
    <div className="rounded-md border shadow-md border-1 border-[#EAEDF0]">
      <h1 className="py-2 px-4 rounded-t-md border-b bg-[#FFFFFF] border-[#EAEDF0] text-bold text-[#272E35]">
        Accreditation
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 py-6 px-3 rounded-md bg-[#FFFFFF]">
        <CustomField.Text
          viewOnly={isEdit}
          form={form}
          name={"professionalAccreditation"}
          labelName={"professional Accreditation"}
          placeholder="professional Accreditation"
          optional={false}
        />

        <CustomField.Text
          viewOnly={isEdit}
          form={form}
          name={"accreditationBodyCode"}
          labelName={"accrediting Body Code"}
          placeholder="accrediting Body Code"
        />

        <CustomField.DatePickerAnd
          isDisabled={isEdit}
          form={form}
          name="accreditationStartDate"
          labelName="Accreditation Start Date"
        />

        <CustomField.DatePickerAnd
          isDisabled={isEdit}
          form={form}
          name="accreditationEndDate"
          labelName="Accreditation End Date"
        />
      </div>
    </div>
  );
};

export default Accreditation;
