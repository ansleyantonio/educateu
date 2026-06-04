/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/custom_ui/scroll-area";
import { useAuths } from "@/hooks/userContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { uploadSettingsData } from "../../controller/uploadFile";
import { dataBody } from "../../type";
import { AgreementsNotifications } from "./agreements-notifications";
import { CommissionSettings } from "./commission-settings";
import { EnrollmentSettings } from "./enrollment-settings";
import { formSchema, type FormValues } from "./form-schema";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";

export default function SettingsForm() {
  const auth = useAuths();
  const token = auth?.user?.token;

  const fileMutate = useMutation({
    mutationFn: (data: dataBody) => uploadSettingsData(data),
    onSuccess: (data) => {
      toast.success("Settings updated successfully");

      if (data.status === 200 || 201) {
        console.log("Settings updated successfully");
        toast.success("Settings updated successfully");
      }
    },
    onError: (error) => {
      console.error("Upload failed:", error);
      toast.error("Failed to update settings");
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      internalCommissionTemplate: undefined,
      externalCommissionTemplate: undefined,
      internalAgreementTemplate: undefined,
      externalAgreementTemplate: undefined,
      agentEnrollment: "EXTERNAL",
      disableNewApplication: false,
      expiryDateReminder: "1week",
    },
  });

  function onSubmit(formDataValues: FormValues) {
    const formData = new FormData();
    toast.success("Settings updated successfully");

    // Append files (if selected)
    if (formDataValues.internalCommissionTemplate) {
      formData.append(
        "internalCommissionTemplate",
        formDataValues.internalCommissionTemplate
      );
    }
    if (formDataValues.externalCommissionTemplate) {
      formData.append(
        "externalCommissionTemplate",
        formDataValues.externalCommissionTemplate
      );
    }
    if (formDataValues.internalAgreementTemplate) {
      formData.append(
        "internalAgreementTemplate",
        formDataValues.internalAgreementTemplate
      );
    }
    if (formDataValues.externalAgreementTemplate) {
      formData.append(
        "externalAgreementTemplate",
        formDataValues.externalAgreementTemplate
      );
    }

    // Append other form fields
    formData.append("agentEnrollment", formDataValues.agentEnrollment);
    formData.append(
      "disableNewApplication",
      String(formDataValues.disableNewApplication)
    );
    formData.append("expiryDateReminder", formDataValues.expiryDateReminder);

    const data: dataBody = {
      formData,
      token,
    };

    // fileMutate.mutate(data);
  }

  return (
    <PageWithBreadcrumb
      items={[
        { title: "Home", href: "/admin" },
        // {
        //   title: "business management",
        //   href: "/admin/business-development-management",
        // },
        { title: "Agent Settings" },
      ]}
    >
      <ScrollArea className="p-0 h-[calc(85vh-3rem)]">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CommissionSettings form={form} />
          <EnrollmentSettings form={form} />
          <AgreementsNotifications form={form} />
          <div className="flex gap-4 justify-end mr-2">
            <Button variant="outline" type="button">
              Cancel
            </Button>
            <Button type="submit">{`${
              fileMutate.isPending ? "Saving..." : "Save"
            }`}</Button>
          </div>
        </form>
      </ScrollArea>
    </PageWithBreadcrumb>
  );
}
