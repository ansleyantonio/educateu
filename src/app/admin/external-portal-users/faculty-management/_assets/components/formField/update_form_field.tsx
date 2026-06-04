/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { CustomField } from "@/components/common/fields/cusInputField";

interface FormType {
  form: any;
  viewOnly?: boolean;
}
const Update_Form_field = ({ form, viewOnly }: FormType) => {
  const isViewOnly = viewOnly;

  return (
    <>
      <div className="space-y-4 pb-2">
        <CustomField.UploadProfilePicture
          form={form}
          name="photo"
          labelName="Profile Image"
          viewOnly={isViewOnly}
        />
        <CustomField.Text
          form={form}
          name="firstName"
          labelName="first Name"
          placeholder="first Name"
          optional={false}
          viewOnly={isViewOnly}
        />
        <CustomField.Text
          form={form}
          name="lastName"
          labelName="last Name"
          placeholder="last Name"
          viewOnly={isViewOnly}
        />
        <CustomField.Text
          form={form}
          name="username"
          labelName="username"
          placeholder="username"
          optional={false}
          viewOnly={isViewOnly}
        />
        <CustomField.Text
          form={form}
          name="email"
          labelName="contact email"
          placeholder="contact email"
          viewOnly={isViewOnly}
        />

        <CustomField.Text
          form={form}
          name="mobile"
          labelName="phone"
          placeholder="phone"
          viewOnly={isViewOnly}
        />

        <CustomField.SelectField
          form={form}
          name="userStatus"
          labelName="faculty Status"
          placeholder="faculty Status"
          viewOnly={isViewOnly}
          options={["ACTIVE", "DEACTIVATED"]}
        />
      </div>
    </>
  );
};

export default Update_Form_field;
