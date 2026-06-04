/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { CustomField } from "@/components/common/fields/cusInputField";
import { passwordRules } from "@/utils/passwordRules";
import { UseQueryResult, useQuery } from "@tanstack/react-query";

interface FormType {
  form: any;
  viewOnly?: boolean;
  usernameQuery: UseQueryResult<boolean, Error>;
  emailQuery: UseQueryResult<boolean, Error>;
  mobileQuery?: UseQueryResult<boolean, Error>;
}

const Form_field = ({ form, viewOnly,usernameQuery,
  emailQuery,
  mobileQuery, }: FormType) => {
  const isViewOnly = viewOnly;
  const password = form.watch("password");

  return (
    <>
      <div className="space-y-4">
        <CustomField.UploadProfilePicture
          form={form}
          name="photo"
          labelName="Profile Image"
          viewOnly={isViewOnly}
        />
        <CustomField.Text
          form={form}
          name="username"
          labelName="username"
          placeholder="Enter username"
          optional={false}
          viewOnly={isViewOnly}
          customMessage={
            usernameQuery.isLoading
              ? "Checking..."
              : usernameQuery.data
              ? "Email already exists!"
              : ""
          }
        />
        <CustomField.Text
          form={form}
          name="firstName"
          labelName="first Name"
          placeholder="Enter first Name"
          optional={false}
          viewOnly={isViewOnly}
        />
        <CustomField.Text
          form={form}
          name="lastName"
          labelName="last Name"
          placeholder="Enter last Name"
          viewOnly={isViewOnly}
        />

        <CustomField.Text
          form={form}
          name="email"
          labelName="contact email"
          placeholder="Enter contact email"
          optional={false}
          viewOnly={isViewOnly}
          customMessage={
            emailQuery.isLoading
              ? "Checking..."
              : emailQuery.data
              ? "Email already exists!"
              : ""
          }
        />

        <CustomField.Text
          form={form}
          name="mobile"
          labelName="phone"
          placeholder="Enter phone number here"
          viewOnly={isViewOnly}
        />
        <CustomField.Password
          form={form}
          name="password"
          labelName="password"
          placeholder="Enter password here"
          optional={false}
          viewOnly={isViewOnly}
        />

        {/* ✅ Password Rules UI */}
        {password && (
          <ul className="mt-2 space-y-1 text-sm">
            {passwordRules.map((rule, index) => {
              const passed = rule.test(password);
              return (
                <li
                  key={index}
                  className={`flex items-center gap-2 ${
                    passed ? "text-green-600" : "text-red-500"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full inline-block ${
                      passed ? "bg-green-600" : "bg-gray-400"
                    }`}
                  />
                  {rule.label}
                </li>
              );
            })}
          </ul>
        )}
        <CustomField.Password
          form={form}
          name="confirmPassword"
          labelName="Confirm Password"
          placeholder="Enter confirm password here"
          optional={false}
          viewOnly={isViewOnly}
        />
      </div>
    </>
  );
};

export default Form_field;
