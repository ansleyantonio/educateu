/* eslint-disable @typescript-eslint/no-explicit-any */
import { CustomField } from "@/components/common/fields/cusInputField";
import { UseFormReturn } from "react-hook-form";

interface FormType {
  form: UseFormReturn<any>;
  isEditMode?: boolean;
}

const Form_field = ({ form, isEditMode }: FormType) => {
  return (
    <>
      <CustomField.Text
        form={form}
        name="name"
        labelName="Session Name"
        optional={false}
        viewOnly={isEditMode}
        placeholder="Enter Session Name"
      />

      <CustomField.SelectField
        form={form}
        name="intakePeriod"
        labelName="Enter Intake Period"
        optional={false}
        viewOnly={isEditMode}
        placeholder="Select Intake Period"
        options={[
          { value: "january-april", label: "January-April" },
          { value: "may-august", label: "May-August" },
          { value: "september-december", label: "September-December" },
        ]}
      />

      <CustomField.DatePickerAnd
        form={form}
        type="year"
        name="year"
        labelName="Session Year"
        optional={false}
        isEditMode={isEditMode}
        placeholder="Select Session Year"
        defaultDateSelect={true}
      />

      <CustomField.DatePickerAnd
        defaultDateSelect={true}
        form={form}
        name="startDate"
        labelName="Start Date"
        optional={false}
        isEditMode={isEditMode}
        mode="current"
        placeholder="Select Session Start Date"
      />

      <CustomField.DatePickerAnd
        form={form}
        name="endDate"
        labelName="End Date"
        optional={false}
        isEditMode={isEditMode}
        placeholder="Select Session End Date"
        mode="previous"
        defaultDateSelect={true}
      />

      <CustomField.SelectField
        form={form}
        name="status"
        labelName="Session Status"
        optional={false}
        viewOnly={isEditMode}
        placeholder="Select Session Status"
        options={[
          { label: "Active", value: "ACTIVE" },
          { label: "Temporarily Active", value: "TEMPORARILY_ACTIVE" },
          { label: "Upcoming", value: "UPCOMING" },
          { label: "Closed", value: "CLOSED" },
        ]}
      />
    </>
  );
};

export default Form_field;
