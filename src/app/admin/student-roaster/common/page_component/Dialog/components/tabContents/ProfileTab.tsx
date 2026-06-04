"use client";
import { SelectDateField } from "@/app/admin/business-development-management/create-new-agent/_assets/utils/SelectDateField";
import { EthnicitySelect } from "@/components/common/application/sections/selectField/ethnicitySelect";
import ActionButton from "@/components/common/button/actionButton";
import { CustomField } from "@/components/common/fields/cusInputField";
import { countryList, nationality } from "@/components/json/CountriesJson";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Edit } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";

interface ProfileTabProps {
  mode?: string;
  profileInfo?: ProfileFormValues;
  editAccess?: boolean;
}

type ProfileFormValues = {
  firstName: string;
  lastName: string;
  dateOfBirth: Date | undefined; // store as Date, not string
  countryOfBirth: string;
  currentNationality: string;
  sex: string;
  ethnicity: string;
  countryOfResidence: string;
  currentAddress: string;
  currentPostCode: string;
  permanentAddress: string;
  nationalIdentityType: string;
  mobileNumber: string;
  nationalIdentityNumber: string;
};

const ProfileTab = ({
  mode,
  profileInfo,
  editAccess = true,
}: ProfileTabProps) => {
  const [isEdit, setIsEdit] = useState(false);
  const realMobile = useRef(profileInfo?.mobileNumber || "");

  const form = useForm<ProfileFormValues>({
    defaultValues: {
      firstName: profileInfo?.firstName || "",
      lastName: profileInfo?.lastName || "",
      dateOfBirth: profileInfo?.dateOfBirth
        ? new Date(profileInfo.dateOfBirth) // keep as Date
        : undefined,
      countryOfBirth: profileInfo?.countryOfBirth || "",
      currentNationality: profileInfo?.currentNationality || "",
      sex: profileInfo?.sex || "",
      ethnicity: profileInfo?.ethnicity || "",
      countryOfResidence: profileInfo?.countryOfResidence || "",
      currentAddress: profileInfo?.currentAddress || "",
      currentPostCode: profileInfo?.currentPostCode || "",
      permanentAddress: profileInfo?.permanentAddress || "",
      nationalIdentityType: profileInfo?.nationalIdentityType || "",
      mobileNumber: profileInfo?.mobileNumber || "",
      nationalIdentityNumber: profileInfo?.nationalIdentityNumber || "",
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    const payload = {
      ...data,
      dateOfBirth: data.dateOfBirth
        ? data.dateOfBirth.toISOString().split("T")[0] // format for API
        : null,
    };
  };

  const handleCancel = () => {
    form.reset();
    setIsEdit(false);
  };

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

  // useEffect(() => {
  //   if (!isEdit) {
  //     form.setValue("mobileNumber", maskString(realMobile.current));
  //   } else {
  //     form.setValue("mobileNumber", maskString(realMobile.current));
  //   }
  // }, [isEdit, form]);

  return (
    <div className="p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
            <CustomField.Text
              form={form}
              name="firstName"
              labelName="First Name"
              placeholder="Enter First Name"
              optional={false}
              viewOnly={!isEdit}
              disabled={!isEdit}
            />
            <CustomField.Text
              form={form}
              name="lastName"
              labelName="Last Name"
              placeholder="Enter Last Name"
              optional={false}
              viewOnly={!isEdit}
              disabled={!isEdit}
            />

            {/* Date of Birth using Date Picker */}
            <div className="flex flex-col gap-1">
              <label className="cusFormLabel">Date Of Birth</label>
              <SelectDateField
                value={form.watch("dateOfBirth")}
                onChange={(date) => form.setValue("dateOfBirth", date)}
                disabled={!isEdit}
                birthdate
              />
            </div>
            <CustomField.SelectField
              // control={form.control}
              form={form}
              name="countryOfBirth"
              labelName="Country Of Birth"
              placeholder="Select Country Of Birth"
              options={countryList}
              disabled={!isEdit}
            />
            <CustomField.SelectField
              // control={form.control}
              form={form}
              name="currentNationality"
              labelName="Current Nationality"
              placeholder="Select Nationality"
              options={nationality}
              disabled={!isEdit}
            />
            <CustomField.SelectField
              // control={form.control}
              form={form}
              name="sex"
              labelName="Sex"
              placeholder="Select Sex"
              options={[
                { label: "Male", value: "MALE" },
                { label: "Female", value: "FEMALE" },
                { label: "Other", value: "OTHER" },
              ]}
              disabled={!isEdit}
            />
            <EthnicitySelect
              labelName="Select Ethnicity"
              placeholder="Select Ethnicity"
              options={ethnicityOptions}
              form={form}
              name="ethnicity"
              disabled={!isEdit}
            />
            <CustomField.PhoneNumber
              form={form}
              name="mobileNumber"
              labelName="Mobile Number"
              placeholder="Mobile Number"
              // disabled={true}
              viewOnly={true}
              hasPhone={true}
            />
            <CustomField.SelectField
              // control={form.control}
              form={form}
              name="countryOfResidence"
              labelName="Country Of Residence"
              placeholder="Select Country Of Residence"
              options={countryList}
              disabled={!isEdit}
              optional={false}
            />
            <CustomField.Text
              form={form}
              name="currentAddress"
              labelName="Current Address"
              placeholder="Current Address"
              viewOnly={!isEdit}
              disabled={!isEdit}
            />
            <CustomField.Text
              form={form}
              name="currentPostCode"
              labelName="Current Post Code"
              placeholder="Enter Current Post Code"
              viewOnly={!isEdit}
              disabled={!isEdit}
            />
            <CustomField.Text
              form={form}
              name="permanentAddress"
              labelName="Permanent Address"
              placeholder="Enter Permanent Address"
              viewOnly={!isEdit}
              disabled={!isEdit}
            />
            <CustomField.Text
              form={form}
              name="nationalIdentityType"
              labelName="National Identification Type"
              placeholder="Select National Identification Type"
              viewOnly
              disabled
            />
            <CustomField.Text
              form={form}
              name="nationalIdentityNumber"
              labelName="National Identification Number"
              placeholder="Enter National Identification Number"
              viewOnly
              disabled
            />
          </div>

          {mode === "registry" && (
            <div className="flex gap-4 justify-end pt-4">
              {!isEdit ? (
                <ActionButton
                  disabled={!editAccess}
                  variant="primaryIcon"
                  icon={<Edit />}
                  buttonContent="Edit"
                  handleOpen={() => setIsEdit(true)}
                />
              ) : (
                <>
                  <Button type="submit" variant="primary">
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};

export default ProfileTab;
