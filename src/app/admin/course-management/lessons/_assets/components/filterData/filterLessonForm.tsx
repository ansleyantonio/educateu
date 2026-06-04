/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { RefreshCw } from "lucide-react";
import ActionButton from "@/components/common/button/actionButton";
import { Form } from "@/components/ui/form";

import { IFilterLessonForm, LessonSchema } from "../../schemas/lessonSchema";
import { FilterLessonDefaultValue } from "../../utils/FilterLessonDefaultValue";
import Filter_Form_field from "../formField/Filter_form_field";
import onFormError from "@/utils/formError";

const FilterLessonFrom = ({
  isLoading,
  setFilterData,
  setCurrentPage,
}: {
  isLoading: boolean;
  setFilterData: any;
  setCurrentPage: (page: number) => void;
}) => {
  const form = useForm<IFilterLessonForm>({
    resolver: zodResolver(LessonSchema.filter),
    defaultValues: FilterLessonDefaultValue(),
    mode: "onChange",
  });

  //. Define a submit handler.
  function onSubmit(values: IFilterLessonForm) {
    if (values.estimatedTimeToComplete == 0) {
      delete values.estimatedTimeToComplete;
    }
    setFilterData(values);
    setCurrentPage(1);
  }

  const handelResetForm = () => {
    form.reset({});
    setFilterData({});
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onFormError)}
        className="space-y-4"
      >
        <div className="">
          <Filter_Form_field form={form} />
        </div>

        {/* login button  */}
        <div className="flex gap-x-3 justify-end items-center">
          <ActionButton
            handleOpen={() => handelResetForm()}
            type="button"
            variant="icon"
            tooltipContent="Reset"
            icon={<RefreshCw />}
          />
          <ActionButton
            isPending={isLoading}
            type="submit"
            buttonContent="Apply Filter"
            handleOpen={() => form.handleSubmit(onSubmit)}
          />
        </div>
      </form>
    </Form>
  );
};

export default FilterLessonFrom;
