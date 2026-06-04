/* eslint-disable @typescript-eslint/no-explicit-any */
import { CustomField } from "@/components/common/fields/cusInputField";

interface FormType {
  control: any;
}

const UpdateFormField = ({ form }: { form: FormType }) => {
  return (
    <>
      <CustomField.Text
        form={form}
        name="firstName"
        labelName="first Name"
        optional={false}
        placeholder="first Name"
      />
      <CustomField.Text
        form={form}
        name="lastName"
        labelName="Last Name"
        placeholder="Last Name"
      />
      <CustomField.Text
        form={form}
        name="username"
        labelName="username"
        placeholder="username"
        optional={false}
      />

      <CustomField.Text
        form={form}
        name="companyName"
        labelName="companyName"
        placeholder="companyName"
        disabled={true}
      />
      <CustomField.Text
        form={form}
        name="internalReference"
        labelName="internal Reference"
        placeholder="internal Reference"
        disabled={true}
      />

      <CustomField.Text
        form={form}
        name="email"
        labelName="email"
        placeholder="email"
        optional={false}
      />

      <CustomField.PhoneNumber
        form={form}
        name="mobile"
        labelName="mobile Number"
        placeholder="mobile Number"
        optional={false}
      />
      <CustomField.Text
        form={form}
        name="address"
        labelName="address"
        placeholder="address"
        optional={false}
      />
      <CustomField.SingleSelectField
        form={form}
        name="userStatus"
        labelName="Status"
        placeholder="select status"
        defaultValue={"ACTIVE"}
        options={["ACTIVE", "PENDING"]}
      />
    </>
  );
};

export default UpdateFormField;
