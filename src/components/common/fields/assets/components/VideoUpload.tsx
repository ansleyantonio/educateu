/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";

const FILE_UPLOAD_ACCEPTS = {
  image: "image/*",
  video: "video/*",
  pdf: "application/pdf",
};

type FileType = keyof typeof FILE_UPLOAD_ACCEPTS;

interface UploadVideoFieldProps {
  form: UseFormReturn<any>;
  name: string;
  labelName?: string;
}

export const UploadVideoFile = ({
  form,
  name,
  labelName,
}: UploadVideoFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileType, setFileType] = useState<FileType | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const value = form.watch(name);

  useEffect(() => {
    if (value instanceof File) {
      setPreviewUrl(URL.createObjectURL(value));
      setFileType(getFileType(value.type));
    } else {
      setPreviewUrl(null);
      setFileType(null);
    }
  }, [value]);

  function getFileType(mimeType: string): FileType | null {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType === "application/pdf") return "pdf";
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsPending(true);
    form.setValue(name, file, { shouldValidate: true });
    setTimeout(() => {
      setIsPending(false);
    }, 500); // simulate upload time
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setFileType(null);
    form.setValue(name, null, { shouldValidate: true });
    if (inputRef.current) inputRef.current.value = "";
  };

  const renderPreview = () => {
    if (!previewUrl || !fileType) return null;

    const commonClass = cn(
      "w-full h-full object-cover rounded-md transition-all duration-500",
      isPending && "blur-md grayscale"
    );

    if (fileType === "image") {
      return (
        <Image
          src={previewUrl}
          alt="preview"
          onClick={() => setDialogOpen(true)}
          width={1000}
          height={1000}
          className={commonClass}
        />
      );
    } else if (fileType === "video") {
      return (
        <video
          src={previewUrl}
          controls
          onClick={() => setDialogOpen(true)}
          className={commonClass}
        />
      );
    } else if (fileType === "pdf") {
      return (
        <iframe
          src={previewUrl}
          className="w-full h-full rounded-md border"
          title="PDF Preview"
        />
      );
    }
  };

  return (
    <div className="flex flex-col gap-1">
      {labelName && <label className="text-sm font-medium">{labelName}</label>}

      <div className="flex overflow-hidden relative justify-center items-center w-full h-52 rounded-md border-2 border-dashed border-muted">
        {previewUrl ? (
          renderPreview()
        ) : (
          <div className="flex flex-col items-center text-muted-foreground">
            <UploadCloud className="mb-2 w-8 h-8" />
            <p className="text-sm">Click to upload a file</p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={Object.values(FILE_UPLOAD_ACCEPTS).join(",")}
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={handleFileChange}
        />

        {previewUrl && (
          <button
            type="button"
            className="absolute top-2 right-2 z-10 p-1 rounded-full shadow bg-background"
            onClick={handleRemove}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {form.formState.errors[name] && (
        <p className="text-sm text-destructive">
          {form.formState.errors[name]?.message as string}
        </p>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-full max-w-4xl h-[80vh]">
          {fileType === "image" && (
            <Image
              src={previewUrl!}
              alt="zoomed preview"
              className="object-contain w-full h-full"
            />
          )}
          {fileType === "video" && (
            <video
              src={previewUrl!}
              controls
              className="object-contain w-full h-full"
            />
          )}
          {fileType === "pdf" && (
            <iframe
              src={previewUrl!}
              className="w-full h-full"
              title="PDF Full View"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
