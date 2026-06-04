/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
"use client";
import DocumentView from "@/components/FileViewModal/documentView";
import { Button } from "@/components/ui/button";
import { Download, Eye, X } from "lucide-react";
import { FileItem } from "../type/interface";

interface FileUploadItemProps {
  file: FileItem;
  removeFile: (id: string) => void;
  replaceFile: (id: string) => void;
  viewFile: (path: string, type: string) => void;
  downloadFile: (path: string, name: string, type: string) => void;
  FileIcon: ({ type }: { type: "pdf" | "image" | "other" }) => JSX.Element;
  check: boolean;
  lastIndex?: number | string;
  indexNumber: number;
}
const ApplicationCreateFileUploadItem = ({
  file,
  removeFile,
  replaceFile,
  viewFile,
  downloadFile,
  FileIcon,
  check,
  lastIndex,
  indexNumber,
}: FileUploadItemProps) => {
  // const params = useParams();
  // const user = useAuths();
  // const token = user?.user?.token;

  // // general file check --- start ---------------
  // const id = params.slug;
  // const { data, isLoading } = useQuery({
  //   queryKey: ["single--file-check-data", id, token],
  //   queryFn: fetchAllCheckData,
  //   enabled: !!params.slug,
  // });

  // const statusFileVerify =
  //   data?.data?.generalFileChecks?.supportingDocumentAttachments?.find(
  //     (item: any) =>
  //       item.name === fieldName && item.status == "NO_INFORMATION_REQUIRED"
  //   )?.status;

  // console.log("generalFileData", data);
  return (
    // general file check --- end -----------------
    <div>
      {file.status === "complete" && (
        <div className="flex justify-end space-x-2 mb-1">
          <Button
            type="button" // Add this
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
            onClick={() =>
              file.path && downloadFile(file.path, file.name, file.type)
            }
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
          <DocumentView
            path={file?.path || ""}
            dataType={file.type}
            title={"view"}
          >
            <Button
              type="button" // Add this
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
              // onClick={(e) => {
              //   e.stopPropagation();
              //   if (file.path) {
              //     viewFile(file.path, file.type);
              //   }
              // }}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
          </DocumentView>
        </div>
      )}
      <div className="bg-[#EDF2FF] rounded-lg p-3 relative">
        <span className="text-[10px] -py-1 px-[7px] bg-opacity-75 bg-[#011C28] text-white rounded-full absolute top-1 right-1">
          {indexNumber == lastIndex ? "New" : "Old"}
        </span>

        <div className="flex items-center justify-between w-full">
          {/* icon show  */}
          <div
            className={`h-10 w-10 flex items-center justify-center  rounded-md border ${
              file.type === "pdf"
                ? "border-none"
                : file.type === "image"
                ? "border-none"
                : "bg-gray-50 border-gray-100"
            }`}
          >
            <FileIcon type={file.type} />
          </div>

          <div className="flex-1 overflow-hidden">
            {/* file name show  */}
            <div>
              <p className="text-sm font-normal  max-w-[65%]  truncate overflow-hidden text-ellipsis whitespace-nowrap leading-6 text-[#272E35]">
                {file.name}
              </p>
            </div>
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">{file.size}</p>
              </div>
              {!check && (
                <div className="flex items-center justify-end ">
                  {file.status === "complete" && (
                    <div className=" flex justify-between items-center">
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
                  <button
                    onClick={() => removeFile(file.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
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
        </div>
      </div>
    </div>
  );
};

export default ApplicationCreateFileUploadItem;
