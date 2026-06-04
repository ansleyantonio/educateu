/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuths } from "@/hooks/userContext";
import { kebabToCamel } from "@/utils/CaseConverter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import NextImage from "next/image";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import DocumentCard from "./_assets/components/documentCard";
import FileViewModal from "./_assets/components/FileViewModal";
import GeneralApprovedDialog from "./_assets/components/generalApproved_dialog";
import UpdateRequestDialog from "./_assets/components/updateRequest/UpdateRequestDialog";
import { createDocumentFormSchema } from "./_assets/schema/documentFormSchema";
import { FileItem, UploadState } from "./_assets/type/interface";
import pdfIcon from "/public/assets/logo/profile/Icon.svg";

// Helper function to determine file type
const getFileType = (fileName: string): "pdf" | "image" | "other" => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (extension === "pdf") return "pdf";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || ""))
    return "image";
  return "other";
};

const DocumentPage = ({ params }: { params: { slug: string } }) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [openGeneralFileCheckModal, setOpenGeneralFileCheckModal] =
    useState(false);

  // console.log("files", files);
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

  const { user, editAccess } = useAuths();
  const token = user?.token;
  const queryClient = useQueryClient();

  // const { data, isLoading, refetch } = useFetchData({
  //   method: "GET",
  //   path: `wellbeing`,
  //   queryKey: `admission/profile/application/${params.slug}`,
  //   filterData: {
  //     // page: currentPage,
  //     // pageSie: limit,
  //   },
  // });
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

  const { data, isLoading, refetch } = useFetchData({
    queryKey: "single-application-data",
    path: `admission/profile/application/${params.slug}`,
    method: "POST",
    filterData: {
      // page: currentPage,
      // searchTerm: searchText,
    },
  });

  // const { data, isLoading, refetch } = useQuery({
  //   queryKey: ["single-application-data", { token, id: params.slug }],
  //   queryFn: fetchSingleApplications,
  //   enabled: !!params.slug,
  // });

  const { data: awardingBodiesData, isLoading: isLoadingAwardingBodies } =
    useFetchData({
      path: `awarding-bodies/${data?.data?.application?.courseSelection?.awardingBodyId}`,
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
  // const disabled = data?.data?.application?.stage === "NEW";
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

  // Validate specific fields before submission
  const validateFields = async (fieldsToValidate: string[]) => {
    const isValid = await form.trigger(
      fieldsToValidate.map((field) => `supportingDocument.${field}` as any)
    );
    return isValid;
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      supportingDocument: {
        cv: [],
        personalStatement: [],
        consentForm: [],
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
              // Parse the path object to get file info for display
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
                path: rawPathStr, // Store the original stringified JSON
              };

              initialFileData.push(fileItem);
              initialFormValues[fieldName].push(rawPathStr); // Push the original string
            } catch (error) {
              console.error("Error parsing file path:", error);
              // Fallback - push the raw string if parsing fails
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

      // Update form value with all paths if this is a specific field upload
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

        // Replace the old file in place (maintain position)
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

          // Replace the temp uploading file with the final uploaded data (maintain position)
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

          // Update form value
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

          // Update uploads state
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
          // Revert on error
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
            // height={20}
            className="w-5 h-5 text-blue-500"
          />
        );
      //  <FileText className="w-5 h-5 text-red-500" />;
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
      // Check if path is a stringified JSON object
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

  // Download file handler
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

      // Determine the MIME type based on file type
      let mimeType = "application/octet-stream";
      if (type === "pdf") {
        mimeType = "application/pdf";
      } else if (type === "image") {
        // You can make this more specific based on image types if needed
        mimeType = response.headers["content-type"] || "image/jpeg";
      }

      // Create a blob with the correct MIME type
      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element
      const a = document.createElement("a");
      a.href = url;

      // Ensure the filename has the correct extension
      let filename = name;
      if (!filename.includes(".") && type === "pdf") {
        filename += ".pdf";
      } else if (!filename.includes(".") && type === "image") {
        filename += ".jpg"; // or .png based on your needs
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file");
    }
  };

  const updateApplicationMutation = useApiMutation({
    path: `admission/profile/application/${params.slug}`,
    method: "POST",
    onSuccess: (data: any) => {
      showToast("success", data);
      // if (data?.data?.statusCode === 200) {
      queryClient.invalidateQueries({
        queryKey: ["single-application-data"],
      });

      // toast.error(data?.message);
    },
    onError: (error) => {
      showToast("error", error);
    },
  });

  function removeEmptyArrays(obj: any) {
    const result = { ...obj };

    for (const key in result) {
      if (Array.isArray(result[key])) {
        // Check if the array is empty
        if (result[key].length === 0) {
          delete result[key]; // Remove the property if array is empty
        }
      } else if (typeof result[key] === "object" && result[key] !== null) {
        // Recursively check nested objects
        result[key] = removeEmptyArrays(result[key]);

        // If the nested object becomes empty after processing, remove it
        if (Object.keys(result[key]).length === 0) {
          delete result[key];
        }
      }
    }

    return result;
  }

  function onSubmit(values: FormValues) {
    const updateData = removeEmptyArrays(values);
    // console.log("values", updateData);
    updateApplicationMutation.mutate(updateData);
  }

  const generalCheckDone =
    data?.data?.application?.supportingDocument?.supportingDocumentAttachments.every(
      (file: any) =>
        file.status === "NO_INFORMATION_REQUIRED" ||
        file.status == "NO_INFORMATION_REQUIRED_ADDITIONAL"
    );

  // if stage if new then just view the document
  const applicationStage = data?.data?.application.stage === "NEW";

  const documentFiledList = [
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
  ];

  const OthersDocumentFiledList = [
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
  ];
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

  return (
    <PageWithBreadcrumb
      items={[
        {
          title: "Admissions",
        },
        { title: "Applications", href: "/admin/admissions/admission" },
        { title: "Document" },
      ]}
    >
      <div>
        {/* file view modal */}
        <FileViewModal
          viewType={viewType}
          viwPath={viwPath}
          open={open}
          setOpen={setOpen}
          visible={visible}
          setVisible={setVisible}
        />

        <div>
          <div className="flex justify-end pb-4">
            {/* {allNoInfoRequired && <GeneralApprovedDialog user={data} />} */}

            {data?.data?.application?.stage === "NEW" ||
            data?.data?.application?.supportingDocument
              ?.supportingDocumentAttachments?.length === 0 ? (
              <Button variant="outline" className="mr-4" disabled>
                Confirm General Check
              </Button>
            ) : data?.data?.application?.generalFileCheckStatus ===
              "APPROVED" ? (
              <Button variant="outline" className="mr-4" disabled>
                General Check Completed
              </Button>
            ) : (
              <Button
                onClick={() => setOpenGeneralFileCheckModal(true)}
                disabled={!generalCheckDone}
                variant="outline"
                className="mr-4"
              >
                Confirm General Check
              </Button>
            )}

            <GeneralApprovedDialog
              user={data}
              open={openGeneralFileCheckModal}
              setOpen={setOpenGeneralFileCheckModal}
            />
            {/* <Button className="bg-primary">Confirm General Check</Button> */}
          </div>
          <FormProvider {...form}>
            <form className="xl:px-4">
              <Accordion
                type="single"
                collapsible
                className="w-full"
                defaultValue="item-1"
              >
                <AccordionItem value="item-1">
                  <div>
                    <Card>
                      <AccordionTrigger className="px-2 border-b">
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center xl:px-3 flex-1">
                          <h1 className="py-2 text-xl font-bold text-black">
                            Supporting Documents
                          </h1>
                          {data?.data?.application?.generalFileCheckStatus !=
                            "APPROVED" &&
                            !applicationStage && (
                              <div>
                                <UpdateRequestDialog
                                  buttonType="link"
                                  value={"supporting-documents"}
                                />
                              </div>
                            )}
                          {/* <UpdateRequestDialog
                          buttonType="link"
                          value={"Supporting Documents"}
                        /> */}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="mt-3">
                          <DocumentCard
                            form={form}
                            isLoading={isLoading}
                            requiredFieldsSet={requiredFieldsSet}
                            files={files}
                            supportingDocumentAttachments={
                              data?.data?.application?.supportingDocument
                                ?.supportingDocumentAttachments
                            }
                            applicationStage={applicationStage}
                            uploads={uploads}
                            refetch={refetch}
                            handleDragOver={handleDragOver}
                            triggerFileInput={triggerFileInput}
                            handleDrop={handleDrop}
                            removeFile={removeFile}
                            replaceFile={replaceFile}
                            viewFile={viewFile}
                            downloadFile={downloadFile}
                            FileIcon={FileIcon}
                            documentFiledList={documentFiledList}
                            generalFileCheckStatus={
                              data?.data?.application
                                ?.generalFileCheckStatus === "APPROVED"
                                ? true
                                : false
                            }
                          />

                          {data?.data?.application?.generalFileCheckStatus !=
                            "APPROVED" &&
                            !applicationStage && (
                              <div className="flex flex-col justify-center items-center py-2">
                                <Button
                                  variant="primary"
                                  // className="py-2 mt-3 w-[120px]"
                                  className={`py-2 mt-3 w-[120px] ${
                                    !editAccess
                                      ? "opacity-50 cursor-not-allowed"
                                      : ""
                                  }`}
                                  type="submit"
                                  disabled={
                                    updateApplicationMutation.isPending ||
                                    !editAccess
                                  }
                                  onClick={(e: any) =>
                                    handleSaveSupportingDocs(e)
                                  }
                                >
                                  {updateApplicationMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    "Save"
                                  )}
                                </Button>
                              </div>
                            )}
                        </div>
                      </AccordionContent>
                    </Card>
                  </div>
                </AccordionItem>
                <AccordionItem value="item-2" className="mt-6 mb-7">
                  <div>
                    <Card>
                      <AccordionTrigger className="px-2 border-b">
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center xl:px-3 flex-1">
                          <h1 className="py-2 text-xl font-bold text-black">
                            Others Documents
                          </h1>

                          {/* <UpdateRequestDialog
                          buttonType="link"
                          value={"Supporting Documents"}
                        /> */}

                          {data?.data?.application?.generalFileCheckStatus !=
                            "APPROVED" &&
                            !applicationStage && (
                              <div>
                                <UpdateRequestDialog
                                  buttonType="link"
                                  value={"others-documents"}
                                />
                              </div>
                            )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        {/* Specific Document Fields */}
                        <div className="mt-3">
                          <DocumentCard
                            form={form}
                            requiredFieldsSet={requiredFieldsSet}
                            files={files}
                            applicationStage={applicationStage}
                            supportingDocumentAttachments={
                              data?.data?.application?.supportingDocument
                                ?.supportingDocumentAttachments
                            }
                            uploads={uploads}
                            refetch={refetch}
                            handleDragOver={handleDragOver}
                            triggerFileInput={triggerFileInput}
                            handleDrop={handleDrop}
                            removeFile={removeFile}
                            replaceFile={replaceFile}
                            viewFile={viewFile}
                            downloadFile={downloadFile}
                            FileIcon={FileIcon}
                            documentFiledList={OthersDocumentFiledList}
                            generalFileCheckStatus={
                              data?.data?.application
                                ?.generalFileCheckStatus === "APPROVED"
                                ? true
                                : false
                            }
                          />

                          {data?.data?.application?.generalFileCheckStatus !=
                            "APPROVED" &&
                            !applicationStage && (
                              <div className="flex flex-col justify-center items-center py-2">
                                <Button
                                  variant="primary"
                                  className="py-2 mt-3 w-[120px]"
                                  type="submit"
                                  disabled={
                                    updateApplicationMutation.isPending ||
                                    !editAccess
                                  }
                                  onClick={(e: any) => handleSaveOtherDocs(e)}
                                >
                                  {updateApplicationMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    "Save"
                                  )}
                                </Button>
                              </div>
                            )}
                        </div>
                      </AccordionContent>
                    </Card>
                  </div>
                </AccordionItem>
              </Accordion>
            </form>
          </FormProvider>
        </div>
      </div>
    </PageWithBreadcrumb>
  );
};

export default DocumentPage;
