/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import {
  CPDModuleSchema,
  IFilterCPdModuleForm,
} from "../../schemas/moduleSchema";
import { CPD_ModuleDefaultValue } from "../../utils/cpd_ModuleDefaultValue";
import Filter_Form_field from "../formField/Filter_form_field";
import ActionButton from "@/components/common/button/actionButton";
import { RefreshCw } from "lucide-react";

const FilterCPDModuleFrom = ({
  isLoading,
  setFilterData,
  setCurrentPage,
}: {
  isLoading: boolean;
  setFilterData: any;
  setCurrentPage: (page: number) => void;
}) => {
  const defaultValue = {
    ...CPD_ModuleDefaultValue(),
  };

  const form = useForm<IFilterCPdModuleForm>({
    resolver: zodResolver(CPDModuleSchema.filter),
    defaultValues: defaultValue,
    mode: "onChange",
  });

  //. Define a submit handler.
  function onSubmit(values: IFilterCPdModuleForm) {
    setFilterData(values);
    setCurrentPage(1);
  }

  const handelResetForm = () => {
    setCurrentPage(1);
    form.reset({ ...defaultValue, estimatedTimeToComplete: undefined });
    setFilterData({});
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="">
          <Filter_Form_field form={form} />
        </div>

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

export default FilterCPDModuleFrom;
