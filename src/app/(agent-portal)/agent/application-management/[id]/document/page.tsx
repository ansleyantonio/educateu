/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuths } from "@/hooks/userContext";
import { capitalizeName } from "@/utils/capitalizeName/capitalizeName";
import { kebabToCamel } from "@/utils/CaseConverter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  AlertCircle,
  BadgeCheck,
  FileText,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import NextImage from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import ApplicationCreateFileUploadItem from "./_assets/components/ApplicationUpdateFileUploadItem";
import FileUploadFromLocal from "./_assets/components/fileUploadFromLocal";
import FileViewModal from "./_assets/components/FileViewModal";
import { createDocumentFormSchema } from "./_assets/schema/documentFormSchema";
import { FileItem, UploadState } from "./_assets/type/interface";
import pdfIcon from "/public//assets/logo/profile/Icon.svg";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";

// Helper function to determine file type
const getFileType = (fileName: string): "pdf" | "image" | "other" => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (extension === "pdf") return "pdf";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || ""))
    return "image";
  return "other";
};

const DocumentPage = ({ params }: { params: { id: string } }) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploads, setUploads] = useState<UploadState>({
    cv: { files: [], previews: [] },
    personalStatement: { files: [], previews: [] },
    consentForm: { files: [], previews: [] },
    englishCertificates: { files: [], previews: [] },
    essay: { files: [], previews: [] },
    passportId: { files: [], previews: [] },
    proofOfNameChange: { files: [], previews: [] },
    nationalIdentification: { files: [], previews: [] },
    policeClearance: { files: [], previews: [] },
    transcripts: { files: [], previews: [] },
    references: { files: [], previews: [] },
    qualification: { files: [], previews: [] },
    otherDocument: { files: [], previews: [] },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = useAuths();
  const token = user?.user?.token;
  const queryClient = useQueryClient();

  const { data, isLoading } = useFetchData({
    queryKey: "single-application-data",
    path: `application-management/${params.id}`,
    method: "GET",
    enabled: !!params.id,
  });

  // const { data, isLoading } = useQuery({
  //   queryKey: ["single-application-data", { token, id: params.id }],
  //   queryFn: fetchSingleApplications,
  //   enabled: !!params.id,
  // });

  const { data: awardingBodiesData, isLoading: isLoadingAwardingBodies } =
    useFetchData({
      path: `application-management/awarding-bodies/${data?.data?.application?.courseSelection?.awardingBodyId}`,
      queryKey: "fetch-awarding-bodies-data",
      method: "GET",
      enabled: !!data?.data?.application?.courseSelection?.awardingBodyId,
    });

  const awardingBodyDocs =
    awardingBodiesData?.data?.awardingBody?.requiredDocuments;

  const requiredDocs = useMemo(
    () => awardingBodyDocs || [],
    [awardingBodyDocs]
  );

  // Supporting documents fields
  const supportingDocFields = [
    "qualification",
    "nationalIdentification",
    "policeClearance",
    "references",
    "personalStatement",
    "consentForm",
  ];

  // Other documents fields
  const otherDocFields = [
    "englishCertificates",
    "essay",
    "cv",
    "passportId",
    "proofOfNameChange",
    "transcripts",
    "otherDocument",
  ];

  // Convert requiredDocs (kebab-case) to camelCase for field matching
  const requiredFieldsSet = useMemo(() => {
    return new Set(requiredDocs.map((doc: string) => kebabToCamel(doc)));
  }, [requiredDocs]);

  // Create dynamic schema based on required documents
  const dynamicSchema = useMemo(() => {
    return createDocumentFormSchema(requiredDocs);
  }, [requiredDocs]);

  type FormValues = z.infer<typeof dynamicSchema>;

  // Generate a more unique ID for files
  const generateFileId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      supportingDocument: {
        consentForm: [],
        personalStatement: [],
        cv: [],
        englishCertificates: [],
        essay: [],
        passportId: [],
        proofOfNameChange: [],
        nationalIdentification: [],
        policeClearance: [],
        transcripts: [],
        references: [],
        qualification: [],
        otherDocument: [],
      },
    },
  });

  useEffect(() => {
    if (
      data?.data?.application?.supportingDocument?.supportingDocumentAttachments
    ) {
      const initialFileData: FileItem[] = [];
      const initialFormValues: any = {};

      data.data.application.supportingDocument.supportingDocumentAttachments.forEach(
        (attachment: any) => {
          const fieldName = attachment.name;
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
              initialFormValues[fieldName].push(rawPathStr);
            } catch (error) {
              console.error("Error parsing file path:", error);
              initialFormValues[fieldName].push(rawPathStr);
            }
          });
        }
      );

      setFiles(initialFileData);
      form.reset({
        supportingDocument: initialFormValues,
      });
    }
  }, [data]);

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
          setFiles((prev) =>
            prev?.filter((file) => file.id !== newFileItem.id)
          );
          toast.error(`Failed to upload ${newFile.name}`);
        }
      }

      if (fieldName && uploadedPaths.length > 0) {
        const currentValues =
          (form.getValues(`supportingDocument.${fieldName}`) as string[]) || [];
        form.setValue(`supportingDocument.${fieldName}` as const, [
          ...currentValues,
          ...uploadedPaths,
        ]);

        setUploads((prev) => ({
          ...prev,
          [fieldName]: {
            files: [...prev[fieldName].files, ...newFiles],
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
    const fileToRemove = files?.find((file) => file.id === id);
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

      setUploads((prev) => {
        const index = prev[fileToRemove.fieldName!].previews.findIndex(
          (p) => p === `${process.env.NEXT_PUBLIC_API_URL}${fileToRemove.path}`
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
    const fileToReplace = files?.find((file) => file.id === id);
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

        const fileIndex = files.findIndex((file) => file.id === id);
        const tempId = `temp-${now}`;

        setFiles((prev) => {
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

          setFiles((prev) => {
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
              form.getValues(`supportingDocument.${fileToReplace.fieldName}`) ||
              [];

            const updatedValues = fileToReplace.path
              ? currentValues
                  .filter((val: string) => val !== fileToReplace.path)
                  .concat(path)
              : [...currentValues, path];

            form.setValue(
              `supportingDocument.${fileToReplace.fieldName}` as const,
              updatedValues
            );
          }

          setUploads((prev) => {
            const fieldUploads = prev[fileToReplace.fieldName!];
            const index = fileToReplace.path
              ? fieldUploads.previews.findIndex(
                  (p) =>
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
        } catch (error) {
          setFiles((prev) => prev.filter((file) => file.id !== tempId));
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

  const updateApplicationMutation = useApiMutation({
  path: `application-management/${params.id}`,
  method: "PATCH",
  onSuccess: (data) => {
    toast.success("Successfully updated profile!");
    queryClient.invalidateQueries({ queryKey: ["single-application-data"] });
  },
  onError: (error) => {
    toast.error(error || "Failed to update profile!");
  },
});

  function removeEmptyArrays(obj: any) {
    const result = { ...obj };

    for (const key in result) {
      if (Array.isArray(result[key])) {
        if (result[key].length === 0) {
          delete result[key];
        }
      } else if (typeof result[key] === "object" && result[key] !== null) {
        result[key] = removeEmptyArrays(result[key]);

        if (Object.keys(result[key]).length === 0) {
          delete result[key];
        }
      }
    }

    return result;
  }

  // Validate specific fields before submission
  const validateFields = async (fieldsToValidate: string[]) => {
    const isValid = await form.trigger(
      fieldsToValidate.map((field) => `supportingDocument.${field}` as any)
    );
    return isValid;
  };

  // Handle save for supporting documents
  const handleSaveSupportingDocs = async (e: any) => {
    e.preventDefault();
    const isValid = await validateFields(supportingDocFields);

    if (!isValid) {
      toast.error("Please fill all required supporting documents");
      return;
    }

    const values = form.getValues();
    const updateData = removeEmptyArrays(values);
    updateApplicationMutation.mutate(updateData);
  };

  // Handle save for other documents
  const handleSaveOtherDocs = async (e: any) => {
    e.preventDefault();
    const isValid = await validateFields(otherDocFields);

    if (!isValid) {
      toast.error("Please fill all required documents in others section");
      return;
    }

    const values = form.getValues();
    const updateData = removeEmptyArrays(values);
    updateApplicationMutation.mutate(updateData);
  };

  // Helper function to format field name for display
  const formatFieldName = (fieldName: string): string => {
    return fieldName
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Check if any required field in a category is missing
  const hasRequiredFieldErrors = (fieldsList: string[]) => {
    return fieldsList.some((field) => {
      const isRequired = requiredFieldsSet.has(field);
      const fieldError =
        form.formState.errors.supportingDocument?.[
          field as keyof typeof form.formState.errors.supportingDocument
        ];
      return isRequired && fieldError;
    });
  };

  return (
    <div>
      <FileViewModal
        viewType={viewType}
        viwPath={viwPath}
        open={open}
        setOpen={setOpen}
        visible={visible}
        setVisible={setVisible}
      />

      <div>
        <div>
          <FormProvider {...form}>
            <form className="px-4">
              <Accordion
                type="single"
                collapsible
                className="w-full"
                defaultValue="item-1"
              >
                <AccordionItem value="item-1">
                  <Card>
                    <AccordionTrigger className="border-b px-2">
                      <div className="px-3">
                        <h1 className="text-xl py-2 font-bold text-black">
                          Supporting Documents
                        </h1>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="mt-3">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 px-3">
                          {[
                            { id: "qualification", label: "Qualification" },
                            {
                              id: "nationalIdentification",
                              label: "National Identification",
                            },
                            {
                              id: "policeClearance",
                              label: "Police Clearance",
                            },
                            { id: "references", label: "References" },
                            {
                              id: "personalStatement",
                              label: "Personal Statement",
                            },
                            { id: "consentForm", label: "Consent Form" },
                          ].map(({ id, label }) => {
                            const fieldName = id as keyof UploadState;
                            const fieldFiles = files.filter(
                              (f) => f.fieldName === fieldName
                            );
                            const upload = uploads[fieldName];
                            const isRequired = requiredFieldsSet.has(fieldName);

                            const statusFileVerify =
                              data?.data?.application?.supportingDocument?.supportingDocumentAttachments?.find(
                                (item: any) =>
                                  item.name === fieldName &&
                                  item.status == "NO_INFORMATION_REQUIRED"
                              )?.status;

                            const generalFileCheckStatus =
                              data?.data?.application
                                ?.generalFileCheckStatus === "APPROVED";
                            const localFileUploadBoxHidden =
                              statusFileVerify || generalFileCheckStatus;

                            const fieldError =
                              form.formState.errors.supportingDocument?.[
                                fieldName
                              ];

                            return (
                              <div
                                key={id}
                                className="my-1 space-y-2 w-full mx-auto p-6 bg-white rounded-lg shadow-sm border"
                              >
                                <div className="w-fit flex justify-normal items-center gap-x-2 tracking-wide text-[15px] leading-6 font-extrabold capitalize">
                                  {formatFieldName(fieldName)}
                                  {isRequired && (
                                    <span className="text-red-500 text-lg">
                                      *
                                    </span>
                                  )}
                                  {statusFileVerify && (
                                    <>
                                      <BadgeCheck className="text-green-400 w-5 h-5" />
                                      <p className="text-green-600 capitalize">
                                        verified
                                      </p>
                                    </>
                                  )}
                                </div>

                                <FileUploadFromLocal
                                  handleDragOver={handleDragOver}
                                  handleDrop={handleDrop}
                                  triggerFileInput={triggerFileInput}
                                  upload={upload}
                                  fieldName={id}
                                  check={localFileUploadBoxHidden}
                                />

                                {fieldError && (
                                  <div className="flex gap-2 justify-start items-center">
                                    <AlertCircle className="text-red-500" />
                                    <div className="text-red-500">
                                      {capitalizeName(
                                        fieldError.message as string
                                      )}
                                    </div>
                                  </div>
                                )}

                                <div className="space-y-2">
                                  {fieldFiles.map(
                                    (file: FileItem, i: number) => (
                                      <ApplicationCreateFileUploadItem
                                        key={file.id + i}
                                        file={file}
                                        removeFile={removeFile}
                                        replaceFile={replaceFile}
                                        viewFile={viewFile}
                                        downloadFile={downloadFile}
                                        FileIcon={FileIcon}
                                        check={statusFileVerify}
                                        lastIndex={fieldFiles.length - 1}
                                        indexNumber={i}
                                      />
                                    )
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {data?.data?.application?.generalFileCheckStatus !=
                          "APPROVED" && (
                          <div className="flex justify-center items-center flex-col py-2">
                            <Button
                              variant="primary"
                              className="py-2 mt-3 w-[120px]"
                              type="submit"
                              disabled={updateApplicationMutation.isPending}
                              onClick={(e: any) => handleSaveSupportingDocs(e)}
                            >
                              {updateApplicationMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Save"
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
                <AccordionItem value="item-2" className="mt-6 mb-7">
                  <Card>
                    <AccordionTrigger className="border-b px-2">
                      <div className="px-3">
                        <h1 className="text-xl py-2 font-bold text-black">
                          Others Documents
                        </h1>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="mt-3">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 px-3">
                          {[
                            {
                              id: "englishCertificates",
                              label: "English Certificates",
                            },
                            { id: "essay", label: "Essay" },
                            { id: "cv", label: "CV" },
                            { id: "passportId", label: "Passport/ID" },
                            {
                              id: "proofOfNameChange",
                              label: "Proof of name change",
                            },
                            { id: "transcripts", label: "Transcripts" },
                            {
                              id: "otherDocument",
                              label: "Attachment (Attach a file if necessary)",
                            },
                          ].map(({ id, label }) => {
                            const fieldName = id as keyof UploadState;
                            const fieldFiles = files.filter(
                              (f) => f.fieldName === fieldName
                            );
                            const upload = uploads[fieldName];
                            const isRequired = requiredFieldsSet.has(fieldName);

                            const statusFileVerify =
                              data?.data?.application?.supportingDocument?.supportingDocumentAttachments?.find(
                                (item: any) =>
                                  item.name === fieldName &&
                                  item.status == "NO_INFORMATION_REQUIRED"
                              )?.status;

                            const generalFileCheckStatus =
                              data?.data?.application
                                ?.generalFileCheckStatus === "APPROVED";
                            const localFileUploadBoxHidden =
                              statusFileVerify || generalFileCheckStatus;

                            const fieldError =
                              form.formState.errors.supportingDocument?.[
                                fieldName
                              ];

                            return (
                              <div
                                key={id}
                                className="my-1 space-y-2 w-full mx-auto p-6 bg-white rounded-lg shadow-sm border"
                              >
                                <div className="w-fit flex justify-normal items-center gap-x-2 tracking-wide text-[15px] leading-6 font-extrabold capitalize">
                                  {formatFieldName(fieldName)}
                                  {isRequired && (
                                    <span className="text-red-500 text-lg">
                                      *
                                    </span>
                                  )}
                                  {statusFileVerify && (
                                    <>
                                      <BadgeCheck className="text-green-400 w-5 h-5" />
                                      <p className="text-green-600 capitalize">
                                        verified
                                      </p>
                                    </>
                                  )}
                                </div>

                                <FileUploadFromLocal
                                  handleDragOver={handleDragOver}
                                  handleDrop={handleDrop}
                                  triggerFileInput={triggerFileInput}
                                  upload={upload}
                                  fieldName={id}
                                  check={localFileUploadBoxHidden}
                                />

                                {fieldError && (
                                  <div className="flex gap-2 justify-start items-center">
                                    <AlertCircle className="text-red-500" />
                                    <div className="text-red-500">
                                      {capitalizeName(
                                        fieldError.message as string
                                      )}
                                    </div>
                                  </div>
                                )}
                                <div className="space-y-2">
                                  {fieldFiles.map(
                                    (file: FileItem, i: number) => (
                                      <ApplicationCreateFileUploadItem
                                        key={file.id + i}
                                        file={file}
                                        removeFile={removeFile}
                                        replaceFile={replaceFile}
                                        viewFile={viewFile}
                                        downloadFile={downloadFile}
                                        FileIcon={FileIcon}
                                        check={statusFileVerify}
                                        indexNumber={i}
                                        lastIndex={fieldFiles.length - 1}
                                      />
                                    )
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {data?.data?.application?.generalFileCheckStatus !=
                          "APPROVED" && (
                          <div className="flex justify-center items-center flex-col py-2">
                            <Button
                              variant="primary"
                              className="py-2 mt-3 w-[120px]"
                              type="submit"
                              disabled={updateApplicationMutation.isPending}
                              onClick={(e: any) => handleSaveOtherDocs(e)}
                            >
                              {updateApplicationMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Save"
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              </Accordion>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
};

export default DocumentPage;
