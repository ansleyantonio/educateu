/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CustomField } from "@/components/common/fields/cusInputField";
interface FormType {
  form: any;
  viewOnly?: boolean;
  nonEdit?: boolean;
  editableField?: string;
}

const ReadOnlyWithTooltip = ({ children, isReadOnly }: any) => {
  if (!isReadOnly) return children;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>{children}</div>
        </TooltipTrigger>

        <TooltipContent className="bg-gray-500">
          <p className="text-[10px]">Only Overall Course Fee is editable</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const CourseFinanceFormField = ({
  form,
  viewOnly,
  nonEdit,
  editableField,
}: FormType) => {
  const isReadOnly = (fieldName: string) => {
    if (viewOnly && !editableField) return true;

    if (viewOnly && editableField) {
      return editableField !== fieldName;
    }

    return false;
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReadOnlyWithTooltip isReadOnly={isReadOnly("courseName")}>
          <CustomField.Text
            form={form}
            name="courseName"
            labelName="Course Name"
            placeholder="Enter Course Name"
            optional={false}
            viewOnly={isReadOnly("courseName")}
          />
        </ReadOnlyWithTooltip>
        <CustomField.Number
          form={form}
          name="overallCourseFee"
          labelName="Overall Course Fee"
          placeholder="Enter Overall Course Fee"
          optional={false}
          viewOnly={isReadOnly("overallCourseFee")}
        />
        <ReadOnlyWithTooltip isReadOnly={isReadOnly("courseName")}>
          <CustomField.Text
            form={form}
            name="startDate"
            labelName="Start Date"
            placeholder="YYYY-MM-DD"
            optional={false}
            viewOnly={isReadOnly("startDate")}
          />
        </ReadOnlyWithTooltip>
        <ReadOnlyWithTooltip isReadOnly={isReadOnly("courseName")}>
          <CustomField.Text
            form={form}
            name="endDate"
            labelName="End Date"
            placeholder="YYYY-MM-DD"
            optional={false}
            viewOnly={isReadOnly("endDate")}
          />
        </ReadOnlyWithTooltip>
        <ReadOnlyWithTooltip isReadOnly={isReadOnly("courseName")}>
          <CustomField.Text
            form={form}
            name="currencyType"
            labelName="Currency Type"
            placeholder="Enter Currency Type (e.g. USD)"
            optional={false}
            viewOnly={isReadOnly("currencyType")}
          />
        </ReadOnlyWithTooltip>
        <ReadOnlyWithTooltip isReadOnly={isReadOnly("courseName")}>
          <CustomField.SelectField
            form={form}
            name="promoCodeStatus"
            labelName="Promo Code Status"
            placeholder="Select Promo Code Status"
            options={[
              {
                label: "Active",
                value: "ACTIVE",
              },
              {
                label: "InActive",
                value: "INACTIVE",
              },
              {
                label: "Upcoming",
                value: "UPCOMING",
              },
            ]}
            // optional={false}
            viewOnly={isReadOnly("promoCodeStatus")}
          />
        </ReadOnlyWithTooltip>
      </div>
    </>
  );
};

export default CourseFinanceFormField;
