import type React from "react";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { FileIcon, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BiSolidFilePdf } from "react-icons/bi";
import type { FormValues } from "./form-schema";
import { TruncateWithTooltip } from "@/utils/truncateWithTooltip";

interface FileState {
  file: File | null;
  preview: string | null;
}

interface FileUploadAreaProps {
  field: keyof Pick<
    FormValues,
    | "internalCommissionTemplate"
    | "externalCommissionTemplate"
    | "internalAgreementTemplate"
    | "externalAgreementTemplate"
  >;
  accept: string;
  helpText: string;
  form: UseFormReturn<FormValues>;
}

export const FileUploadArea: React.FC<FileUploadAreaProps> = ({
  field,
  accept,
  helpText,
  form,
}) => {
  const [fileState, setFileState] = useState<FileState>({
    file: null,
    preview: null,
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (accept !== "*/*") {
      const acceptedTypes = accept.split(",").map((type) => type.trim());
      if (!acceptedTypes.some((type) => file.type.match(type))) {
        alert("Invalid file type.");
        return;
      }
    }

    if (file.size > 800000) {
      alert("File size must be less than 800KB.");
      return;
    }

    setFileState({
      file,
      preview: URL.createObjectURL(file),
    });
    form.setValue(field, file);
  };

  const removeFile = () => {
    if (fileState.preview) {
      URL.revokeObjectURL(fileState.preview);
    }
    setFileState({ file: null, preview: null });
    form.setValue(field, undefined);
  };

  const getFileIcon = (file: File | null) => {
    if (!file) return <FileIcon className="w-12 h-12 text-muted-foreground" />;

    if (file.type.startsWith("image")) {
      return <ImageIcon className="w-12 h-12 text-muted-foreground" />;
    }

    if (file.type === "application/pdf") {
      return <BiSolidFilePdf className="w-12 h-12 text-muted-foreground" />;
    }

    return <FileIcon className="w-12 h-12 text-muted-foreground" />;
  };

  return (
    <>
      {!fileState.file ? (
        <div className="relative p-6 text-center rounded-lg border-2 border-dashed border-[#CFD6DD]">
          <input
            type="file"
            accept={accept}
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="space-y-2">
            <div className="flex justify-center">
              <FileIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <span>Drag & Drop or </span>
              <span className="text-primary">Choose file</span>
              <span> to upload</span>
            </div>
            <p className="text-sm text-muted-foreground">{helpText}</p>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center p-4 mt-3 rounded-md bg-[#F5F7F9]">
          <div className="flex gap-2 items-center">
            {getFileIcon(fileState.file)}
            <div className="text-left">
              <TruncateWithTooltip text={fileState.file.name} />
              {/* <p className="text-sm font-medium">{fileState.file.name}</p> */}
              <p className="text-xs text-muted-foreground">
                {(fileState.file.size / 1024 / 1024).toFixed(1)}MB
              </p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Button
              type="button"
              variant="ghost"
              className="text-blue-700"
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = accept;
                input.onchange = (e) => {
                  const event =
                    e as unknown as React.ChangeEvent<HTMLInputElement>;
                  handleFileUpload(event);
                };
                input.click();
              }}
            >
              Replace
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={removeFile}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
