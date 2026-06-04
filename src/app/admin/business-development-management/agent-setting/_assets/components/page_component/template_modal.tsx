/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import ActionButton from "@/components/common/button/actionButton";
import { CustomField } from "@/components/common/fields/cusInputField";
import { Button } from "@/components/ui/custom_ui/button";
import { Form } from "@/components/ui/custom_ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuths } from "@/hooks/userContext";
import { useEffect } from "react";

type CreateAgreementTemplateProps = {
  groupType: "internal" | "external";
  isLoading?: boolean;
  form: any;
  handleSave: () => void;
  onClose: (data: boolean) => void;
  isSubmitting: boolean;
  viewOnly?: boolean;
  isOpen?: boolean;
};

export const AgreementTemplateModal = ({
  isOpen,
  onClose,
  groupType,
  form,
  handleSave,
  isSubmitting,
  viewOnly = false,
}: CreateAgreementTemplateProps) => {
  const { editAccess } = useAuths();

  const { data: awardingBodies } = useFetchData({
    path: `awarding-bodies`,
    queryKey: "fetch-awarding-bodies",
    method: "GET",
  });

  const { data: commissionGroups } = useFetchData({
    path: `business-development-management/agent/commission/groups?type=${groupType.toUpperCase()}`,
    queryKey: "fetch-commission-groups",
    method: "GET",
  });

  const handleClose = () => {
    onClose(true);
    form.reset({
      name: "",
      awardingBodyId: "",
      commissionGroupId: "",
      templateType: "",
      agreement: "",
    });
  };

  // Prevent modal from capturing focus when editor dropdown is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow escape to close modal only if not actively using variable dropdown
      if (e.key === "Escape") {
        const variableDropdown = document.querySelector(
          ".variable-suggestion-dropdown"
        );
        if (variableDropdown && !variableDropdown.classList.contains("hidden")) {
          e.stopPropagation();
          return;
        }
      }
    };

    const modalContent = document.querySelector("[role='dialog']");
    if (modalContent) {
      (modalContent as HTMLElement).addEventListener("keydown", handleKeyDown as EventListener);
      return () => {
        (modalContent as HTMLElement).removeEventListener("keydown", handleKeyDown as EventListener);
      };
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl w-full overflow-y-scroll max-h-screen" 
        // Important: Allow focus to escape to editor dropdowns
        onPointerDownOutside={(e) => {
          const target = e.target as HTMLElement;
          if (
            target.closest(".variable-suggestion-dropdown") ||
            target.closest("[role='listbox']") ||
            target.closest(".radix-select-content")
          ) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          const variableDropdown = document.querySelector(
            ".variable-suggestion-dropdown"
          );
          if (variableDropdown) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>
            Create ({groupType === "internal" ? "Internal" : "External"}) Agent
            Agreement Template
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)}>
            <div className="p-4">
              <div className="flex justify-around gap-4 items-center mb-4 mt-4">
                <div className="w-full">
                  <CustomField.Text
                    form={form}
                    name="name"
                    labelName="Template Name *"
                    placeholder="Enter template name"
                    viewOnly={!editAccess || viewOnly}
                  />
                </div>
                <div className="w-full">
                  <CustomField.SelectField
                    form={form}
                    name="awardingBodyId"
                    labelName="Awarding Body *"
                    placeholder="Select awarding body"
                    viewOnly={!editAccess || viewOnly}
                    options={awardingBodies?.data?.awardingBodies?.map(
                      (body: any) => ({ label: body.name, value: body.id })
                    )}
                  />
                </div>
                <div className="w-full">
                  <CustomField.SelectField
                    form={form}
                    name="commissionGroupId"
                    labelName="Commission Group Name *"
                    placeholder="Select commission group"
                    viewOnly={!editAccess || viewOnly}
                    options={commissionGroups?.data?.map((group: any) => ({
                      label: group.commissionGroupName,
                      value: group.commissionGroupId,
                    }))}
                  />
                </div>
              </div>
              <div className="space-y-6">
                <CustomField.RichTextEditor
                  form={form}
                  name="agreement"
                  labelName="Template Content *"
                  placeholder={
                    groupType === "external"
                      ? "Enter external agent agreement template content"
                      : "Enter internal agent agreement template content"
                  }
                  viewOnly={!editAccess || viewOnly}
                />
              </div>
              <div className="mt-4">
                <ActionButton
                  btnStyle={`bg-[#013E5B] text-white p-3 rounded-md self-end flex items-center justify-center ${
                    !editAccess ? "cursor-not-allowed opacity-50" : ""
                  }`}
                  disabled={isSubmitting || !editAccess}
                  loadingContent="Creating..."
                  type="submit"
                  buttonContent="Create"
                  isPending={isSubmitting}
                />
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};