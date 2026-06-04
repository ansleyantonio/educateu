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
import { useForm } from "react-hook-form";
import { CPDModuleSchema, I_CPD_ModuleForm } from "../../schemas/moduleSchema";
import { CPD_ModuleDefaultValue } from "../../utils/cpd_ModuleDefaultValue";
import Form_field from "../formField/form_field";

const DuplicateCPDModuleModal = ({
  existingModule,
  setOpen,
}: {
  setOpen: (data: boolean) => void;
  existingModule: any;
}) => {
  const data = { ...existingModule };
  delete data.title;
  delete data.code;

  const form = useForm<I_CPD_ModuleForm>({
    resolver: zodResolver(CPDModuleSchema.create),
    defaultValues: CPD_ModuleDefaultValue(data),
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
    delete values.code;
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
            buttonContent="Duplicate"
            handleOpen={() => {}}
            isPending={createNewCPDModuleMutation.isPending}
            loadingContent="Duplicating..."
          />
        </div>
      </form>
    </Form>
  );
};

export default DuplicateCPDModuleModal;
