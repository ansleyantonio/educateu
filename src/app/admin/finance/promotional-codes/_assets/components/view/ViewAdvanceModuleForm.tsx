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
  IPromotionalCodeFormSchema,
  PromotionalCodeSchema,
} from "../../schemas/promotionCode";
import { PromotionalCodeDefaultValue } from "../../utils/PromotionalCodeDefaultValue";
import PromotionCodeForm_field from "../formField/Promotional_code_form_field";

const ViewAndEditPromotionalCodeFrom = ({
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

  const form = useForm<IPromotionalCodeFormSchema>({
    resolver: zodResolver(PromotionalCodeSchema.update),
    defaultValues: PromotionalCodeDefaultValue(data),
  });

  const updateAdvanceCourseMutation = useApiMutation({
    method: "PUT",
    path: `promotional-codes/promotional-codes/${data?.id}`,
    onSuccess: (data) => {
      showToast("success", data);
      setIsEdit(false);
      handleOpen();
      queryClient.invalidateQueries({
        queryKey: [`fetch-promotional-code-list`],
      });
    },
    onError: (error: any) => {
      if (error?.response) {
        showToast("error", error.response?.data?.message);
      }
    },
  });

  //. Define a submit handler.
  function onSubmit(values: IPromotionalCodeFormSchema) {
    // const body = { ...values, id: data?.id };
    if (values?.NoExpirationDate) delete values?.endDate;
    updateAdvanceCourseMutation.mutate(values);
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onFormError)}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 gap-4">
          <PromotionCodeForm_field viewOnly={isEdit} form={form} />
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

export default ViewAndEditPromotionalCodeFrom;
