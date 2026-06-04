/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useAuths } from "@/hooks/userContext";
import axios from "axios";
import { FileText, Image as ImageIcon, Upload } from "lucide-react";
import { z } from "zod";

import NextImage from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { UploadState } from "../../../../[id]/_assets/interface/application/fileUploadState";
import FileUploadItem from "../../../../[id]/document/_assets/components/FileUploadItem";
import FileViewModal from "../../../../[id]/document/_assets/components/FileViewModal";
import { FileItem } from "../../../../[id]/document/_assets/type/interface";
import pdfIcon from "/public//assets/logo/profile/Icon.svg";
import { capitalizeName } from "@/utils/capitalizeName/capitalizeName";

// Zod validation schema
const createSupportingDocumentSchema = (requiredDocs: string[] = []) => {
  const schemaFields: Record<string, any> = {};
  
  const allDocumentFields = [
    "qualification",
    "nationalIdentification", 
    "personalStatement",
    "consentForm",
    "policeClearance",
    "references",
    "englishCertificates",
    "essay",
    "cv",
    "passportId",
    "proofOfNameChange",
    "transcripts",
    "otherDocument"
  ];

  allDocumentFields.forEach(field => {
    const kebabCaseField = field.replace(/([A-Z])/g, "-$1").toLowerCase();
    const isRequired = requiredDocs.length === 0 || 
                      requiredDocs.includes(kebabCaseField) || 
                      requiredDocs.includes(field) ||
                      field === "otherDocument";

    if (field === "otherDocument" || !isRequired) {
      schemaFields[field] = z.array(z.string()).optional().default([]);
    } else {
      schemaFields[field] = z.array(z.string())
        .min(1, `${capitalizeName(field.replace(/([A-Z])/g, " $1").toLowerCase())} is required`);
    }
  });

  return z.object({
    supportingDocument: z.object(schemaFields)
  });
};

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
  data,
  files,
  setFiles,
  requiredDocs = [],
}: any) => {
  const user = useAuths();
  const token = user?.user?.token;
  
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const validationSchema = createSupportingDocumentSchema(requiredDocs);
  
  const generateFileId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // FIX 1: Properly initialize form values with arrays
  useEffect(() => {
    const allFields = [
      "qualification",
      "nationalIdentification", 
      "personalStatement",
      "consentForm",
      "policeClearance",
      "references",
      "englishCertificates",
      "essay",
      "cv",
      "passportId",
      "proofOfNameChange",
      "transcripts",
      "otherDocument"
    ];

    // Initialize all fields as empty arrays
    const initialFormValues: any = {};
    allFields.forEach(field => {
      initialFormValues[field] = [];
    });

    if (
      data?.data?.application?.supportingDocument?.supportingDocumentAttachments
    ) {
      const initialFileData: FileItem[] = [];

      data?.data?.application?.supportingDocument?.supportingDocumentAttachments?.forEach(
        (attachment: any) => {
          const fieldName = attachment.name;
          
          // Ensure field exists and is an array
          if (!initialFormValues[fieldName]) {
            initialFormValues[fieldName] = [];
          }

          attachment.attachment.paths.forEach((rawPathStr: string) => {
            try {
              const pathObj =
                typeof rawPathStr === "string"
                  ? JSON.parse(rawPathStr)
                  : rawPathStr;

              const fileType = pathObj.mimetype.includes("pdf")
                ? "pdf"
                : "image";

              const fileItem: FileItem = {
                id: `${attachment.id}-${generateFileId()}`,
                name: pathObj.originalname,
                size: `${(pathObj.size / (1024 * 1024)).toFixed(1)}MB`,
                type: fileType,
                status: "complete",
                fieldName,
                path: rawPathStr,
              };

              initialFileData.push(fileItem);
              
              // FIX 2: Always push to array, never replace
              if (Array.isArray(initialFormValues[fieldName])) {
                initialFormValues[fieldName].push(rawPathStr);
              } else {
                initialFormValues[fieldName] = [rawPathStr];
              }
            } catch (error) {
              console.error("Error parsing file path:", error);
              // Ensure we still add as array
              if (Array.isArray(initialFormValues[fieldName])) {
                initialFormValues[fieldName].push(rawPathStr);
              } else {
                initialFormValues[fieldName] = [rawPathStr];
              }
            }
          });
        }
      );

      // FIX 3: Clear unsaved files and set only saved files
      setFiles(initialFileData);
      
      // Reset form with properly formatted data
      form.reset({
        supportingDocument: initialFormValues,
      });
    } else {
      // No saved data - clear everything
      setFiles([]);
      form.reset({
        supportingDocument: initialFormValues,
      });
    }
  }, [data, form, setFiles]);

  // Validate supporting documents
  const validateSupportingDocuments = (showAllErrors = false) => {
    try {
      const formData = form.getValues();
      
      // FIX 4: Ensure all values are arrays before validation
      const sanitizedData = {
        supportingDocument: {} as Record<string, string[]>
      };
      
      Object.keys(formData.supportingDocument || {}).forEach(key => {
        const value = formData.supportingDocument[key];
        // Convert any non-array values to arrays
        sanitizedData.supportingDocument[key] = Array.isArray(value) 
          ? value 
          : value ? [value] : [];
      });
      
      validationSchema.parse(sanitizedData);
      setValidationErrors({});
      return { success: true, errors: null };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length >= 2) {
            const fieldName = err.path[1] as string;
            if (showAllErrors || touchedFields.has(fieldName)) {
              fieldErrors[fieldName] = err.message;
            }
          }
        });
        setValidationErrors(fieldErrors);
        return { success: false, errors: fieldErrors };
      }
      return { success: false, errors: { general: "Validation failed" } };
    }
  };

  const markFieldAsTouched = (fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
    setTimeout(() => validateSupportingDocuments(), 0);
  };

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

              setFiles((prev: FileItem[]) =>
                prev?.map((f) =>
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
      if (fieldName) {
        markFieldAsTouched(fieldName);
      }

      const newFiles = Array.from(e.target.files);
      const uploadedPaths: string[] = [];
      const newFileItems: FileItem[] = [];

      for (const newFile of newFiles) {
        const fileSize = (newFile.size / (1024 * 1024)).toFixed(1);
        const fileType = getFileType(newFile.name);
        const now = Date.now();

        const newFileItem: FileItem = {
          id: Date.now().toString() + Math.random(),
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
        setFiles((prev: FileItem[]) => [...prev, newFileItem]);

        try {
          const path = await uploadFileToServer(newFile, newFileItem);
          uploadedPaths.push(path);

          setFiles((prev: FileItem[]) =>
            prev?.map((file) =>
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
          setFiles((prev: FileItem[]) =>
            prev?.filter((file) => file.id !== newFileItem.id)
          );
          toast.error(`Failed to upload ${newFile.name}`);
        }
      }

      if (fieldName && uploadedPaths.length > 0) {
        // FIX 5: Ensure we always work with arrays
        const currentValues = form.getValues(`supportingDocument.${fieldName}`);
        const currentArray = Array.isArray(currentValues) ? currentValues : [];
        
        form.setValue(`supportingDocument.${fieldName}` as const, [
          ...currentArray,
          ...uploadedPaths,
        ]);

        setUploads((prev: any) => ({
          ...prev,
          [fieldName]: {
            files: [...(prev[fieldName]?.files || []), ...newFiles],
            previews: [
              ...(prev[fieldName]?.previews || []),
              ...uploadedPaths.map(
                (p) => `${process.env.NEXT_PUBLIC_API_URL}${p}`
              ),
            ],
          },
        }));

        setTimeout(() => validateSupportingDocuments(), 0);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, fieldName?: keyof UploadState) => {
    e.preventDefault();
    if (fieldName) {
      markFieldAsTouched(fieldName);
    }
    
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
    const fileToRemove = files?.find((file: any) => file.id === id);
    if (fileToRemove?.fieldName) {
      const currentValues = form.getValues(
        `supportingDocument.${fileToRemove.fieldName}`
      );
      const currentArray = Array.isArray(currentValues) ? currentValues : [];
      const updatedValues = currentArray.filter(
        (path: string) => path !== fileToRemove.path
      );

      form.setValue(
        `supportingDocument.${fileToRemove.fieldName}` as const,
        updatedValues
      );

      setUploads((prev: any) => {
        const index = prev[fileToRemove.fieldName!]?.previews?.findIndex(
          (p: any) =>
            p === `${process.env.NEXT_PUBLIC_API_URL}${fileToRemove.path}`
        );

        if (index === -1) return prev;

        const newFiles = [...(prev[fileToRemove.fieldName!]?.files || [])];
        const newPreviews = [...(prev[fileToRemove.fieldName!]?.previews || [])];
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

      setTimeout(() => validateSupportingDocuments(), 0);
    }
    setFiles(files.filter((file: any) => file.id !== id));
  };

  const replaceFile = async (id: string) => {
    const fileToReplace = files?.find((file: any) => file.id === id);
    if (!fileToReplace?.fieldName) return;

    markFieldAsTouched(fileToReplace.fieldName);

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

        const fileIndex = files.findIndex((file: any) => file.id === id);
        const tempId = `temp-${now}`;

        setFiles((prev: any) => {
          const updated = [...prev];
          updated[fileIndex] = {
            id: tempId,
            name: newFile.name,
            size: `${fileSize}MB`,
            progress: 0,
            status: "uploading",
            timeLeft: "calculating...",
            type: fileType,
            uploadStartTime: now,
            lastProgressTime: now,
            fieldName: fileToReplace.fieldName,
          };
          return updated;
        });

        try {
          const path = await uploadFileToServer(newFile, {
            id: tempId,
            name: newFile.name,
            size: `${fileSize}MB`,
            type: fileType,
            fieldName: fileToReplace.fieldName,
            uploadStartTime: now,
            lastProgressTime: now,
          });

          setFiles((prev: any) => {
            const updated = [...prev];
            const index = updated.findIndex((f) => f.id === tempId);
            if (index !== -1) {
              updated[index] = {
                ...updated[index],
                id: Date.now().toString(),
                progress: 100,
                status: "complete",
                timeLeft: undefined,
                path: path,
              };
            }
            return updated;
          });

          if (fileToReplace.fieldName) {
            const currentValues =
              form.getValues(`supportingDocument.${fileToReplace.fieldName}`);
            const currentArray = Array.isArray(currentValues) ? currentValues : [];

            const updatedValues = fileToReplace.path
              ? currentArray
                  .filter((val: string) => val !== fileToReplace.path)
                  .concat(path)
              : [...currentArray, path];

            form.setValue(
              `supportingDocument.${fileToReplace.fieldName}` as const,
              updatedValues
            );
          }

          setUploads((prev: any) => {
            const fieldUploads = prev[fileToReplace.fieldName!] || { files: [], previews: [] };
            const index = fileToReplace.path
              ? fieldUploads.previews.findIndex(
                  (p: any) =>
                    p ===
                    `${process.env.NEXT_PUBLIC_API_URL}${fileToReplace.path}`
                )
              : -1;

            const newFiles = [...fieldUploads.files];
            const newPreviews = [...fieldUploads.previews];

            if (index !== -1) {
              newFiles[index] = newFile;
              newPreviews[index] = `${process.env.NEXT_PUBLIC_API_URL}${path}`;
            } else {
              newFiles.push(newFile);
              newPreviews.push(`${process.env.NEXT_PUBLIC_API_URL}${path}`);
            }

            return {
              ...prev,
              [fileToReplace.fieldName!]: {
                files: newFiles,
                previews: newPreviews,
              },
            };
          });

          setTimeout(() => validateSupportingDocuments(), 0);
        } catch (error) {
          setFiles((prev: FileItem[]) =>
            prev.filter((file) => file.id !== tempId)
          );
          toast.error(`Failed to replace file`);
        }
      }
    };

    fileInput.click();
  };

  const triggerFileInput = (fieldName?: keyof UploadState) => {
    if (fieldName) {
      markFieldAsTouched(fieldName);
    }

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

  const FileIcon = ({ type }: { type: "pdf" | "image" | "other" }) => {
    switch (type) {
      case "pdf":
        return (
          <NextImage
            src={pdfIcon}
            alt="pdf"
            width={25}
            className="w-5 h-5 text-blue-500"
          />
        );
      case "image":
        return <ImageIcon className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-red-500" />;
    }
  };

  const [visible, setVisible] = useState(false);
  const [viwPath, setViewPath] = useState("");
  const [viewType, setViewType] = useState("image");
  const [open, setOpen] = useState(false);

  const viewFile = async (path: string, type: string) => {
    if (!path) return;
    try {
      let parsedPath = path;
      try {
        const pathObj = JSON.parse(path);
        parsedPath = pathObj.path;
      } catch (e) {
        // Not a JSON string, use path as is
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}${parsedPath}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: type === "pdf" ? "arraybuffer" : "blob",
        }
      );

      let url;
      if (type === "pdf") {
        const blob = new Blob([response.data], { type: "application/pdf" });
        url = window.URL.createObjectURL(blob);
        setOpen(true);
      } else {
        const blob = new Blob([response.data]);
        url = window.URL.createObjectURL(blob);
        setVisible(true);
      }

      setViewPath(url);
      setViewType(type);
    } catch (error) {
      console.error("Error viewing file:", error);
      toast.error("Failed to view file");
    }
  };

  const downloadFile = async (path: string, name: string, type: string) => {
    if (!path) return;

    let parsedPath = path;
    try {
      const pathObj = JSON.parse(path);
      parsedPath = pathObj.path;
    } catch (e) {
      // Not a JSON string, use path as is
    }

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}${parsedPath}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      let mimeType = "application/octet-stream";
      if (type === "pdf") {
        mimeType = "application/pdf";
      } else if (type === "image") {
        mimeType = response.headers["content-type"] || "image/jpeg";
      }

      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;

      let filename = name;
      if (!filename.includes(".") && type === "pdf") {
        filename += ".pdf";
      } else if (!filename.includes(".") && type === "image") {
        filename += ".jpg";
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file");
    }
  };

  const isFieldRequired = (fieldId: string): boolean => {
    if (fieldId === "otherDocument") return false;
    if (!requiredDocs || requiredDocs.length === 0) return true;

    const kebabCaseId = fieldId.replace(/([A-Z])/g, "-$1").toLowerCase();
    return requiredDocs?.includes(kebabCaseId) || requiredDocs.includes(fieldId);
  };

  const mainDocumentFields = [
    { id: "qualification", label: "Qualification" },
    { id: "nationalIdentification", label: "National Identification" },
    { id: "personalStatement", label: "Personal Statement" },
    { id: "consentForm", label: "Consent Form" },
    { id: "policeClearance", label: "Police Clearance" },
    { id: "references", label: "References" },
  ];

  const otherDocumentFields = [
    { id: "englishCertificates", label: "English Certificates" },
    { id: "essay", label: "Essay" },
    { id: "cv", label: "CV" },
    { id: "passportId", label: "Passport/ID" },
    { id: "proofOfNameChange", label: "Proof of name change" },
    { id: "transcripts", label: "Transcripts" },
    { id: "otherDocument", label: "Attachment (Attach a file if necessary)" },
  ];

  useEffect(() => {
    (form as any).validateSupportingDocuments = (showAllErrors = false) => {
      return validateSupportingDocuments(showAllErrors);
    };
  }, [form, validationErrors, touchedFields]);

  return (
    <div>
      <div className="px-3 pb-3">
        <FileViewModal
          viewType={viewType}
          viwPath={viwPath}
          open={open}
          setOpen={setOpen}
          visible={visible}
          setVisible={setVisible}
        />
      </div>
      <div>
        <div className="mb-4">
          <h1 className="text-xl font-bold leading-6 text-black">
            Supporting Documents
          </h1>
          <hr className="mb-2" />
          <div className="flex flex-col gap-2">
            {mainDocumentFields.map(({ id, label }) => {
              const fieldName = id as keyof UploadState;
              const fieldFiles = files.filter(
                (f: FileItem) => f.fieldName === fieldName
              );
              const upload = uploads[fieldName];
              const required = isFieldRequired(id);
              const error = validationErrors[id];

              return (
                <div
                  key={id}
                  className="p-6 my-1 mx-auto space-y-2 w-full bg-white rounded-lg border shadow-sm"
                >
                  <label className="block font-extrabold tracking-wide leading-6 text-black capitalize text-[15px]">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                    {!required && (
                      <span className="text-gray-400 ml-1 text-sm font-normal">
                        (Optional)
                      </span>
                    )}
                  </label>

                  <div
                    className={`border-2 border-dashed rounded-lg px-6 py-3 ${
                      error
                        ? "border-red-500"
                        : upload?.files?.length > 0
                        ? "border-green-500"
                        : "border-gray-200"
                    }`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, fieldName)}
                  >
                    <div className="flex gap-2 items-center">
                      <Upload className="w-5 h-5 text-gray-400" />
                      <div className="text-sm text-center">
                        <p>
                          Drag & Drop or{" "}
                          <button
                            type="button"
                            onClick={() => triggerFileInput(fieldName)}
                            className="font-medium text-blue-500 hover:text-blue-700"
                          >
                            Choose files
                          </button>{" "}
                          to upload
                        </p>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                  )}

                  <div className="flex justify-between items-center">
                    <p className="mt-1 text-xs text-gray-500">
                      Files Supported: PDF, Image, Scan
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Maximum size: 5MB
                    </p>
                  </div>

                  <div className="space-y-2">
                    {fieldFiles.map((file: FileItem, i: number) => (
                      <FileUploadItem
                        key={file.id + i}
                        file={file}
                        removeFile={removeFile}
                        replaceFile={replaceFile}
                        viewFile={viewFile}
                        downloadFile={downloadFile}
                        FileIcon={FileIcon}
                        indexNumber={i}
                        lastIndex={fieldFiles.length - 1}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue="item-1"
          >
            <AccordionItem value="item-1">
              <AccordionTrigger className="pt-3 pb-3 text-xl font-bold leading-6 text-black">
                Other Supporting Documentation
              </AccordionTrigger>
              <hr className="mb-2" />
              <AccordionContent className="flex flex-col gap-2 pb-3">
                {otherDocumentFields.map(({ id, label }) => {
                  const fieldName = id as keyof UploadState;
                  const fieldFiles = files.filter(
                    (f: FileItem) => f.fieldName === fieldName
                  );
                  const upload = uploads[fieldName];
                  const required = isFieldRequired(id);
                  const error = validationErrors[id];

                  return (
                    <div
                      key={id}
                      className="p-6 my-1 mx-auto space-y-2 w-full bg-white rounded-lg border shadow-sm"
                    >
                      <label className="block font-extrabold tracking-wide leading-6 text-black capitalize text-[15px]">
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                        {!required && (
                          <span className="text-gray-400 ml-1 text-sm font-normal">
                            (Optional)
                          </span>
                        )}
                      </label>

                      <div
                        className={`border-2 border-dashed rounded-lg px-6 py-3 ${
                          error
                            ? "border-red-500"
                            : upload?.files?.length > 0
                            ? "border-green-500"
                            : "border-gray-200"
                        }`}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, fieldName)}
                      >
                        <div className="flex gap-2 items-center">
                          <Upload className="w-5 h-5 text-gray-400" />
                          <div className="text-sm text-center">
                            <p>
                              Drag & Drop or{" "}
                              <button
                                type="button"
                                onClick={() => triggerFileInput(fieldName)}
                                className="font-medium text-blue-500 hover:text-blue-700"
                              >
                                Choose files
                              </button>{" "}
                              to upload
                            </p>
                          </div>
                        </div>
                      </div>

                      {error && (
                        <p className="text-red-500 text-sm mt-1">{error}</p>
                      )}

                      <div className="flex justify-between items-center">
                        <p className="mt-1 text-xs text-gray-500">
                          Files Supported: PDF, Image, Scan
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Maximum size: 5MB
                        </p>
                      </div>

                      <div className="space-y-2">
                        {fieldFiles.map((file: FileItem, i: number) => (
                          <FileUploadItem
                            key={file.id + i}
                            file={file}
                            removeFile={removeFile}
                            replaceFile={replaceFile}
                            viewFile={viewFile}
                            downloadFile={downloadFile}
                            FileIcon={FileIcon}
                            indexNumber={i}
                            lastIndex={fieldFiles.length - 1}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export { createSupportingDocumentSchema };
export default Supporting_background_step_10;