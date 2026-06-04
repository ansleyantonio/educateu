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
import {
  IProfessionalCertificateModuleForm,
  ProfessionalCertificateModuleSchema,
} from "../../schemas/moduleSchema";
import { ProfessionalCertificateModuleDefaultValue } from "../../utils/professional_certificate_moduleDefaultValue";
import Form_field from "../formField/form_field";

const CreateProfCertificateModuleForm = ({
  setOpen,
}: {
  setOpen: (data: boolean) => void;
}) => {
  const form = useForm<IProfessionalCertificateModuleForm>({
    resolver: zodResolver(ProfessionalCertificateModuleSchema.create),
    defaultValues: ProfessionalCertificateModuleDefaultValue(),
  });
  const queryClient = useQueryClient();
  // createNewSubAgentMutation
  const createNewProfessionalCertificateModuleMutation = useApiMutation({
    method: "POST",
    path: "course-modules/create",
    onSuccess: (data) => {
      showToast("success", data); // form.reset();
      setOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["fetch-professional-module-list"],
      });
    },
    onError: (error: any) => {
      if (error?.response) {
        showToast("error", error.response?.data?.message);
      }
    },
  });

  //. Define a submit handler.
  function onSubmit(values: IProfessionalCertificateModuleForm) {
    createNewProfessionalCertificateModuleMutation.mutate(values);
    // console.log("professional certificate Module", values);
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
            isPending={createNewProfessionalCertificateModuleMutation.isPending}
            buttonContent="Create"
            loadingContent="Create"
          />
        </div>
      </form>
    </Form>
  );
};

export default CreateProfCertificateModuleForm;
