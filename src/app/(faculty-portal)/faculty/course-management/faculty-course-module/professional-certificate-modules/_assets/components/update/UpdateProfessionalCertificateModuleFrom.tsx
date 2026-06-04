/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useAuth } from "@/app/hook/userContext";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  IProfessionalCertificateModuleForm,
  ProfessionalCertificateModuleSchema,
} from "../../schemas/moduleSchema";
import { ProfessionalCertificateModuleDefaultValue } from "../../utils/professional_certificate_moduleDefaultValue";
import Form_field from "../formField/form_field";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";

const UpdateProfessionalCertificateModuleFrom = ({
  setOpen,
  data,
}: {
  setOpen: any;
  data: any;
}) => {
  const auth = useAuth();
  const token = auth?.user?.accessToken as string;
  const queryClient = useQueryClient();

  const form = useForm<IProfessionalCertificateModuleForm>({
    resolver: zodResolver(ProfessionalCertificateModuleSchema.update),
    defaultValues: ProfessionalCertificateModuleDefaultValue(data),
  });

  // updateCourseSession
  const updateProfessionalCertificateModuleMutation = useApiMutation({
  path: "sub-agent-info/register/",
  method: "PATCH",
  onSuccess: (data) => {
    toast.success("Successfully created sub-agent!");
    form.reset();
    setOpen(false);
    queryClient.invalidateQueries({ queryKey: ["fetch-All-sub-agents"] });
  },
  onError: (error) => {
    showToast("error", error || "Failed to create sub-agent");
  },
});

  //. Define a submit handler.
  function onSubmit(values: IProfessionalCertificateModuleForm) {
    // createNewSubAgentMutation.mutate(values);
    console.log("update session", values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <Form_field form={form} />
        </div>

        {/* login button  */}
        <div className="flex gap-x-3 justify-end items-center">
          <Button
            onClick={() => setOpen(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={updateProfessionalCertificateModuleMutation?.isPending}
            type="submit"
            className="py-2 px-8 bg-[#013E5B] hover:bg-[#73b7d6]"
          >
            {updateProfessionalCertificateModuleMutation?.isPending && (
              <Loader2 className="animate-spin" />
            )}
            Update
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UpdateProfessionalCertificateModuleFrom;
