/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import ActionButton from "@/components/common/button/actionButton";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { Form } from "@/components/ui/form";
import onFormError from "@/utils/formError";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  IPromotionalCodeFormSchema,
  PromotionalCodeSchema,
} from "../../schemas/promotionCode";
import { PromotionalCodeDefaultValue } from "../../utils/PromotionalCodeDefaultValue";
import PromotionCodeForm_field from "../formField/Promotional_code_form_field";

const CreatePromotionalCodeForm = ({
  setOpen,
}: {
  setOpen: (data: boolean) => void;
}) => {
  const form = useForm<IPromotionalCodeFormSchema>({
    resolver: zodResolver(PromotionalCodeSchema.create),
    defaultValues: PromotionalCodeDefaultValue(),
  });

  const queryClient = useQueryClient();

  // createNewSubAgentMutation
  const createPromotionalCodeMutation = useApiMutation({
    method: "POST",
    path: "promotional-codes/promotional-codes",
    onSuccess: (data) => {
      showToast("success", data);
      form.reset();
      setOpen(false);
      queryClient.invalidateQueries({
        queryKey: [`fetch-promotional-code-list`],
      });
    },
    onError: (error: any) => {
      if (error) {
        showToast("error", error || "Something went wrong!");
      }
    },
  });

  //. Define a submit handler.
  function onSubmit(values: IPromotionalCodeFormSchema) {
    console.log("promotional code", values);
    delete values.NoExpirationDate;
    createPromotionalCodeMutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onFormError)}
        className="space-y-4"
      >
        <PromotionCodeForm_field form={form} />

        {/* login button  */}
        <div className="flex gap-x-3 justify-end items-center">
          <ActionButton
            handleOpen={() => setOpen(false)}
            buttonContent="Cancel"
            variant="outline"
          />
          <ActionButton
            handleOpen={() => form.handleSubmit(onSubmit, onFormError)}
            buttonContent="Create"
            icon={<PlusIcon />}
            isPending={createPromotionalCodeMutation.isPending}
            loadingContent="Creating..."
          />
        </div>
      </form>
    </Form>
  );
};

export default CreatePromotionalCodeForm;
