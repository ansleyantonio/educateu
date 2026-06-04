/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import ActionButton from "@/components/common/button/actionButton";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import onFormError from "@/utils/formError";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { CPDModuleSchema, I_CPD_ModuleForm } from "../../schemas/moduleSchema";
import { CPD_ModuleDefaultValue } from "../../utils/cpd_ModuleDefaultValue";
import Form_field from "../formField/form_field";

const CreateCPD_ModuleForm = ({
  setOpen,
}: {
  setOpen: (data: boolean) => void;
}) => {
  const form = useForm<I_CPD_ModuleForm>({
    resolver: zodResolver(CPDModuleSchema.create),
    defaultValues: CPD_ModuleDefaultValue(),
  });
  const queryClient = useQueryClient();
  // createNewSubAgentMutation
  const createNewCPDModuleMutation = useApiMutation({
    method: "POST",
    path: "course-modules/create",
    onSuccess: (data) => {
      showToast("success", data);
      form.reset();
      setOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["fetch-cpd-module-list"],
      });
    },
    onError: (error: any) => {
      if (error?.response) {
        showToast("error", error.response?.data?.message);
      }
    },
  });

  //. Define a submit handler.
  function onSubmit(values: I_CPD_ModuleForm) {
    createNewCPDModuleMutation.mutate(values);
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
          <Button
            onClick={() => setOpen(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <ActionButton
            buttonContent="Create"
            handleOpen={() => {}}
            icon={<PlusIcon />}
            isPending={createNewCPDModuleMutation.isPending}
            loadingContent="Creating..."
          />
        </div>
      </form>
    </Form>
  );
};

export default CreateCPD_ModuleForm;
