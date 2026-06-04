/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { Form } from "@/components/ui/form";
import onFormError from "@/utils/formError";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  AdvanceModuleSchema,
  IAdvanceModuleForm,
} from "../../../schemas/module/advanceModuleSchema";
import { AdvanceModuleDefaultValue } from "../../../utils/ModuleDefaultValue";
import Form_field from "../formField/Module_form_field";
import ActionButton from "@/components/common/button/actionButton";
import { PlusIcon } from "lucide-react";

const CreateModuleForm = ({
  setOpen,
  moduleType,
}: {
  setOpen: (data: boolean) => void;
  moduleType: string;
}) => {
  const form = useForm<IAdvanceModuleForm>({
    resolver: zodResolver(AdvanceModuleSchema.create),
    defaultValues: AdvanceModuleDefaultValue({
      courseType: (moduleType + "_COURSE").toUpperCase(),
    }),
  });

  const queryClient = useQueryClient();

  // createNewSubAgentMutation
  const createNewAdvanceModuleMutation = useApiMutation({
    method: "POST",
    path: "course-modules/create",
    onSuccess: (data) => {
      showToast("success", data);
      form.reset();
      setOpen(false);
      queryClient.invalidateQueries({
        queryKey: [`fetch-${moduleType}-module-list`],
      });
    },
    onError: (error: any) => {
      if (error) {
        showToast("error", error || "Something went wrong!");
      }
    },
  });

  //. Define a submit handler.
  function onSubmit(values: IAdvanceModuleForm) {
    const newModule = {
      ...values,
      moduleType: moduleType.toUpperCase(),
    };
    createNewAdvanceModuleMutation.mutate(newModule);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onFormError)}
        className="space-y-4"
      >
        <Form_field form={form} />

        {/* login button  */}
        <div className="flex gap-x-3 justify-end items-center">
          <ActionButton
            type="button"
            handleOpen={() => setOpen(false)}
            buttonContent="Cancel"
            variant="outline"
          />
          <ActionButton
            handleOpen={() => form.handleSubmit(onSubmit, onFormError)}
            buttonContent="Create"
            icon={<PlusIcon />}
            isPending={createNewAdvanceModuleMutation.isPending}
            loadingContent="Creating..."
          />
        </div>
      </form>
    </Form>
  );
};

export default CreateModuleForm;
