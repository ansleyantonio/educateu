/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import ActionButton from "@/components/common/button/actionButton";
import onFormError from "@/utils/formError";
import { zodResolver } from "@hookform/resolvers/zod";
import { RefreshCw } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
// import { AdvanceModuleSchema } from "../../../../advance-modules/_assets/schemas/moduleSchema";
// import { AdvanceModuleDefaultValue } from "../../../../advance-modules/_assets/utils/advanceModuleDefaultValue";
import ModuleFilter_Form_field from "../formField/Module_Filter_form_field";
import { AdvanceModuleDefaultValue } from "../../../utils/ModuleDefaultValue";
import { AdvanceModuleSchema } from "../../../schemas/module/advanceModuleSchema";

const FilterModuleFrom = ({
  setFilterData,
  setCurrentPage,
}: {
  setFilterData: any;
  setCurrentPage: (page: number) => void;
}) => {
  const form = useForm<z.infer<typeof AdvanceModuleSchema.filter>>({
    resolver: zodResolver(AdvanceModuleSchema.filter),
    //defaultValues: defaultValue,
    mode: "onChange",
  });

  //. Define a submit handler.
  function onSubmit(values: z.infer<typeof AdvanceModuleSchema.filter>) {
    setFilterData(values);
    setCurrentPage(1);
  }

  const handelResetForm = () => {
    form.reset(AdvanceModuleDefaultValue({ estimatedTimeToComplete: 0 }));
    setFilterData({});
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onFormError)}
        className="space-y-4"
      >
        <div className="">
          <ModuleFilter_Form_field form={form} />
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
            loadingContent="Applying Filter..."
            type="submit"
            buttonContent="Apply Filter"
            handleOpen={() => form.handleSubmit(onSubmit)}
          />
        </div>
      </form>
    </FormProvider>
  );
};

export default FilterModuleFrom;
