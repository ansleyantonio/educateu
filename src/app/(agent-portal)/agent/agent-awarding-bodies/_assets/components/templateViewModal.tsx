/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import ActionButton from "@/components/common/button/actionButton";
import { CustomField } from "@/components/common/fields/cusInputField";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuths } from "@/hooks/userContext";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

type VersionHistoryItem = {
  id: string;
  name: string;
  templateText: string;
  templateType: string;
  versions: number;
  updatedAt: string;
};

type TemplateDialogProps = {
  isOpen: boolean;
  isLoading?: boolean;
  isPending?: boolean;
  onClose: () => void;
  templateName: string;
  matchId?: string;
  currentAgreement?: number;
  handleAcceptAgreement?: () => Promise<void>;
  handleDownload?: (versionId: string) => Promise<void>;
  versionHistory: VersionHistoryItem[];
};

export const TemplateViewModal = ({
  isOpen,
  isLoading,
  isPending,
  matchId,
  onClose,
  templateName,
  versionHistory,
  handleAcceptAgreement,
  handleDownload,
  currentAgreement,
}: TemplateDialogProps) => {
  const { user } = useAuths();
  const token = user?.token;

  const [selectedVersionId, setSelectedVersionId] = useState<string>("");

  const form = useForm({
    defaultValues: {
      content: "",
    },
  });

  // Select the current version initially and when currentAgreement changes
  useEffect(() => {
    if (isOpen && versionHistory && versionHistory.length > 0) {
      const current = versionHistory.find(
        (v) => v.versions === currentAgreement
      );
      if (current) {
        setSelectedVersionId(current.id);
        form.reset({ content: current.templateText });
      }
    }
  }, [versionHistory, currentAgreement, isOpen]);

  const selectedVersion = versionHistory?.find(
    (v) => v.id === selectedVersionId
  );

  // Reset form when selected version changes
  useEffect(() => {
    if (selectedVersion?.templateText) {
      form.reset({ content: selectedVersion.templateText });
    }
  }, [selectedVersion?.templateText, form]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedVersionId("");
      form.reset({ content: "" });
    }
  }, [isOpen, form]);

  const isLatest =
    selectedVersion?.versions === versionHistory?.length &&
    selectedVersion?.versions !== currentAgreement;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[85vh] p-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              {templateName}
              {selectedVersion && (
                <span className="text-blue-600">
                  V.{String(selectedVersion.versions).padStart(2, "0")}
                </span>
              )}
              {isLatest ? (
                <Badge
                  variant="secondary"
                  className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5"
                >
                  Latest Agreement
                </Badge>
              ) : selectedVersion?.versions === currentAgreement ? (
                <Badge
                  variant="secondary"
                  className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5"
                >
                  Current Agreement
                </Badge>
              ) : null}
            </h2>
          </DialogTitle>
        </DialogHeader>

        {/* Body */}
        {isLoading ? (
          <div className="flex flex-1 overflow-hidden">
            {/* Skeleton for Version History Sidebar */}
            <div className="w-60 border-r bg-gray-50 overflow-y-auto flex-shrink-0">
              <div className="relative p-6">
                <div className="space-y-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-start gap-3 ml-3">
                      {/* Skeleton Dot */}
                      <div className="relative z-10 mt-3 ml-[-29px] w-3 h-3 rounded-full bg-gray-300 animate-pulse" />
                      
                      {/* Skeleton Text */}
                      <div className="flex-1 px-2 space-y-2">
                        <div className="h-4 bg-gray-300 rounded animate-pulse w-24"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Skeleton for Template Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {/* Skeleton Label */}
                <div className="h-5 bg-gray-300 rounded animate-pulse w-48"></div>
                
                {/* Skeleton Content Box */}
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/5"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden">
            {/* Version History Sidebar */}
            <div className="w-60 border-r bg-gray-50 overflow-y-auto flex-shrink-0">
              <div className="relative p-6">
                {/* Vertical line */}
                <div className="absolute top-12 bottom-0 left-5 w-[2px] bg-gray-200" />

                {versionHistory?.length > 0 ? (
                  <div className="space-y-6">
                    {versionHistory.map((version) => {
                      const isActive = version.id === selectedVersionId;
                      const isCurrent = version.versions === currentAgreement;
                      const isLatestVersion =
                        version.versions === versionHistory.length;

                      return (
                        <div
                          key={version.id}
                          onClick={() => setSelectedVersionId(version.id)}
                          className={`flex items-start gap-3 cursor-pointer transition rounded-lg p-2 ml-3
                  ${
                    isActive
                      ? "bg-blue-50 border border-blue-200"
                      : "hover:bg-gray-100"
                  }
                `}
                        >
                          {/* Dot */}
                          <div
                            className={`relative z-10 mt-3 ml-[-29px] w-3 h-3 rounded-full border-2
                    ${
                      isActive
                        ? "bg-blue-600 border-blue-600"
                        : isCurrent
                        ? "bg-green-500 border-green-500"
                        : "bg-white border-gray-400"
                    }
                  `}
                          />

                          {/* Text */}
                          <div className="flex-1 px-2">
                            <div className="text-sm font-medium flex items-center gap-1">
                              Version{" "}
                              {String(version.versions).padStart(2, "0")}
                              {isCurrent && (
                                <span className="text-[10px] bg-green-100 text-green-700 px-1 py-0.5 rounded">
                                  Current
                                </span>
                              )}
                              {isLatestVersion && !isCurrent && (
                                <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1 py-0.5 rounded">
                                  Latest
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(version.updatedAt).toLocaleString([], {
                                month: "2-digit",
                                day: "2-digit",
                                year: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 rounded bg-blue-100 border border-blue-300">
                    <div className="text-sm font-medium">No Versions</div>
                  </div>
                )}
              </div>
            </div>

            {/* Template Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedVersion ? (
                <CustomField.RichTextEditor
                  form={form}
                  name="content"
                  labelName={`Content - Version ${String(
                    selectedVersion.versions
                  ).padStart(2, "0")} `}
                  placeholder="Template content"
                  viewOnly={true}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">
                    Select a version to view content.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        {!isLoading && (
          <div className="border-t px-6 py-4 flex justify-end gap-3 flex-shrink-0">
            {handleAcceptAgreement && isLatest && (
              <ActionButton
                handleOpen={handleAcceptAgreement}
                buttonContent="Accept Latest Agreement"
                variant="primary"
                loadingContent="Accepting..."
                isPending={isPending}
              />
            )}
            {handleDownload && (
              <ActionButton
                handleOpen={() => handleDownload(selectedVersionId)}
                buttonContent="Download"
                variant="outline"
                disabled={!selectedVersionId}
              />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};