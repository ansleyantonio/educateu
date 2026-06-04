/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import {
  IFilterProfCertModuleForm,
  ProfessionalCertificateModuleSchema,
} from "../../schemas/moduleSchema";
import Filter_Form_field from "../formField/Filter_form_field";
import { RefreshCw } from "lucide-react";
import ActionButton from "@/components/common/button/actionButton";
import { ProfessionalCertificateModuleDefaultValue } from "../../utils/professional_certificate_moduleDefaultValue";

const FilterProfessionalCertificateModuleFrom = ({
  isLoading,
  setFilterData,
  setCurrentPage,
}: {
  isLoading: boolean;
  setFilterData: any;
  setCurrentPage: (page: number) => void;
}) => {
  const form = useForm<IFilterProfCertModuleForm>({
    resolver: zodResolver(ProfessionalCertificateModuleSchema.filter),
    defaultValues: ProfessionalCertificateModuleDefaultValue(),
    mode: "onChange",
  });

  //. Define a submit handler.
  function onSubmit(values: IFilterProfCertModuleForm) {
    setCurrentPage(1);
    setFilterData(values);
  }

  const handelResetForm = () => {
    form.reset(
      ProfessionalCertificateModuleDefaultValue({ estimatedTimeToComplete: 0 }),
    );
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

export default FilterProfessionalCertificateModuleFrom;
