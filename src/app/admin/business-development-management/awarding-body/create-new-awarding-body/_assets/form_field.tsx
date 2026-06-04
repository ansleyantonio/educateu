import { useEffect } from "react";
import { CustomField } from "@/components/common/fields/cusInputField";
import { UseFormReturn } from "react-hook-form";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";

type Grade = {
  classification: string;
  percentageRange: string;
  ukGpaEquivalent?: number;
};

interface FormFieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  isDisabled?: boolean;
}

const Form_field = ({ form, isDisabled }: FormFieldProps) => {
  const { watch, setValue } = form;

  const grades = (watch("grades") || []) as Grade[];

  useEffect(() => {
    if (!grades || grades.length === 0) {
      setValue("grades", [
        { classification: "", percentageRange: "", ukGpaEquivalent: "" },
      ]);
    }
  }, [grades, setValue]);

  const addNewGrade = () => {
    const lastGrade = grades[grades.length - 1];
    if (!lastGrade?.classification || !lastGrade?.percentageRange) {
      toast.error(
        "Please fill all fields in the previous grade before adding a new one"
      );
      return;
    }

    setValue("grades", [
      ...grades,
      { classification: "", percentageRange: "", ukGpaEquivalent: "" },
    ]);
  };

  const removeGrade = (index: number) => {
    setValue(
      "grades",
      grades.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="h-full">
      {/* Basic Information */}
      <div className="shadow-md rounded-md border border-1 pb-10 border-[#EAEDF0]">
        <h1 className="bg-[#F5F7F9] rounded-t-md text-bold py-2 px-4 text-[#272E35] font-bold">
          Basic Information
        </h1>
        <div className="grid rounded-md grid-cols-2 gap-4 py-6 px-6">
          <CustomField.Text
            form={form}
            name="name"
            labelName="Name"
            placeholder="e.g. John"
            optional={false}
            disabled={isDisabled || false}
          />
          <CustomField.Text
            form={form}
            name="abbreviation"
            labelName="Abbreviation"
            placeholder="e.g UCAM"
            optional={false}
            disabled={isDisabled || false}
          />
          <div className="col-span-2">
            <CustomField.SingleSelectField
              form={form}
              name="status"
              labelName="Status"
              options={["ACTIVE", "INACTIVE"]}
              placeholder="Select status"
              optional={false}
              disabled={isDisabled || false}
            />
          </div>
        </div>
        <div className="pl-6">
          <CustomField.MultiCheckField
            style="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            optional={false}
            form={form}
            name="intakePeriod"
            labelName="Intake Period (Session)"
            placeholder="Intake Period (Session)"
            viewOnly={isDisabled || false}
            options={[
              { value: "january-april", label: "January-April" },
              { value: "may-august", label: "May-August" },
              { value: "september-december", label: "September-December" },
            ]}
          />
        </div>
      </div>

      <div className="shadow-md rounded-md my-4 border border-1 border-[#EAEDF0]">
        <h1 className="bg-[#F5F7F9] rounded-t-md text-bold py-2 px-4 text-[#272E35] font-bold">
          Create New Grade
        </h1>
        <div className="px-6 py-6 space-y-4">
          {grades.map((grade, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-start"
            >
              <CustomField.Text
                form={form}
                name={`grades.${index}.classification`}
                labelName={index === 0 ? "Classification" : undefined}
                placeholder="e.g. A, B+, Merit"
                optional={false}
                disabled={isDisabled || false}
              />
              <CustomField.Text
                form={form}
                name={`grades.${index}.percentageRange`}
                labelName={index === 0 ? "Percentage Range" : undefined}
                placeholder="e.g. 70-100%"
                optional={false}
                disabled={isDisabled || false}
                suffix="%"
              />
              <CustomField.Number
                form={form}
                name={`grades.${index}.ukGpaEquivalent`}
                labelName={
                  index === 0 ? "UK GPA Equivalent (Optional)" : undefined
                }
                numberType="float"
                disableTextFormat={true}
                placeholder="e.g. 4.0"
                viewOnly={isDisabled || false}
                optional
              />
              {!isDisabled && grades.length > 1 && (
                <button
                  type="button"
                  className={`text-red-600 h-full hover:underline ${
                    index === 0 ? "mt-3.5" : "flex items-center justify-center"
                  }`}
                  onClick={() => removeGrade(index)}
                >
                  <Trash2 />
                </button>
              )}
            </div>
          ))}

          {!isDisabled && (
            <div className="flex justify-end mt-4">
              <button
                type="button"
                className="text-blue-600 hover:underline"
                onClick={addNewGrade}
              >
                Add New Grade
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6 shadow-md rounded-md border border-1 border-[#EAEDF0]">
        <h1 className="bg-[#F5F7F9] rounded-t-md text-bold py-2 px-4 text-[#272E35] font-bold">
          Required Documents
        </h1>
        <div className="py-5 pl-6">
          <CustomField.MultiCheckField
            style="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            optional={false}
            form={form}
            name="selectRequiredDocuments"
            labelName="Select Required Documents"
            placeholder="Select documents"
            viewOnly={isDisabled || false}
            options={[
              { value: "qualification", label: "Qualification" },
              { value: "passport-id", label: "Passport/ID" },
              { value: "national-identification", label: "National Identification" },
              { value: "police-clearance", label: "Police Clearance" },
              { value: "transcripts", label: "Transcripts" },
              { value: "essay", label: "Essay" },
              { value: "cv", label: "CV" },
              { value: "proof-of-name-change", label: "Proof of Name Change" },
              { value: "english-certificates", label: "English Certificates" },
              { value: "personal-statement", label: "Personal Statement" },
              { value: "consent-form", label: "Consent Form" },
              { value: "references", label: "References" },
              { value: "other", label: "Other" },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default Form_field;
