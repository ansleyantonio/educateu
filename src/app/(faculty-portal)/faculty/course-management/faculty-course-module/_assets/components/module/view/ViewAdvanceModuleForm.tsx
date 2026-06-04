/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import ActionButton from "@/components/common/button/actionButton";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import onFormError from "@/utils/formError";
import { useQueryClient } from "@tanstack/react-query";
import { Edit2 } from "lucide-react";
import {
  AdvanceModuleSchema,
  IAdvanceModuleForm,
} from "../../../../advance-modules/_assets/schemas/moduleSchema";
import { AdvanceModuleDefaultValue } from "../../../../advance-modules/_assets/utils/advanceModuleDefaultValue";
import Form_field from "../../formField/Module_form_field";

const ViewAdvanceModuleFrom = ({
  setIsEdit,
  isEdit,
  data,
  handleOpen,
}: {
  setIsEdit: (value: boolean) => void;
  isEdit: boolean;
  data: any;
  handleOpen: () => void;
}) => {
  const queryClient = useQueryClient();

  const form = useForm<IAdvanceModuleForm>({
    resolver: zodResolver(AdvanceModuleSchema.update),
    defaultValues: AdvanceModuleDefaultValue(data),
  });
  // createNewAdvanceCourseMutation
  // const updateAdvanceCourseMutation = useApiMutation({
  //   method: "PATCH",
  //   path: "courses-modules/update",
  //   onSuccess: (data) => {
  //     showToast("success", data?.message);
  //     form.reset();
  //     handleOpen();
  //     queryClient.invalidateQueries({
  //       queryKey: ["fetch-advanced-course-list"],
  //     });
  //   },
  //   onError: (error: any) => {
  //     if (error?.response) {
  //       showToast("error", error.response?.data?.message);
  //     }
  //   },
  // });

  const updateAdvanceCourseMutation = useApiMutation({
    method: "PATCH",
    path: "course-modules/update",
    onSuccess: (data) => {
      showToast("success", data);
      setIsEdit(false);
      handleOpen();
      queryClient.invalidateQueries({
        queryKey: ["fetch-advanced-module-details"],
      });
    },
    onError: (error: any) => {
      if (error?.response) {
        showToast("error", error.response?.data?.message);
      }
    },
  });

  //. Define a submit handler.
  function onSubmit(values: IAdvanceModuleForm) {
    const body = { ...values, id: data?.id };

    updateAdvanceCourseMutation.mutate(body);
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onFormError)}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 gap-4">
          <Form_field viewOnly={isEdit} form={form} />
        </div>

        {/* login button  */}
        {isEdit && (
          <div className="flex gap-x-3 justify-end items-center">
            <ActionButton
              handleOpen={() => setIsEdit(false)}
              icon={<Edit2 />}
              buttonContent="Edit"
            />
          </div>
        )}

        {!isEdit && (
          <div className="flex gap-x-3 justify-end items-center">
            <ActionButton
              handleOpen={handleOpen}
              buttonContent="Cancel"
              variant="outline"
            />
            {/* <Button
              disabled={updateAdvanceCourseMutation?.isPending}
              type="submit"
            >
              {" "}
              update ss
            </Button> */}
            <ActionButton
              isPending={updateAdvanceCourseMutation?.isPending}
              buttonContent="Update"
              loadingContent="Updating..."
              handleOpen={() => form.handleSubmit(onSubmit, onFormError)}
            />
          </div>
        )}
      </form>
    </FormProvider>
  );
};

export default ViewAdvanceModuleFrom;
