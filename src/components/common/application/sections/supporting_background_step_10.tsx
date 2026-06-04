/* eslint-disable @typescript-eslint/no-explicit-any */

// export default DocumentPage;

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import { useAuths } from "@/hooks/userContext";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Download, Eye, File, FileText, Image, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

type UploadState = {
  cv: { file: File | null; preview: string | null };
  englishCertificates: { file: File | null; preview: string | null };
  essay: { file: File | null; preview: string | null };
  passportId: { file: File | null; preview: string | null };
  proofOfNameChange: { file: File | null; preview: string | null };
  qualification: { file: File | null; preview: string | null };
  nationalIdentification: { file: File | null; preview: string | null };
  policeClearance: { file: File | null; preview: string | null };
  transcripts: { file: File | null; preview: string | null };
  references: { file: File | null; preview: string | null };
  otherDocument: { file: File | null; preview: string | null };
};
interface FileItem {
  id: string;
  name: string;
  size: string;
  progress: number;
  status: "uploading" | "complete";
  timeLeft?: string;
  type: "pdf" | "image" | "other";
  path?: string;
  uploadStartTime?: number;
  lastProgressTime?: number;
  fieldName?: keyof UploadState;
}

// Helper function to determine file type
const getFileType = (fileName: string): "pdf" | "image" | "other" => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (extension === "pdf") return "pdf";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || ""))
    return "image";
  return "other";
};

const Supporting_background_step_10 = ({
  form,
  setUploads,
  uploads,
}: // handleFileDrop,
// handleFileSelect,
any) => {
  const [files, setFiles] = useState<FileItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = useAuths();
  const token = user?.user?.token;
  const queryClient = useQueryClient();

  // Calculate time left based on upload speed
  const calculateTimeLeft = (
    file: FileItem,
    currentProgress: number
  ): string => {
    if (!file.uploadStartTime || !file.lastProgressTime)
      return "calculating...";

    const timeElapsed = (Date.now() - file.uploadStartTime) / 1000;
    if (timeElapsed < 1 || currentProgress < 5) return "calculating...";

    const uploadSpeed = currentProgress / timeElapsed;
    const remainingProgress = 100 - currentProgress;
    const secondsLeft = Math.ceil(remainingProgress / uploadSpeed);

    if (secondsLeft < 60) return `${secondsLeft} seconds left`;
    if (secondsLeft < 3600)
      return `${Math.ceil(secondsLeft / 60)} minutes left`;
    return `${Math.ceil(secondsLeft / 3600)} hours left`;
  };

  // Upload file with progress tracking
  const uploadFileToServer = async (
    file: File,
    fileItem: FileItem
  ): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    return new Promise((resolve, reject) => {
      axios
        .post(`${process.env.NEXT_PUBLIC_API_URL}/uploads`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              const timeLeft = calculateTimeLeft(fileItem, progress);

              setFiles((prev) =>
                prev.map((f) =>
                  f.id === fileItem.id
                    ? {
                        ...f,
                        progress,
                        timeLeft,
                        lastProgressTime: Date.now(),
                      }
                    : f
                )
              );
            }
          },
        })
        .then((response) => resolve(response.data?.data?.path))
        .catch((error) => reject(error));
    });
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName?: keyof UploadState
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const uploadedPaths: string[] = [];
      const newFileItems: FileItem[] = [];

      for (const newFile of newFiles) {
        const fileSize = (newFile.size / (1024 * 1024)).toFixed(1);
        const fileType = getFileType(newFile.name);
        const now = Date.now();

        const newFileItem: FileItem = {
          id: Date.now().toString(),
          name: newFile.name,
          size: `${fileSize}MB`,
          progress: 0,
          status: "uploading",
          timeLeft: "calculating...",
          type: fileType,
          uploadStartTime: now,
          lastProgressTime: now,
          fieldName,
        };

        newFileItems.push(newFileItem);
        setFiles((prev) => [...prev, newFileItem]);

        try {
          const path = await uploadFileToServer(newFile, newFileItem);
          uploadedPaths.push(path);

          setFiles((prev) =>
            prev.map((file) =>
              file.id === newFileItem.id
                ? {
                    ...file,
                    progress: 100,
                    status: "complete",
                    timeLeft: undefined,
                    path: path,
                  }
                : file
            )
          );
        } catch (error) {
          setFiles((prev) => prev.filter((file) => file.id !== newFileItem.id));
          toast.error(`Failed to upload ${newFile.name}`);
        }
      }

      // Update form value with all paths if this is a specific field upload
      if (fieldName && uploadedPaths.length > 0) {
        const currentValues =
          (form.getValues(`supportingDocument.${fieldName}`) as string[]) || [];
        form.setValue(`supportingDocument.${fieldName}` as const, [
          ...currentValues,
          ...uploadedPaths,
        ]);

        setUploads((prev: any) => ({
          ...prev,
          [fieldName]: {
            files: [...prev[fieldName]?.files, ...newFiles],
            previews: [
              ...prev[fieldName].previews,
              ...uploadedPaths.map(
                (p) => `${process.env.NEXT_PUBLIC_API_URL}${p}`
              ),
            ],
          },
        }));
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, fieldName?: keyof UploadState) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.files = e.dataTransfer.files;
      const event = new Event("change", { bubbles: true });
      Object.defineProperty(event, "target", { value: fileInput });
      handleFileChange(
        event as unknown as React.ChangeEvent<HTMLInputElement>,
        fieldName
      );
    }
  };

  const removeFile = (id: string) => {
    const fileToRemove = files.find((file) => file.id === id);
    if (fileToRemove?.fieldName) {
      const currentValues =
        (form.getValues(
          `supportingDocument.${fileToRemove.fieldName}`
        ) as string[]) || [];
      const updatedValues = currentValues.filter(
        (path: string) => path !== fileToRemove.path
      );

      form.setValue(
        `supportingDocument.${fileToRemove.fieldName}` as const,
        updatedValues
      );

      setUploads((prev: any) => {
        const index = prev[fileToRemove.fieldName!].previews.findIndex(
          (p: any) =>
            p === `${process.env.NEXT_PUBLIC_API_URL}${fileToRemove.path}`
        );

        if (index === -1) return prev;

        const newFiles = [...prev[fileToRemove.fieldName!].files];
        const newPreviews = [...prev[fileToRemove.fieldName!].previews];
        newFiles.splice(index, 1);
        newPreviews.splice(index, 1);

        return {
          ...prev,
          [fileToRemove.fieldName!]: {
            files: newFiles,
            previews: newPreviews,
          },
        };
      });
    }
    setFiles(files.filter((file) => file.id !== id));
  };

  const replaceFile = async (id: string) => {
    const fileToReplace = files.find((file) => file.id === id);
    if (!fileToReplace?.fieldName) return;

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".pdf,.jpg,.jpeg,.png";

    fileInput.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const newFile = target.files[0];
        const fileSize = (newFile.size / (1024 * 1024)).toFixed(1);
        const fileType = getFileType(newFile.name);
        const now = Date.now();

        // Update file with uploading state
        setFiles((prev) =>
          prev.map((file) =>
            file.id === id
              ? {
                  ...file,
                  name: newFile.name,
                  size: `${fileSize}MB`,
                  progress: 0,
                  status: "uploading",
                  timeLeft: "calculating...",
                  type: fileType,
                  path: undefined,
                  uploadStartTime: now,
                  lastProgressTime: now,
                }
              : file
          )
        );

        try {
          // Upload new file to server
          const path = await uploadFileToServer(
            newFile,
            files.find((f) => f.id === id)!
          );

          // Update file when upload completes
          setFiles((prev) =>
            prev.map((file) =>
              file.id === id
                ? {
                    ...file,
                    progress: 100,
                    status: "complete",
                    timeLeft: undefined,
                    path: path,
                  }
                : file
            )
          );

          // Update form value
          if (fileToReplace.fieldName) {
            const currentValues =
              (form.getValues(
                `supportingDocument.${fileToReplace.fieldName}`
              ) as string[]) || [];
            const updatedValues = currentValues.map((val: string) =>
              val === fileToReplace.path ? path : val
            );
            form.setValue(
              `supportingDocument.${fileToReplace.fieldName}` as const,
              updatedValues
            );
          }

          // Update uploads state
          setUploads((prev: any) => {
            const index = prev[fileToReplace.fieldName!].previews.findIndex(
              (p: any) =>
                p === `${process.env.NEXT_PUBLIC_API_URL}${fileToReplace.path}`
            );

            if (index === -1) return prev;

            const newFiles = [...prev[fileToReplace.fieldName!].files];
            const newPreviews = [...prev[fileToReplace.fieldName!].previews];
            newFiles[index] = newFile;
            newPreviews[index] = `${process.env.NEXT_PUBLIC_API_URL}${path}`;

            return {
              ...prev,
              [fileToReplace.fieldName!]: {
                files: newFiles,
                previews: newPreviews,
              },
            };
          });
        } catch (error) {
          toast.error(`Failed to replace file`);
        }
      }
    };

    fileInput.click();
  };

  const triggerFileInput = (fieldName?: keyof UploadState) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.jpg,.jpeg,.png";
    input.multiple = true;

    input.onchange = (e) => {
      handleFileChange(
        e as unknown as React.ChangeEvent<HTMLInputElement>,
        fieldName
      );
    };

    input.click();
  };

  // File icon component
  const FileIcon = ({ type }: { type: "pdf" | "image" | "other" }) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />;
      case "image":
        return <Image className="h-5 w-5 text-blue-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  // View file handler
  const viewFile = (path: string) => {
    if (!path) return;
    const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}${path}`;
    window.open(fullUrl, "_blank");
  };

  // Download file handler
  const downloadFile = (path: string, name: string) => {
    if (!path) return;
    const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}${path}`;

    const a = document.createElement("a");
    a.href = fullUrl;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div>
      <div className="p-4">
        <h1 className="text-xl font-semibold text-black">
          Supporting Documents
        </h1>
      </div>
      <hr />
      <div>
        {/* Specific Document Fields */}
        <div className="flex flex-col gap-2">
          {[
            { id: "cv", label: "Cv" },
            { id: "englishCertificates", label: "English Certificates" },
            { id: "essay", label: "Essay" },
            { id: "passportId", label: "Passport/ID" },
            { id: "proofOfNameChange", label: "Proof of name change" },
            { id: "qualification", label: "Qualification" },
            {
              id: "nationalIdentification",
              label: "National Identification",
            },
            { id: "policeClearance", label: "Police Clearance" },
            { id: "transcripts", label: "Transcripts" },
            { id: "references", label: "References" },
            {
              id: "otherDocument",
              label: "Others Supporting Documentation",
            },
          ].map(({ id, label }) => {
            const fieldName = id as keyof UploadState;
            const fieldFiles = files.filter((f) => f.fieldName === fieldName);
            const upload = uploads[fieldName];

            return (
              <div
                key={id}
                className="my-6 space-y-2 w-full mx-auto p-6 bg-white rounded-lg shadow-sm border"
              >
                <label className="block text-sm font-medium text-gray-700">
                  {label}
                </label>

                <div
                  className={`border-2 border-dashed rounded-lg px-6 py-3 ${
                    upload?.files?.length > 0
                      ? "border-green-500"
                      : "border-gray-200"
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, fieldName)}
                >
                  <div className="flex  gap-2 items-center">
                    <Upload className="w-5 h-5 text-gray-400" />
                    <div className="text-sm text-center">
                      <p>
                        Drag & Drop or{" "}
                        <button
                          type="button"
                          onClick={() => triggerFileInput(fieldName)}
                          className="text-blue-500 hover:text-blue-700 font-medium"
                        >
                          Choose files
                        </button>{" "}
                        to upload
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="mt-1 text-xs text-gray-500">
                    Files Supported: PDF, Image, Scan
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Maximum size: 5MB
                  </p>
                </div>

                <div className="space-y-2">
                  {fieldFiles.map((file) => (
                    <FileUploadItem
                      key={file.id}
                      file={file}
                      removeFile={removeFile}
                      replaceFile={replaceFile}
                      viewFile={viewFile}
                      downloadFile={downloadFile}
                      FileIcon={FileIcon}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {/* 
        <div className="flex justify-end items-end flex-col pr-5 pb-2 mt-8">
          <Button
            variant="primary"
            className="py-2 mt-3 w-[120px]"
            type="submit"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            Save
          </Button>
        </div> */}
      </div>
    </div>
  );
};

interface FileUploadItemProps {
  file: FileItem;
  removeFile: (id: string) => void;
  replaceFile: (id: string) => void;
  viewFile: (path: string) => void;
  downloadFile: (path: string, name: string) => void;
  FileIcon: ({ type }: { type: "pdf" | "image" | "other" }) => JSX.Element;
}

const FileUploadItem: React.FC<FileUploadItemProps> = ({
  file,
  removeFile,
  replaceFile,
  viewFile,
  downloadFile,
  FileIcon,
}) => (
  <div className="bg-gray-50 rounded-lg p-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div
          className={`h-10 w-10 flex items-center justify-center rounded-md border ${
            file.type === "pdf"
              ? "bg-red-50 border-red-100"
              : file.type === "image"
              ? "bg-blue-50 border-blue-100"
              : "bg-gray-50 border-gray-100"
          }`}
        >
          <FileIcon type={file.type} />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">{file.name}</p>
          <p className="text-xs text-gray-500">{file.size}</p>
        </div>
      </div>

      <button
        onClick={() => removeFile(file.id)}
        className="text-gray-400 hover:text-gray-600"
      >
        <X className="h-5 w-5" />
      </button>
    </div>

    {file.status === "uploading" && (
      <div className="mt-2">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{file.timeLeft}</span>
          <span>{file.progress}%</span>
        </div>
        <div className="relative h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${file.progress}%` }}
          />
        </div>
      </div>
    )}

    {file.status === "complete" && (
      <div className="mt-2 flex justify-between items-center">
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
            onClick={() => file.path && downloadFile(file.path, file.name)}
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
            onClick={() => file.path && viewFile(file.path)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
          onClick={() => replaceFile(file.id)}
        >
          Replace
        </Button>
      </div>
    )}
  </div>
);

export default Supporting_background_step_10;
