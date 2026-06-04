/* eslint-disable @typescript-eslint/no-explicit-any */
import { CustomField } from "@/components/common/fields/cusInputField";

const Funds_step_7 = ({ form }: any) => {
  const fundingOptions = [
    { value: "none", label: "(None)" },
    { value: "self_funded", label: "Self-funded" },
    {
      value: "uk_government_student_loan",
      label: "UK Government Student Loan",
    },
    {
      value: "international_government_sponsorship",
      label: "International Government Sponsorship",
    },
    {
      value: "university_scholarship_bursary",
      label: "University Scholarship / Bursary",
    },
    { value: "research_grant", label: "Research Grant" },
    {
      value: "employer_corporate_sponsorship",
      label: "Employer / Corporate Sponsorship",
    },
    { value: "private_education_loan", label: "Private Education Loan" },
    { value: "family_support", label: "Family Support" },
    {
      value: "charitable_trust_or_foundation_grant",
      label: "Charitable Trust or Foundation Grant",
    },
    { value: "OTHER", label: "Other" },
  ];

  // watch source value
  const source = form.watch("fund.source");

  return (
    <div className="w-full grid grid-cols-1 items-top gap-x-4 gap-y-5">
      <CustomField.SelectField
        form={form}
        name="fund.source"
        labelName="Sources of Funds"
        optional={false}
        placeholder="Select Fund Source"
        options={fundingOptions}
      />

      {source === "OTHER" && (
        <CustomField.Text
          form={form}
          name="fund.otherSource"
          labelName="Source of Funds(Other)"
          optional={false}
          placeholder="Other Source"
        />
      )}
    </div>
  );
};

export default Funds_step_7;
