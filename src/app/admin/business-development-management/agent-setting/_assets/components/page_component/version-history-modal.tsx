'use client'
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomField } from "@/components/common/fields/cusInputField";
import { Form } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { Clock, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

type VersionHistoryItem = {
  id: string;
  name: string;
  templateText: string;
  templateType: string;
  versions: string;
  updatedAt: string;
};

type VersionHistoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  templateName: string;
  versionHistory: VersionHistoryItem[];
};

const VersionContent: React.FC<{
  content: string;
  version: string;
}> = ({ content, version }) => {
  const form = useForm({
    defaultValues: {
      content: content || "",
    },
  });

  // 🔥 Reset when content changes
  useEffect(() => {
    form.reset({ content: content || "" });
  }, [content, form]);

  return (
    <Form {...form}>
      <div className="space-y-4">
        <CustomField.RichTextEditor
          form={form}
          name="content"
          labelName={`Content - Version ${version}`}
          placeholder="Template content"
          viewOnly={true}
        />
      </div>
    </Form>
  );
};

const VersionSidebarItem: React.FC<{
  version: VersionHistoryItem;
  isSelected: boolean;
  isLatest: boolean;
  onClick: () => void;
}> = ({ version, isSelected, isLatest, onClick }) => {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60)
      );

      if (diffInHours < 1) return "Just now";
      if (diffInHours < 24) return `${diffInHours}h ago`;
      if (diffInHours < 48) return "Yesterday";
      return formatDate(dateString);
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 cursor-pointer border-l-4 transition-all duration-200 hover:bg-gray-50",
        isSelected
          ? "bg-secondary border-l-[#011C28] shadow-sm"
          : "border-l-transparent hover:border-l-gray-200"
      )}
    >
      <div className="flex-shrink-0">
        <FileText
          className={cn(
            "h-5 w-5",
            isSelected ? "text-[#011C28]" : "text-gray-400"
          )}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={cn(
              "text-sm font-medium",
              isSelected ? "text-[#011C28]" : "text-gray-900"
            )}
          >
            Version {version.versions}
          </span>
          {isLatest && (
            <Badge
              variant="secondary"
              className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5"
            >
              Current
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          <span>{formatTime(version.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
};

export const VersionHistoryModal = ({
  isOpen,
  onClose,
  templateName,
  versionHistory,
}: VersionHistoryModalProps) => {
  const [selectedVersionId, setSelectedVersionId] = useState<string>("");

  // Set the current (latest) version as initially selected
  useEffect(() => {
    if (versionHistory && versionHistory.length > 0) {
      setSelectedVersionId(versionHistory[0].id);
    }
  }, [versionHistory]);

  const selectedVersion = versionHistory?.find(
    (v) => v.id === selectedVersionId
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[85vh] p-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            Version History - {templateName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 min-h-0">
          {/* Sidebar */}
          <div className="w-80 border-r bg-gray-50/50 flex flex-col">
            <div className="p-4 border-b bg-white">
              <h3 className="font-medium text-gray-900">All Versions</h3>
              <p className="text-sm text-gray-500 mt-1">
                {versionHistory?.length || 0} versions available
              </p>
            </div>

            <ScrollArea className="flex-1">
              {!versionHistory || versionHistory.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <Clock className="mx-auto h-8 w-8 text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500">
                    No version history available
                  </p>
                </div>
              ) : (
                <div className="py-2 max-h-60">
                  {versionHistory.map((version, index) => {
                    const isLatest = index === 0;
                    const isSelected = selectedVersionId === version.id;

                    return (
                      <div key={version.id}>
                        <ScrollArea className="flex-1">
                          <VersionSidebarItem
                            version={version}
                            isSelected={isSelected}
                            isLatest={isLatest}
                            onClick={() => setSelectedVersionId(version.id)}
                          />
                          {index < versionHistory.length - 1 && (
                            <Separator className="my-0" />
                          )}
                        </ScrollArea>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {selectedVersion ? (
              <>
                {/* Content Header */}
                <div className="px-6 py-4 border-b bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-gray-900">
                        Version {selectedVersion.versions}
                      </h3>
                      {versionHistory &&
                        versionHistory[0].id === selectedVersion.id && (
                          <Badge className="bg-green-100 hover:bg-green-100 text-green-800">
                            Current Version
                          </Badge>
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>
                        {new Date(
                          selectedVersion.updatedAt
                        ).toLocaleString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content Body */}
                <ScrollArea className="flex-1">
                  <div className="p-6">
                    <VersionContent
                      content={selectedVersion.templateText}
                      version={selectedVersion.versions}
                    />
                  </div>
                </ScrollArea>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500">
                    Select a version to view its content
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
