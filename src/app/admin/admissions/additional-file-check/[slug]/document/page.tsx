/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import FileViewModal from "@/app/(agent-portal)/agent/application-management/[id]/document/_assets/components/FileViewModal";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuths } from "@/hooks/userContext";
import axios from "axios";
import { BadgeCheck, FileText, ImageIcon } from "lucide-react";
import NextImage from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdditionalApprovedDialog from "./_assets/components/AdditionalApproved_dialog";
import FileUploadItem from "./_assets/components/FileUploadItem";
import { AdditionalFileCheckModal } from "./_assets/components/generalCheck/confirmationModal";
import { FileItem, UploadState } from "./_assets/type/interface";
import pdfIcon from "/public//assets/logo/profile/Icon.svg";

const DocumentPage = ({ params }: { params: { slug: string } }) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [openAdditionalFileCheckModal, setOpenAdditionalFileCheckModal] =
    useState(false);

  const user = useAuths();
  const token = user?.user?.token;

  const { data, isLoading, refetch } = useFetchData({
    queryKey: "single-application-data",
    path: `admission/profile/application/${params.slug}`,
    method: "GET",
    filterData: {
      // applicationId: params.slug,
    },
  });
  console.log(data, "Additional Data")
  // const { data, isLoading, refetch } = useQuery({
  //   queryKey: ["single-application-data", { token, id: params.slug }],
  //   queryFn: fetchSingleApplications,
  //   enabled: !!params.slug,
  // });

  // const { data, isLoading, refetch } = useQuery({
  //   queryKey: [
  //     "single-additional-application-data",
  //     { token, id: params.slug },
  //   ],
  //   queryFn: fetchSingleAdditionalApplication,
  //   enabled: !!params.slug,
  // });

  // console.log("data", data);

  useEffect(() => {
    if (
      data?.data?.application?.supportingDocument?.supportingDocumentAttachments
    ) {
      const initialFileData: FileItem[] = [];
      const initialFormValues: any = {};

      data?.data?.application?.supportingDocument?.supportingDocumentAttachments.forEach(
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
    }
  }, [data]);

  // console.log("data aditional file check", data);
  // console.log("data aditional file initialFileData", files);
  const generateFileId = () => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
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
            className="h-5 w-5 text-blue-500"
          />
        );
      //  <FileText className="h-5 w-5 text-red-500" />;
      case "image":
        return <ImageIcon className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-red-500" />;
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

  const additionalCheckDone =
    data?.data?.application?.supportingDocument?.supportingDocumentAttachments.every(
      (file: any) => file.status == "NO_INFORMATION_REQUIRED_ADDITIONAL"
    );

 // Skeleton Loader Component
const DocumentCardSkeleton = () => {
  return (
    <div className="my-1 space-y-2 w-full mx-auto p-2 xl:p-6 bg-white rounded-lg shadow-sm border animate-pulse">
      <div className="flex flex-wrap justify-between items-center w-full gap-2">
        <div className="w-fit flex justify-normal items-center gap-x-2">
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
        </div>
        <div className="w-fit ml-auto flex gap-x-2">
          <div className="h-8 w-24 bg-gray-200 rounded"></div>
          <div className="h-8 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="h-32 w-full bg-gray-100 rounded-lg border-2 border-dashed border-gray-200"></div>
      <div className="space-y-2">
        <div className="h-16 w-full bg-gray-100 rounded"></div>
      </div>
    </div>
  );
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
      <>
        <div className="flex justify-end mb-3">
          {data?.data?.application?.additionalFileCheckStatus === "APPROVED" ? (
            <Button variant="outline" className="mr-4" disabled>
              Additional Check Completed
            </Button>
          ) : (
            <Button
              onClick={() => setOpenAdditionalFileCheckModal(true)}
              disabled={!additionalCheckDone}
              variant="outline"
              className="mr-4"
            >
              Confirm Additional Check
            </Button>
          )}
          <AdditionalApprovedDialog
            user={data}
            open={openAdditionalFileCheckModal}
            setOpen={setOpenAdditionalFileCheckModal}
          />
        </div>
      </>
      <Card>
        <div className="p-4 ">
          <h1 className="text-2xl font-semibold text-black">
            Supporting Documents
          </h1>
        </div>
        <hr />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 px-3">
          {isLoading ? (<>
            <DocumentCardSkeleton />
            <DocumentCardSkeleton />
            <DocumentCardSkeleton />
            <DocumentCardSkeleton />
          </>):([
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
            const fieldFiles = files.filter((f) => f.fieldName === fieldName);

            // when file is uploaded then (without path save not show  verify  button)
            const FileUploaded =
              data?.data?.application?.supportingDocument?.supportingDocumentAttachments.filter(
                (f: any) => f.name === fieldName
              );

            if (fieldFiles.length == 0) return null;

            const statusFileVerify =
              data?.data?.application?.supportingDocument?.supportingDocumentAttachments?.find(
                (item: any) =>
                  item.name === fieldName &&
                  item.status == "NO_INFORMATION_REQUIRED_ADDITIONAL"
              )?.status;

            return (
              <div
                key={id}
                className="my-2 xl:my-6 space-y-2 w-full mx-auto p-2 lg:p-4 xl:p-6 bg-white rounded-lg shadow-sm border"
              >
                <div className="flex flex-wrap justify-between items-center w-full gap-2">
                  <div className=" w-fit flex justify-normal items-center gap-x-2 tracking-wide text-[15px] leading-6 font-extrabold   capitalize">
                    {fieldName}
                    {statusFileVerify && (
                      <>
                        <BadgeCheck className="text-green-400 w-5 h-5" />
                        <p className="text-green-600 capitalize">verified</p>
                      </>
                    )}
                  </div>
                  {!statusFileVerify && (
                    <AdditionalFileCheckModal
                      fieldName={id}
                      applicationIid={params?.slug}
                      refetch={refetch}
                      isShow={FileUploaded?.length > 0}
                    />
                  )}
                </div>

                <div className="space-y-2">
                  {fieldFiles.map((file, i) => (
                    <FileUploadItem
                      key={file.id + i}
                      file={file}
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
          }))}
        </div>
      </Card>
      <Card className="mt-7">
        <div className="p-4">
          <h1 className="text-2xl font-semibold text-black">Other Documents</h1>
        </div>
        <hr />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 px-3">
          {isLoading ? (<>
            <DocumentCardSkeleton />
            <DocumentCardSkeleton />
            <DocumentCardSkeleton />
            <DocumentCardSkeleton />
          </>):(
            [
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
            const fieldFiles = files.filter((f) => f.fieldName === fieldName);

            // when file is uploaded then (without path save not show  verify  button)
            const FileUploaded =
              data?.data?.application?.supportingDocument?.supportingDocumentAttachments.filter(
                (f: any) => f.name === fieldName
              );
            if (fieldFiles.length == 0) return null;

            const statusFileVerify =
              data?.data?.application?.supportingDocument?.supportingDocumentAttachments?.find(
                (item: any) =>
                  item.name === fieldName &&
                  item.status == "NO_INFORMATION_REQUIRED_ADDITIONAL"
              )?.status;

            return (
              <div
                key={id}
                className="my-2 xl:my-6  space-y-2 w-full mx-auto p-2 lg:p-4 xl:p-6 bg-white rounded-lg shadow-sm border"
              >
                <div className="flex flex-wrap justify-between items-center w-full gap-2">
                  <div className="w-fit flex justify-normal items-center gap-x-2 tracking-wide text-[15px] leading-6 font-extrabold   capitalize">
                    {fieldName}
                    {statusFileVerify && (
                      <>
                        <BadgeCheck className="text-green-400 w-5 h-5" />
                        <p className="text-green-600 capitalize">verified</p>
                      </>
                    )}
                  </div>
                  {!statusFileVerify && (
                    <AdditionalFileCheckModal
                      fieldName={id}
                      applicationIid={params?.slug}
                      refetch={refetch}
                      isShow={FileUploaded?.length > 0}
                    />
                  )}
                </div>
                <div className="space-y-2">
                  {fieldFiles.map((file, i) => (
                    <FileUploadItem
                      key={file.id + i}
                      file={file}
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
          })
          )}
        </div>
      </Card>
    </div>
  );
};

export default DocumentPage;
