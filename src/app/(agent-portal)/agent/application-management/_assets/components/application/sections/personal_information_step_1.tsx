/* eslint-disable @typescript-eslint/no-explicit-any */

import { EthnicitySelect } from "@/components/common/application/sections/selectField/ethnicitySelect";
import { CustomField } from "@/components/common/fields/cusInputField";
import { countryList, nationality } from "@/components/json/CountriesJson";

const Personal_information_step_1 = ({
  form,
  emailVerifyStatus,
}: {
  form: any;
  emailVerifyStatus?: boolean;
}) => {
  const sex = form.watch("personalInformation.sex");
  const nationalIdentityType = form.watch(
    "personalInformation.nationalIdentityType"
  );

  // console.log("sex-------------", emailVerifyStatus);
  // if sex value is  MALE or FEMALE then otherSex value "" set
  if (sex === "MALE" || sex === "FEMALE") {
    form.setValue("personalInformation.otherSex", "");
  }

  const ethnicityOptions = [
    {
      label: "White",
      options: [
        { label: "White British", value: "white_british" },
        { label: "White Irish", value: "white_irish" },
        { label: "White Other", value: "white_other" },
      ],
    },
    {
      label: "Mixed / Multiple Ethnic Groups",
      options: [
        {
          label: "Mixed White and Black Caribbean",
          value: "mixed_white_black_caribbean",
        },
        {
          label: "Mixed White and Black African",
          value: "mixed_white_black_african",
        },
        { label: "Mixed White and Asian", value: "mixed_white_asian" },
        { label: "Mixed Other", value: "mixed_other" },
      ],
    },
    {
      label: "Asian / Asian British",
      options: [
        { label: "Asian Indian", value: "asian_indian" },
        { label: "Asian Pakistani", value: "asian_pakistani" },
        { label: "Asian Bangladeshi", value: "asian_bangladeshi" },
        { label: "Asian Chinese", value: "asian_chinese" },
        { label: "Asian Other", value: "asian_other" },
      ],
    },
    {
      label: "Black / African / Caribbean / Black British",
      options: [
        { label: "Black African", value: "black_african" },
        { label: "Black Caribbean", value: "black_caribbean" },
        { label: "Black Other", value: "black_other" },
      ],
    },
    {
      label: "Other Ethnic Group",
      options: [
        { label: "Arab", value: "arab" },
        { label: "Any other ethnic group", value: "any_other_ethnic" },
      ],
    },
    {
      label: "Prefer not to say",
      options: [{ label: "Prefer not to say", value: "prefer_not_to_say" }],
    },
  ];

  return (
    <div className=" w-full grid grid-cols-1 items-top gap-x-4 gap-y-5 lg:grid-cols-2">
      <CustomField.Text
        form={form}
        name="personalInformation.firstName"
        labelName="First Name"
        optional={false}
        placeholder="First Name"
      />

      <CustomField.Text
        form={form}
        name="personalInformation.lastName"
        labelName="Last Name"
        optional={false}
        placeholder="Last Name"
      />

      <CustomField.Text
        form={form}
        name="personalInformation.email"
        labelName="Email"
        optional={false}
        placeholder="Email"
        disabled={emailVerifyStatus}
      />

      <CustomField.DatePickerAnd
        form={form}
        name="personalInformation.dateOfBirth"
        labelName="Date of birth"
        optional={false}
        placeholder="Date of birth"
        mode="future"
      />
      {/* Date of Birth */}

      <CustomField.SelectField
        form={form}
        name="personalInformation.countryOfBirth"
        labelName="Country of Birth"
        optional={false}
        placeholder="Country of Birth"
        options={countryList}
        isImageShow={true}
      />

      <CustomField.SelectField
        form={form}
        name="personalInformation.currentNationality"
        labelName="Current Nationality"
        optional={false}
        placeholder="Current Nationality"
        options={nationality}
        isImageShow={true}
      />

      <CustomField.SelectField
        form={form}
        name="personalInformation.sex"
        labelName="Sex"
        options={[
          { label: "MALE", value: "MALE" },
          { label: "FEMALE", value: "FEMALE" },
          { label: "OTHER", value: "OTHER" },
        ]}
        placeholder="Sex"
        showSearch={false}
        optional={false}
      />

      {/* if sex is OTHER then show custom input */}
      {sex === "OTHER" && (
        <CustomField.Text
          form={form}
          name="personalInformation.otherSex"
          labelName="Sex(Other)"
          placeholder="Please specify"
          optional={false}
          // customMessage={`${
          //   form.watch("personalInformation.OtherSex") ? "" : "Please specify"
          // }`}
        />
      )}

      {/* <SexSelect form={form} /> */}

      <EthnicitySelect
        form={form}
        name="personalInformation.ethnicity"
        placeholder="Select ethnicity"
        labelName="Ethnicity"
        options={ethnicityOptions}
        optional={false}
      />

      <CustomField.PhoneNumber
        form={form}
        name="personalInformation.mobileNumber"
        labelName="Phone Number"
        optional={false}
        placeholder="Phone Number"
      />

      <CustomField.SelectField
        form={form}
        name="personalInformation.countryOfResidence"
        labelName="Country of Residence"
        optional={false}
        placeholder="Country of Residence"
        options={countryList}
        isImageShow={true}
      />

      <CustomField.Text
        form={form}
        name="personalInformation.currentAddress"
        labelName="Current Address"
        optional={false}
        placeholder="Current Current"
      />

      <CustomField.Text
        form={form}
        name="personalInformation.currentPostCode"
        labelName="Current Post Code"
        placeholder="Current Post Code"
      />
      <CustomField.Text
        form={form}
        name="personalInformation.permanentAddress"
        labelName="Permanent Address"
        placeholder="Permanent Address"
      />
      <CustomField.SelectField
        form={form}
        name="personalInformation.nationalIdentityType"
        labelName="National Identification Type"
        options={["Passport", "National Identification Card"]}
        placeholder="National Identification Type"
      />
      <CustomField.Text
        form={form}
        name="personalInformation.nationalIdentityNumber"
        labelName={`${
          nationalIdentityType === "Passport"
            ? "Passport Number"
            : "National Identification Number"
        }`}
        placeholder={`${
          nationalIdentityType === "Passport"
            ? "Passport Number"
            : "National Identification Number"
        }`}
      />
    </div>
  );
};

export default Personal_information_step_1;
