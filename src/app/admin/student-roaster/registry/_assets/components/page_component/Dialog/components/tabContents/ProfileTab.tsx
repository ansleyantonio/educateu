"use client";
import { CustomInputField } from "@/components/common/fields/custom_input_field";
import { SelectField } from "@/components/common/fields/SelectField";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { CustomField } from "@/components/common/fields/cusInputField";

type ProfileFormValues = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  countryOfBirth: string;
  currentNationality: string;
  sex: string;
  ethnicity: string;
  countryOfResidence: string;
  currentAddress: string;
  currentPostCode: string;
  permanentAddress: string;
  nationalIdentificationType: string;
  mobileNumber: string;
  nationalIdentificationNumber: string;
};

const ProfileTab = () => {
  const form = useForm<ProfileFormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      countryOfBirth: "",
      currentNationality: "",
      sex: "",
      ethnicity: "",
      countryOfResidence: "",
      currentAddress: "",
      currentPostCode: "",
      permanentAddress: "",
      nationalIdentificationType: "",
      mobileNumber: "",
      nationalIdentificationNumber: "",
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    console.log("Filter data:", data);
  };

  const handleReset = () => {
    form.reset();
  };

  return (
    <div className="p-4">
      <Form {...form}>
        <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
          <CustomField.Text
            form={form}
            name="firstName"
            labelName="First Name"
            placeholder="Enter First Name"
            optional={false}
            disabled={true}
          />
          <CustomField.Text
            form={form}
            name="lastName"
            labelName="Last Name"
            placeholder="Enter Last Name"
            optional={false}
            disabled={true}
          />
          <CustomField.Text
            form={form}
            name="dateOfBirth"
            labelName="Date Of Birth"
            placeholder="Date Of Birth"
            optional={false}
            disabled={true}
          />
          <CustomField.SelectField
            form={form}
            name="countryOfBirth"
            labelName="Country Of Birth"
            placeholder="Select Country Of Birth"
            optional={true}
            options={[
              { value: "banglaesh", label: "Bangladesh" },
              { value: "united-kingdom", label: "United Kingdom" },
            ]}
            disabled={true}
          />
          <CustomField.SelectField
            form={form}
            name="currentNationality"
            labelName="Current Nationality"
            placeholder="Select Country Of Birth"
            optional={true}
            options={[
              { value: "banglaesh", label: "Bangladesh" },
              { value: "united-kingdom", label: "United Kingdom" },
            ]}
            disabled={true}
          />
          <CustomField.SelectField
            form={form}
            name="sex"
            labelName="Sex"
            placeholder="Select Sex"
            optional={true}
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
            ]}
            disabled={true}
          />
          <CustomField.SelectField
            form={form}
            name="ethnicity"
            labelName="Ethnicity"
            placeholder="Select Ethnicity"
            optional={true}
            options={[
              { value: "banglaesh", label: "Bangladesh" },
              { value: "united-kingdom", label: "United Kingdom" },
            ]}
            disabled={true}
          />
          <CustomField.Text
            form={form}
            name="mobileNumber"
            labelName="Mobile Number"
            placeholder="Mobile Number"
            optional={true}
            disabled={true}
          />
          <CustomField.SelectField
            form={form}
            name="countryOfResidence"
            labelName="Country Of Residence"
            placeholder="Select Country Of Residence"
            optional={true}
            options={[
              { value: "banglaesh", label: "Bangladesh" },
              { value: "united-kingdom", label: "United Kingdom" },
            ]}
            disabled={true}
          />
          <CustomField.Text
            form={form}
            name="currentAddress"
            labelName="Current Address"
            placeholder="Current Address"
            optional={true}
            disabled={true}
          />
          <CustomField.Text
            form={form}
            name="currentPostCode"
            labelName="Current Post Code"
            placeholder="Enter Current Post Code"
            optional={true}
            disabled={true}
          />
          <CustomField.Text
            form={form}
            name="permanentAddress"
            labelName="Permanent Address"
            placeholder="Enter Permanent Address"
            optional={true}
            disabled={true}
          />
          <CustomField.SelectField
            form={form}
            name="nationalIdentificationType"
            labelName="National Identification Type"
            placeholder="Select National Identification Type"
            optional={true}
            options={[
              { value: "passport", label: "Passport" },
              { value: "nid", label: "NID" },
            ]}
            disabled={true}
          />
          <CustomField.Text
            form={form}
            name="nationalIdentificationNumber"
            labelName="National Identification Number"
            placeholder="Enter National Identification Number"
            optional={true}
            disabled={true}
          />
        </div>

        {/* <div className="flex gap-4 justify-end pt-4">
          <Button type="button" variant="secondary" onClick={handleReset}>
            Reset
          </Button>
          <Button type="submit" variant="primary">
            Save
          </Button>
        </div> */}
      </Form>
    </div>
  );
};

export default ProfileTab;
