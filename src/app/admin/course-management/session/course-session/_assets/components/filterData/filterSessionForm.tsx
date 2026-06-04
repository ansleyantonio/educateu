/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import ActionButton from "@/components/common/button/actionButton";
import { RefreshCw } from "lucide-react";
import {
  IFilterSessionForm,
  SessionSchema,
} from "../../schemas/FilterSessionSchema";
import { SessionFilterDefaultValue } from "../../utils/sessionFilterValue";
import { CustomField } from "@/components/common/fields/cusInputField";

const FilterSessionFrom = ({
  isLoading,
  setFilterData,
  setCurrentPage,
}: {
  isLoading: boolean;
  setFilterData: any;
  setCurrentPage: (page: number) => void;
}) => {
  const defaultValue = {
    ...SessionFilterDefaultValue(),
  };

  const form = useForm<IFilterSessionForm>({
    resolver: zodResolver(SessionSchema.filterSession),
    defaultValues: defaultValue,
    mode: "onChange",
  });

  //. Define a submit handler.
  function onSubmit(values: IFilterSessionForm) {
    setFilterData(values);
    setCurrentPage(1);
  }

  const handelResetForm = () => {
    setCurrentPage(1);
    form.reset({ ...defaultValue });
    setFilterData({});
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        <CustomField.SelectField
          form={form}
          name="intakePeriod"
          labelName="Enter Intake Period"
          optional={false}
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
          placeholder="Select Session Year"
        />

        <CustomField.DatePickerAnd
          form={form}
          name="startDate"
          labelName="Start Date"
          optional={false}
          placeholder="Select Session Start Date"
        />

        <CustomField.DatePickerAnd
          form={form}
          name="endDate"
          labelName="End Date"
          optional={false}
          placeholder="Select Session End Date"
          mode="previous"
        />

        <CustomField.SelectField
          form={form}
          name="status"
          labelName="Session Status"
          optional={false}
          placeholder="Select Session Status"
          options={[
            { label: "Active", value: "ACTIVE" },
            { label: "Temporarily Active", value: "TEMPORARILY_ACTIVE" },
            { label: "Upcoming", value: "UPCOMING" },
            { label: "Closed", value: "CLOSED" },
          ]}
        />

        {/* login button  */}
        <div className="flex gap-x-3 justify-end items-center">
          <ActionButton
            handleOpen={() => handelResetForm()}
            type="button"
            variant="outline"
            tooltipContent="Reset"
            icon={<RefreshCw />}
          />

          <ActionButton
            isPending={isLoading}
            loadingContent="Applying Filter..."
            type="submit"
            buttonContent="Apply Filter"
            handleOpen={() => form.handleSubmit(onSubmit)}
          />
        </div>
      </form>
    </Form>
  );
};

export default FilterSessionFrom;
