/* eslint-disable @typescript-eslint/no-explicit-any */
import { CustomField } from "@/components/common/fields/cusInputField";

const AccreditationAdnComplianceInputForm = ({
  form,
  isEdit,
}: {
  form: any;
  isEdit: boolean;
}) => {
  return (
    <div className="rounded-md border shadow-md border-1 border-[#EAEDF0]">
      <h1 className="py-2 px-4 rounded-t-md border-b bg-[#FFFFFF] border-[#EAEDF0] text-bold text-[#272E35]">
        Accreditation and Compliance
      </h1>
      <div className="grid grid-cols-2 gap-4 py-6 px-3 rounded-md bg-[#FFFFFF]">
        {/* Accrediting Body */}
        <CustomField.Text
          form={form}
          viewOnly={isEdit}
          name={"accreditationBody"}
          labelName={"Accrediting Body"}
          placeholder={"Accrediting Body"}
        />

        {/* Accreditation Status */}

        <CustomField.SelectField
          form={form}
          name={"accreditationStatus"}
          viewOnly={isEdit}
          labelName={"Accreditation Status"}
          placeholder={"Accreditation Status"}
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

        {/* Qualification Aim */}
        <CustomField.SelectField
          form={form}
          viewOnly={isEdit}
          name={"qualificationAim"}
          labelName={"Qualification Aim"}
          placeholder={"Qualification Aim"}
          options={[
            {
              value: "accredited",
              label: "Bachelor degree",
            },
            {
              value: "honours",
              label: "honours",
            },
            {
              value: "etc",
              label: "etc",
            },
          ]}
        />
      </div>
    </div>
  );
};

export default AccreditationAdnComplianceInputForm;
