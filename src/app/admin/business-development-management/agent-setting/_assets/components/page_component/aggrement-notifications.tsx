/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuths } from "@/hooks/userContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { FaPlus } from "react-icons/fa6";
import z from "zod";
import {
  useGetAgreementTemplates,
  useSubmitAgreementTemplate,
} from "../../query_controller/agreementTemplate";
import {
  useGetExpiryReminder,
  useSubmitExpiryReminder,
} from "../../query_controller/expiryRemainder";
import { AgreementAccordion } from "./template_accordion";
import { AgreementTemplateModal } from "./template_modal";
import ActionButton from "@/components/common/button/actionButton";

type AgreementNotificationsProps = {
  hasPostAndDeletePermission?: boolean;
};

// Schema for the modal form (new template creation)
const ModalFormSchema = z.object({
  agreement: z.string().min(2, { message: "Content needed." }),
  commissionGroupId: z.string().min(2, { message: "Commission Group needed." }),
  awardingBodyId: z.string().min(2, { message: "Awarding Body needed." }),
  name: z.string().min(2, { message: "Template Name needed." }),
});

export const AgreementNotifications = ({
  hasPostAndDeletePermission,
}: AgreementNotificationsProps) => {
  const { user } = useAuths();
  const token = user?.token;
  const [openModal, setOpenModal] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [daysBefore, setDaysBefore] = useState<number | null>(null);
  const [activeDialog, setActiveDialog] = useState<"internal" | "external" | null>(null);

  const queryClient = useQueryClient();

  const { data: internalTemplateData, isLoading: loadingInternal } =
    useGetAgreementTemplates(token, "INTERNAL") ?? { data: undefined };

  const { data: externalTemplateData, isLoading: loadingExternal } =
    useGetAgreementTemplates(token, "EXTERNAL") ?? { data: undefined };

  const { data: expiryReminder, isLoading: reminderLoading } =
    useGetExpiryReminder(token) ?? { data: undefined };

  // Form for modal (new template creation only)
  const modalForm = useForm<z.infer<typeof ModalFormSchema>>({
    resolver: zodResolver(ModalFormSchema),
    defaultValues: {
      agreement: "",
      commissionGroupId: "",
      awardingBodyId: "",
      name: "",
    },
  });

  const handleOpenModal = (dialogType: "internal" | "external") => {
    setActiveDialog(dialogType);
    setOpenModal(true);
    modalForm.reset({
      name: "",
      awardingBodyId: "",
      commissionGroupId: "",
      agreement: "",
    });
  };

  // Set initial expiry reminder setting
  useEffect(() => {
    if (expiryReminder?.data && expiryReminder.data.length > 0) {
      setDaysBefore(expiryReminder.data[0].daysBefore);
    }
  }, [expiryReminder]);

  // Mutations
  const { mutate: submitTemplate, isPending: isSubmittingTemplate } =
    useSubmitAgreementTemplate();
  const { mutate: submitReminder, isPending: isSubmittingReminder } =
    useSubmitExpiryReminder();

  const handleSubmitTemplate = (templateData: any, templateType: "INTERNAL" | "EXTERNAL") => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    submitTemplate(
      {
        html: templateData.agreement,
        templateType,
        commissionGroupId: templateData.commissionGroupId,
        awardingBodyId: templateData.awardingBodyId,
        name: templateData.name,
        token,
      },
      {
        onSuccess: () => {
          toast.success(`${templateType.toLowerCase()} agreement saved successfully`);
          queryClient.invalidateQueries({
            queryKey: ["agreementTemplates", templateType],
          });
          if (openModal) {
            setOpenModal(false);
            setActiveDialog(null);
          }
        },
        onError: (error: unknown) => {
          console.error(`Error saving ${templateType.toLowerCase()} template:`, error);
          toast.error(`Failed to save ${templateType.toLowerCase()} agreement`);
        },
      }
    );
  };

  const handleSubmitModalTemplate = () => {
    if (!activeDialog) return;
    const formData = modalForm.getValues();
    handleSubmitTemplate(formData, activeDialog.toUpperCase() as "INTERNAL" | "EXTERNAL");
  };

  const handleSubmitReminder = () => {
    if (!token || daysBefore === null) {
      toast.error("Authentication required or invalid days selection");
      return;
    }

    submitReminder(
      { daysBefore, token },
      {
        onSuccess: () => {
          toast.success(`Expiry reminder set to ${daysBefore} days successfully`);
        },
        onError: (error: unknown) => {
          console.error("Error saving reminder:", error);
          toast.error("Failed to save expiry reminder setting");
        },
      }
    );
  };

  // One mutation, but wrapped per-template
  const downloadMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/business-development-management/agent/agreement/${id}/pdf`,
        {
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
  });

  const handleDownload = async (id: string) => {
  setDownloadingId(id);
  return new Promise<void>((resolve, reject) => {
    downloadMutation.mutate(id, {
      onSuccess: (data) => {
        toast.success("Agreement fetched successfully!");
        const blob = new Blob([data], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.download = "Agreement.pdf";
        link.click();
        resolve();
        setDownloadingId(null);
      },
      onError: (error) => {
        console.error(error);
        toast.error("Failed to fetch agreement");
        reject(error);
        setDownloadingId(null);
      },
    });
  });
};



  if (loadingInternal || loadingExternal || reminderLoading)
    return <div>Loading...</div>;

  return (
    <Card className="mt-6">
      <CardHeader className="py-3 bg-[#F5F7F9]">
        <CardTitle className="font-semibold text-xl text-[#272E35]">
          Agreements and Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {/* Internal Templates Section */}
        <div className="flex flex-wrap lg:flex-nowrap lg:justify-between lg:items-center mb-4 mt-4 gap-2">
          <h2 className="font-medium text-md">Internal Agent Commission Rate Template</h2>
          <Button
            variant="primary"
            size="lg"
            onClick={() => handleOpenModal("internal")}
            disabled={!hasPostAndDeletePermission}
            className={`${!hasPostAndDeletePermission ? "opacity-50" : ""}`}
          >
            <FaPlus className="w-6 h-6 mr-2" />
            Create Internal Template
          </Button>
        </div>

        <div className="space-y-4">
          {internalTemplateData?.data?.map((template: any) => (
            <AgreementAccordion
              isSubmitting={isSubmittingTemplate}
              key={template?.id}
              groupType="internal"
              isLoading={loadingInternal}
              templateData={template}
              handleDownload={handleDownload}
              handleSave={(templateData) => handleSubmitTemplate(templateData, "INTERNAL")}
              isPending={downloadingId === template.id} 
              viewOnly={true}
              hasPostAndDeletePermission={hasPostAndDeletePermission}
              matchId={template?.matchId} 
            />
          ))}
          {(!internalTemplateData?.data || internalTemplateData.data.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              No internal templates found. Create your first template above.
            </div>
          )}
        </div>

        {/* External Templates Section */}
        <div className="flex flex-wrap lg:flex-nowrap lg:justify-between lg:items-center mb-4 mt-8">
          <h2 className="font-medium text-md">External Agent Commission Rate Template</h2>
          <Button
            variant="primary"
            size="lg"
            onClick={() => handleOpenModal("external")}
            disabled={!hasPostAndDeletePermission}
            className={`${!hasPostAndDeletePermission ? "opacity-50" : ""}`}
          >
            <FaPlus className="w-6 h-6 mr-2" />
            Create External Template
          </Button>
        </div>

        <div className="space-y-4">
          {externalTemplateData?.data?.map((template: any) => (
            <AgreementAccordion
              isSubmitting={isSubmittingTemplate}
              key={template.id}
              handleDownload={handleDownload}
              groupType="external"
              isLoading={loadingExternal}
              templateData={template}
              handleSave={(templateData) => handleSubmitTemplate(templateData, "EXTERNAL")}
             isPending={downloadingId === template.id} 
              viewOnly={true}
            hasPostAndDeletePermission={hasPostAndDeletePermission}
            matchId={template?.matchId} 
            />
          ))}
          {(!externalTemplateData?.data || externalTemplateData.data.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              No external templates found. Create your first template above.
            </div>
          )}
        </div>

        {/* Expiry Date Reminder Section */}
        <div className="mt-8 pt-6 border-t">
          <Label className="font-medium text-md">Expiry Date Reminder</Label>
          <div className="flex items-center gap-4 mt-2">
            <Select
              value={daysBefore ? daysBefore.toString() : undefined}
              onValueChange={(value) => {
                if (!hasPostAndDeletePermission) return;
                setDaysBefore(parseInt(value));
              }}
              disabled={!hasPostAndDeletePermission}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue
                  placeholder={daysBefore ? `${daysBefore} days before` : "Select days"}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="3">3 days before</SelectItem>
                  <SelectItem value="7">7 days before</SelectItem>
                  <SelectItem value="10">10 days before</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <ActionButton
              handleOpen={handleSubmitReminder}
              disabled={
                daysBefore === null || isSubmittingReminder || !hasPostAndDeletePermission
              }
              isPending={isSubmittingReminder}
              loadingContent="Saving..."
              buttonContent="Save Reminder"
            />
          </div>
        </div>

        {/* Modal for creating new templates */}
        <AgreementTemplateModal
          isLoading={isSubmittingTemplate}
          isOpen={openModal}
          onClose={() => {
            setOpenModal(false);
            setActiveDialog(null);
          }}
          groupType={activeDialog === "internal" ? "internal" : "external"}
          form={modalForm}
          handleSave={handleSubmitModalTemplate}
          isSubmitting={isSubmittingTemplate}
        />
      </CardContent>
    </Card>
  );
};
