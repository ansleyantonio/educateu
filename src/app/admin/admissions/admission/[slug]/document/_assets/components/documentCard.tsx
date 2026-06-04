"use client";
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AlertCircle, BadgeCheck } from "lucide-react";
import { useParams } from "next/navigation";
import { FileItem, UploadState } from "../type/interface";
import FileUploadFromLocal from "./fileUploadFromLocal";
import FileUploadItem from "./FileUploadItem";
import { GeneralFileCheckModal } from "./generalCheck/confirmationModal";
import { UncheckFileCheckModal } from "./generalCheck/uncheckVerifyModal";
import { InformationRequiredModal } from "./information_required/confirmationModal";
import { capitalizeName } from "@/utils/capitalizeName/capitalizeName";
import DataLoader from "@/components/common/GlobalLoader/dataLoader";

const DocumentCard = ({
  files,
  applicationStage,
  supportingDocumentAttachments,
  uploads,
  refetch,
  handleDragOver,
  triggerFileInput,
  handleDrop,
  removeFile,
  replaceFile,
  viewFile,
  downloadFile,
  FileIcon,
  documentFiledList,
  generalFileCheckStatus,
  requiredFieldsSet,
  form,
  isLoading,
}: any) => {
  const params = useParams();
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
      <div className="grid gap-2 px-3 grid-cols-1  lg:grid-cols-2  auto-rows-auto">
        {isLoading ? (<>
            <DocumentCardSkeleton />
            <DocumentCardSkeleton />
            <DocumentCardSkeleton />
            <DocumentCardSkeleton />
          </>
        ) : (
          documentFiledList.map(({ id }: { id: string }) => {
            const fieldName = id as keyof UploadState;
            const fieldFiles = files.filter(
              (f: any) => f.fieldName === fieldName
            );
          const upload = uploads[fieldName];
          const isRequired = requiredFieldsSet.has(fieldName);

          // when file is uploaded then (without path save not show  verify  button)
          const FileUploaded = supportingDocumentAttachments?.filter(
            (f: any) => f.name === fieldName
          );

          // const statusFileVerify = supportingDocumentAttachments?.find(
          //   (item: any) =>
          //     item.name === fieldName &&
          //     item.status === "NO_INFORMATION_REQUIRED"
          // )?.status;

          const statusFileVerify = supportingDocumentAttachments?.find(
            (item: any) =>
              item.name === fieldName &&
              (item.status === "NO_INFORMATION_REQUIRED" ||
                item.status === "NO_INFORMATION_REQUIRED_ADDITIONAL")
          );

          // console.log(
          //   "statusFileVerify--------",
          //   supportingDocumentAttachments
          // );

          const localFileUploadBoxHidden =
            statusFileVerify || generalFileCheckStatus || applicationStage;

            const fieldError =
                              form.formState.errors.supportingDocument?.[
                                fieldName
                              ];

          // info required verify button hidden and visible
          const dialogBox = !statusFileVerify || applicationStage;
          // console.log("statusFileVerify", statusFileVerify);
          return (
            <div
              key={id}
              className="my-1 space-y-2 w-full  mx-auto p-2 xl:p-6 bg-white rounded-lg shadow-sm border"
            >
              <div className="flex flex-wrap justify-between items-center w-full gap-2">
                <div className=" w-fit flex justify-normal items-center gap-x-2 tracking-wide text-[15px] leading-6 font-extrabold   capitalize">
                  {fieldName}
                  {isRequired && (
                                    <span className="text-red-500 text-lg">
                                      *
                                    </span>
                                  )}
                  {statusFileVerify && (
                    <>
                      <BadgeCheck className="text-green-400 w-5 h-5" />
                      <p className="text-green-600 capitalize">verified</p>
                    </>
                  )}
                </div>

                {FileUploaded?.length > 0 && (
                  <div className="w-fit ml-auto flex flex-col justify-end items-end">
                    <div className="flex justify-start gap-x-2 items-center ">
                      {!applicationStage && !statusFileVerify && (
                        <>
                          <InformationRequiredModal
                            fieldName={id}
                            applicationIid={`${params?.slug}`}
                          />

                          <GeneralFileCheckModal
                            fieldName={id}
                            applicationIid={`${params?.slug}`}
                            refetch={refetch}
                            isShow={FileUploaded?.length > 0}
                            check={statusFileVerify}
                          />
                        </>
                      )}
                      {statusFileVerify && !generalFileCheckStatus && (
                        <UncheckFileCheckModal
                          fieldName={id}
                          applicationIid={`${params?.slug}`}
                          refetch={refetch}
                          isShow={FileUploaded?.length > 0}
                          check={statusFileVerify}
                        />
                      )}
                    </div>
                  </div>
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
                                            <div className="text-red-500">{capitalizeName(fieldError.message as string)}</div>
                                          </div>
                                  )}
              <div className="space-y-2">
                {fieldFiles.map((file: FileItem, i: number) => (
                  <FileUploadItem
                    key={file.id + i}
                    indexNumber={i}
                    lastIndex={fieldFiles.length - 1}
                    file={file}
                    fieldName={id}
                    removeFile={removeFile}
                    replaceFile={replaceFile}
                    viewFile={viewFile}
                    downloadFile={downloadFile}
                    FileIcon={FileIcon}
                    check={statusFileVerify}
                    applicationStage={applicationStage}
                  />
                ))}
              </div>
            </div>
          );
        })
        )}
      </div>
    </div>
  );
};

export default DocumentCard;
