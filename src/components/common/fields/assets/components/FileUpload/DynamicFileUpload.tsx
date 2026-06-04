/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/custom_ui/form";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useAuths } from "@/hooks/userContext";
import FormatFileSize from "@/utils/formateFileSize";
import axios from "axios";
import {
  Eye,
  Upload,
  X,
  FileImage,
  FileText,
  FileVideo,
  AlertCircle,
  Sheet,
  Lock,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { getIconByType } from "@/utils/getIconByType";

interface FileItem {
  id: string;
  name: string;
  size: number;
  path?: string;
  localUrl?: string;
  progress: number;
  status: "uploading" | "complete" | "error";
  timeLeft?: string;
  uploadStartTime?: number;
  fileType?: string;
}

interface FormDependency {
  fieldName: string;
  expectedValue?: any;
  condition?:
    | "equals"
    | "notEquals"
    | "exists"
    | "notExists"
    | "contains"
    | "greaterThan"
    | "lessThan";
}

interface DynamicFileUploadFieldProps {
  form?: any;
  name: string;
  labelName?: string;
  optional?: boolean;
  viewOnly?: boolean;
  multiple?: boolean;
  maxSizeMB?: number;
  acceptedTypes?:
    | "image"
    | "video"
    | "pdf"
    | "image-pdf"
    | "image-video-pdf"
    | "doc-excel"
    | "word"
    | "excel"
    | "csv"
    | "all";
  onValueChange?: (value: FileItem[]) => void;
  // New props for form dependencies and disabled state
  dependencies?: FormDependency[];
  disabled?: boolean;
  disabledMessage?: string;
  onUploadStart?: () => void;
  onUploadComplete?: () => void;
}

interface ViewPathResult {
  url: string;
  contentType: string;
}

export const DynamicFileUploadField = ({
  form,
  name,
  labelName,
  optional = false,
  viewOnly = false,
  multiple = false,
  maxSizeMB,
  acceptedTypes = "all",
  onValueChange,
  dependencies = [],
  disabled = false,
  disabledMessage = "Access Denied",
  onUploadStart,
  onUploadComplete
}: DynamicFileUploadFieldProps) => {
  const user = useAuths();
  const token = user?.user?.token;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const abortControllers = useRef<Map<string, AbortController>>(new Map());

  // Local state to track upload progress for newly uploaded files
  const [uploadingFiles, setUploadingFiles] = useState<FileItem[]>([]);
  const [deletedFiles, setDeletedFiles] = useState<FileItem[]>([]);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState<string | null>(null);

  // Add previewType state to differentiate PDF/image preview
  const [previewType, setPreviewType] = useState<"pdf" | "image" | "video">(
    "image"
  );
  const [showPreview, setShowPreview] = useState(false);

  // Check form dependencies
  const checkDependencies = useCallback((): boolean => {
    if (!form || dependencies.length === 0) return true;

    try {
      return dependencies.every((dep) => {
        const fieldValue = form.watch(dep.fieldName);
        const condition = dep.condition || "equals";

        switch (condition) {
          case "equals":
            return fieldValue === dep.expectedValue;
          case "notEquals":
            return fieldValue !== dep.expectedValue;
          case "exists":
            return (
              fieldValue !== undefined &&
              fieldValue !== null &&
              fieldValue !== ""
            );
          case "notExists":
            return (
              fieldValue === undefined ||
              fieldValue === null ||
              fieldValue === ""
            );
          case "contains":
            return Array.isArray(fieldValue)
              ? fieldValue.includes(dep.expectedValue)
              : String(fieldValue || "").includes(
                  String(dep.expectedValue || "")
                );
          case "greaterThan":
            return Number(fieldValue) > Number(dep.expectedValue);
          case "lessThan":
            return Number(fieldValue) < Number(dep.expectedValue);
          default:
            return true;
        }
      });
    } catch (error) {
      console.warn("Error checking form dependencies:", error);
      return true;
    }
  }, [form, dependencies]);

  // Determine if component should be disabled
  const isDisabled = disabled || !checkDependencies();

  const getAcceptString = useCallback(() => {
    switch (acceptedTypes) {
      case "image":
        return ".jpg,.jpeg,.png";
      case "video":
        return ".mp4,.mov,.avi";
      case "pdf":
        return ".pdf";
      case "image-pdf":
        return ".jpg,.jpeg,.png,.pdf";
      case "image-video-pdf":
        return ".jpg,.jpeg,.png,.pdf,.mp4,.mov,.avi";
      case "word": 
        return ".doc,.docx";
      case "excel": 
        return ".xls,.xlsx,.sheet";
      case "csv": 
        return ".csv";  
      case "doc-excel":
        return ".doc,.docx,.xls,.xlsx,.csv";
      case "all":
        return ".jpg,.jpeg,.png,.pdf,.mp4,.mov,.avi,.doc,.docx,.xls,.xlsx,.csv";
      default:
        return ".jpg,.jpeg,.png,.pdf,.mp4,.mov,.avi,.doc,.docx,.xls,.xlsx,.csv";
    }
  }, [acceptedTypes]);

  const getIconForFileType = useCallback((filename: string) => {
    const ext = filename?.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "bmp"].includes(ext || "")) {
      return getIconByType("image");
    } else if (["mp4", "avi", "mov", "mkv"].includes(ext || "")) {
      return getIconByType("video");
    } else if (ext === "pdf") {
      return getIconByType("pdf");
    }else if (["doc", "docx"].includes(ext || "")) {
      return getIconByType("doc"); 
    } 
    else if (["xls", "xlsx", "csv"].includes(ext || "")) {
      return getIconByType("excel"); 
    }
    return getIconByType("file");
  }, []);

  const AcceptIcon =
    {
      image: FileImage,
      video: FileVideo,
      pdf: FileText,
      word: FileText,
      excel: Sheet,
      csv: Sheet,
      "image-pdf": FileImage,
      "image-video-pdf": FileVideo,
      "doc-excel": FileText,
      all: FileText,
    }[acceptedTypes] ?? AlertCircle;

  // Changed to return object with url and contentType
  const ImageOrFileGetViewPath = async (
    path: string
  ): Promise<ViewPathResult> => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}${path}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "arraybuffer",
      }
    );

    const contentType = response.headers["content-type"] || "";

    const blob = new Blob([response.data], {
      type: contentType,
    });
    return { url: URL.createObjectURL(blob), contentType };
  };

  const calculateTimeLeft = (
    file: FileItem,
    currentProgress: number
  ): string => {
    if (!file.uploadStartTime) return "Starting...";
    const timeElapsed = (Date.now() - file.uploadStartTime) / 1000;
    if (timeElapsed < 1) return "Initializing...";
    const uploadSpeed = currentProgress / timeElapsed;
    if (uploadSpeed < 0.01) return "Starting...";
    const remainingProgress = 100 - currentProgress;
    const secondsLeft = Math.ceil(remainingProgress / uploadSpeed);
    if (secondsLeft < 60) return `${secondsLeft} seconds left`;
    if (secondsLeft < 3600)
      return `${Math.ceil(secondsLeft / 60)} minutes left`;
    return `${Math.ceil(secondsLeft / 3600)} hours left`;
  };

  const uploadFileToServer = async (file: File, fileItem: FileItem) => {
    const controller = new AbortController();
    abortControllers.current.set(fileItem.id, controller);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/uploads`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          signal: controller.signal,
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadingFiles((prev) =>
                prev.map((f) =>
                  f.id === fileItem.id
                    ? {
                        ...f,
                        progress,
                        timeLeft: calculateTimeLeft(f, progress),
                      }
                    : f
                )
              );
            }
          },
        }
      );
      return response.data?.data?.path;
    } finally {
      abortControllers.current.delete(fileItem.id);
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (isDisabled) return;

    const filesList = event.target.files;
    if (!filesList || filesList.length === 0) return;

    const allowedExtensions = getAcceptString()
      .split(",")
      .map((ext) => ext.trim().replace(".", ""));

      // Call onUploadStart when starting to process files
    if (filesList.length > 0 && onUploadStart) {
      onUploadStart();
    }

    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      const ext = file.name.split(".").pop()?.toLowerCase();

      if (!allowedExtensions.includes(ext || "")) {
        toast.error(`File type .${ext} is not allowed.`);
        continue;
      }

      if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`${file.name} exceeds ${maxSizeMB}MB limit.`);
        continue;
      }

      const now = Date.now();
      const newFileItem: FileItem = {
        id: `file-${now}-${i}`,
        name: file.name,
        size: file.size,
        progress: 0,
        status: "uploading",
        timeLeft: "Starting...",
        uploadStartTime: now,
        localUrl: URL.createObjectURL(file),
      };

      if (!multiple) setUploadingFiles([]);

      // Add to uploading files state
      setUploadingFiles((prev) => [...prev, newFileItem]);

      try {
        const path = await uploadFileToServer(file, newFileItem);
        const pathObj = typeof path === "string" ? JSON.parse(path) : path;

        // Mark upload complete in uploading files state
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.id === newFileItem.id
              ? {
                  ...f,
                  progress: 100,
                  status: "complete",
                  timeLeft: undefined,
                  path: pathObj?.path,
                }
              : f
          )
        );

        // Update form value with completed file
        const currentValue: FileItem[] = form?.watch?.(name) || [];
        const completedFile: FileItem = {
          id: newFileItem.id,
          name: pathObj?.originalname || file.name,
          size: file.size,
          path: JSON.stringify({
            path: pathObj?.path,
            originalname: pathObj?.originalname,
            size: file.size,
            mimetype: file.type,
          }),
          progress: 100,
          status: "complete",
          timeLeft: undefined,
          uploadStartTime: newFileItem.uploadStartTime,
          fileType: file.type,
        };

        const newValue = multiple
          ? [...currentValue, completedFile]
          : [completedFile];

        form?.setValue?.(name, newValue);
        onValueChange?.(newValue);
        // Check if all uploads are complete and call onUploadComplete
      if (newValue?.length && onUploadComplete) {
        onUploadComplete();
      }
        toast.success(`${file.name} uploaded successfully`);
      } catch (error: any) {
        if (error.name !== "CanceledError") {
          toast.error(
            error?.response?.data?.message || `Failed to upload ${file.name}`
          );
          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.id === newFileItem.id
                ? { ...f, status: "error", timeLeft: "Failed" }
                : f
            )
          );
        }
      }
    }
    

    event.target.value = ""; // Reset input so user can select same file again
  };

  // Updated handlePreview to set previewType based on content-type
  const handlePreview = async (file: FileItem) => {
    if (!file.path || isDisabled) return;

    if (
      ["doc", "docx", "xls", "xlsx", "csv"].some((ext) =>
        file.name.toLowerCase().endsWith(ext)
      )
    ) {
      return;
    }

    try {
      setLoadingPreview(true);
      const pathObj =
        typeof file.path === "string" && file.path.startsWith("{")
          ? JSON.parse(file.path)
          : { path: file.path };

      const fileUrl = pathObj.path;
      const { url, contentType } = await ImageOrFileGetViewPath(fileUrl);
      if (contentType.includes("pdf")) {
        setPreviewType("pdf");
      } else if (contentType.startsWith("video/")) {
        setPreviewType("video");
      } else {
        setPreviewType("image");
      }

      setPreviewUrl(url);
      setShowPreview(true);
    } catch (error) {
      toast.error("Failed to load preview");
    }
  };

  const handleRemove = (id: string) => {
    if (isDisabled) return;
  
    // Cancel upload if in progress
    const controller = abortControllers.current.get(id);
    if (controller) {
      controller.abort();
      abortControllers.current.delete(id);
    }
  
    // Normalize form value to FileItem[]
    const currentRaw = form?.watch?.(name) || [];
    const current: FileItem[] = normalizeFormFiles(currentRaw);
  
    // Find the file to remove
    const removedFile = current.find((file) => file.id === id);
  
    // Remove from uploading files state
    setUploadingFiles((prev) => prev.filter((file) => file.id !== id));
  
    // Remove from form state
    const updated = current.filter((file) => file.id !== id);
  
    // Save back as strings if your form expects strings
    const updatedForForm = updated.map((f) =>
      f.path && typeof f.path === "string" ? JSON.stringify({ path: f.path, originalname: f.name, size: f.size }) : f
    );
  
    form?.setValue?.(name, updatedForForm, { shouldValidate: true, shouldDirty: true });
    onValueChange?.(updated);
  
    if (removedFile) {
      setDeletedFiles((prev) => [...prev, removedFile]);
    }
  };

  const handleDownload = async (file: FileItem) => {
    if (!file.path || isDisabled) return;

    try {
      setLoadingDownload(file.id);
      const pathObj =
        typeof file.path === "string" && file.path.startsWith("{")
          ? JSON.parse(file.path)
          : { path: file.path };

      const fileUrl = pathObj.path;
      const { url } = await ImageOrFileGetViewPath(fileUrl);

      // Create the download link
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;

      // Append to DOM
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to download file");
    } finally {
      setLoadingDownload(null);
    }
  };

  // Cleanup abort controllers on unmount
  useEffect(() => {
    return () => {
      abortControllers.current.forEach((controller) => controller.abort());
    };
  }, []);

  // Normalize form files helper: convert array of strings to FileItem[]
  const normalizeFormFiles = (filesFromFormRaw: any[]): FileItem[] => {
    if (!filesFromFormRaw || filesFromFormRaw.length === 0) return [];

    // Already objects with 'id' field? Return as is
    if (typeof filesFromFormRaw[0] === "object" && filesFromFormRaw[0].id) {
      return filesFromFormRaw as FileItem[];
    }

    // Else assume array of strings (paths), convert to FileItem
    return filesFromFormRaw.map((fileStr, i) => {
      let parsed;
      try {
        parsed = JSON.parse(fileStr);
      } catch {
        parsed = { path: fileStr, originalname: fileStr };
      }
      return {
        id: `existing-${i}`,
        name: parsed.originalname || "unknown",
        size: parsed.size || 0,
        path: parsed.path,
        progress: 100,
        status: "complete" as const,
        fileType: parsed.mimetype || "",
      };
    })
  };

  const filesFromFormRaw = form?.watch?.(name) || [];
  const filesFromForm = normalizeFormFiles(filesFromFormRaw);

  // Combine files from form (already uploaded) + currently uploading files (to show progress)
  const combinedFiles: FileItem[] = [
    ...filesFromForm,
    ...uploadingFiles.filter(
      (uploadFile) => !filesFromForm.some((f) => f.id === uploadFile.id)
    ),
  ];

  return (
    <>
      {form?.control ? (
        <FormField
          control={form.control}
          name={name}
          render={() => (
            <FormItem className={`w-full ${isDisabled ? "opacity-50" : ""}`}>
              {labelName && (
                <label className="font-semibold text-[14px]">
                  {labelName}{" "}
                  {!optional && <span className="text-red-500">*</span>}
                </label>
              )}

              {/* Disabled state overlay */}
              {isDisabled && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gray-200/80 backdrop-blur-[1px] z-10 rounded-md flex items-center justify-center">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/90 rounded-md shadow-md border">
                      <Lock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600 font-medium">
                        {disabledMessage}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload area only visible in edit mode */}
              {!viewOnly && (
                <FormControl>
                  <div
                    className={`p-4 text-center rounded-md border-2 border-dashed ${
                      isDisabled
                        ? "border-gray-300 cursor-not-allowed"
                        : "border-green-400 cursor-pointer"
                    }`}
                    onClick={() => !isDisabled && fileInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center text-muted-foreground">
                      <AcceptIcon className="mb-2 w-8 h-8" />
                    </div>
                    Drag & Drop or{" "}
                    <span
                      className={`underline ${
                        isDisabled ? "text-gray-400" : "text-blue-600"
                      }`}
                    >
                      Choose files
                    </span>{" "}
                    to upload
                    <div className="text-sm text-gray-500">
                      Files Supported: {getAcceptString().replaceAll(",", ", ")}
                      {maxSizeMB && `| Max: ${FormatFileSize(maxSizeMB)}`}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      multiple={multiple}
                      onChange={handleFileChange}
                      accept={getAcceptString()}
                      disabled={isDisabled}
                    />
                  </div>
                </FormControl>
              )}

              {/* Files list */}
              <div className="mt-4 space-y-2">
                {combinedFiles.map((file) => (
                  <div
                    key={file.id}
                    className={`flex flex-col p-2 bg-blue-50 rounded-md ${
                      isDisabled ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2 items-center truncate">
                        {getIconForFileType(file.name)}
                        <div className="truncate max-w-[180px]">
                          <div className="text-sm font-medium truncate">
                            {file.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(1)}MB
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 items-center">
                        {/* Show download & preview buttons for completed files */}
                        {file.status === "complete" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              onClick={() => handleDownload(file)}
                              disabled={isDisabled}
                            >
                              {loadingDownload === file.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Upload className="w-4 h-4" />
                              )}
                            </Button>
                            {!(
                              file.name.endsWith(".doc") ||
                              file.name.endsWith(".docx") ||
                              file.name.endsWith(".xls") ||
                              file.name.endsWith(".xlsx") ||
                              file.name.endsWith(".csv")
                            ) && (
                              <Button
                                variant="ghost"
                                size="icon"
                                type="button"
                                onClick={() => handlePreview(file)}
                                disabled={isDisabled}
                              >
                                {loadingPreview ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </Button>
                            )}
                          </>
                        )}

                        {/* Show remove button only in edit mode */}
                        {!viewOnly && (
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleRemove(file.id)}
                            disabled={isDisabled}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Upload progress bar & info */}
                    {file.status === "uploading" && (
                      <div className="mt-2">
                        <div className="flex justify-between mb-1 text-xs text-gray-500">
                          <span>{file.progress}%</span>
                          <span>{file.timeLeft}</span>
                        </div>
                        <Progress value={file.progress} className="h-2" />
                      </div>
                    )}

                    {/* Error message */}
                    {file.status === "error" && (
                      <div className="mt-1 text-xs text-red-500">
                        Upload failed - click X to remove
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <FormMessage />

              {/* Preview dialog */}
              <Dialog
                open={showPreview}
                onOpenChange={(open) => {
                  setShowPreview(open);
                  if (!open) {
                    setLoadingPreview(false);
                    setPreviewUrl(null);
                  }
                }}
              >
                <DialogContent className="p-4 max-w-3xl">
                  {previewUrl && (
                    <>
                      {previewType === "pdf" ? (
                        <iframe
                          src={previewUrl}
                          className="w-full h-[600px]"
                          title="PDF Preview"
                        />
                      ) : previewType === "video" ? (
                        <video
                          src={previewUrl}
                          controls
                          className="w-full rounded-md max-h-[600px]"
                        />
                      ) : (
                        <Image
                          src={previewUrl}
                          alt="Preview"
                          width={1000}
                          height={600}
                          className="w-full h-auto rounded-md"
                        />
                      )}
                    </>
                  )}
                </DialogContent>
              </Dialog>
            </FormItem>
          )}
        />
      ) : (
        // Standalone version when no form is provided
        <div className={`w-full ${isDisabled ? "opacity-50" : ""}`}>
          {labelName && (
            <label className="font-semibold text-[14px]">
              {labelName} {!optional && <span className="text-red-500">*</span>}
            </label>
          )}

          {/* Disabled state overlay */}
          {isDisabled && (
            <div className="relative">
              <div className="absolute inset-0 bg-gray-200/80 backdrop-blur-[1px] z-10 rounded-md flex items-center justify-center">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/90 rounded-md shadow-md border">
                  <Lock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 font-medium">
                    {disabledMessage}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Upload area only visible in edit mode */}
          {!viewOnly && (
            <div
              className={`p-4 text-center rounded-md border-2 border-dashed ${
                isDisabled
                  ? "border-gray-300 cursor-not-allowed"
                  : "border-green-400 cursor-pointer"
              }`}
              onClick={() => !isDisabled && fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center text-muted-foreground">
                <AcceptIcon className="mb-2 w-8 h-8" />
              </div>
              Drag & Drop or{" "}
              <span
                className={`underline ${
                  isDisabled ? "text-gray-400" : "text-blue-600"
                }`}
              >
                Choose files
              </span>{" "}
              to upload
              <div className="text-sm text-gray-500">
                Files Supported: {getAcceptString().replaceAll(",", ", ")}
                {maxSizeMB && `| Max: ${FormatFileSize(maxSizeMB)}`}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple={multiple}
                onChange={handleFileChange}
                accept={getAcceptString()}
                disabled={isDisabled}
              />
            </div>
          )}

          {/* Files list */}
          <div className="mt-4 space-y-2">
            {combinedFiles.map((file) => (
              <div
                key={file.id}
                className={`flex flex-col p-2 bg-blue-50 rounded-md ${
                  isDisabled ? "opacity-60" : ""
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex gap-2 items-center truncate">
                    {getIconForFileType(file.name)}
                    <div className="truncate max-w-[180px]">
                      <div className="text-sm font-medium truncate">
                        {file.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(1)}MB
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 items-center">
                    {/* Show download & preview buttons for completed files */}
                    {file.status === "complete" && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          onClick={() => handleDownload(file)}
                          disabled={isDisabled}
                        >
                          {loadingDownload === file.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          onClick={() => handlePreview(file)}
                          disabled={isDisabled}
                        >
                          {loadingPreview ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </>
                    )}

                    {/* Show remove button only in edit mode */}
                    {!viewOnly && (
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleRemove(file.id)}
                        disabled={isDisabled}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Upload progress bar & info */}
                {file.status === "uploading" && (
                  <div className="mt-2">
                    <div className="flex justify-between mb-1 text-xs text-gray-500">
                      <span>{file.progress}%</span>
                      <span>{file.timeLeft}</span>
                    </div>
                    <Progress value={file.progress} className="h-2" />
                  </div>
                )}

                {/* Error message */}
                {file.status === "error" && (
                  <div className="mt-1 text-xs text-red-500">
                    Upload failed - click X to remove
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Preview dialog */}
          <Dialog
            open={showPreview}
            onOpenChange={(open) => {
              setShowPreview(open);
              if (!open) {
                setLoadingPreview(false);
                setPreviewUrl(null);
              }
            }}
          >
            <DialogContent className="p-4 max-w-3xl">
              {previewUrl && (
                <>
                  {previewType === "pdf" ? (
                    <iframe
                      src={previewUrl}
                      className="w-full h-[600px]"
                      title="PDF Preview"
                    />
                  ) : previewType === "video" ? (
                    <video
                      src={previewUrl}
                      controls
                      className="w-full rounded-md max-h-[600px]"
                    />
                  ) : (
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      width={1000}
                      height={600}
                      className="w-full h-auto rounded-md"
                    />
                  )}
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}
    </>
  );
};
