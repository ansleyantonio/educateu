/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import DocumentView from "@/components/FileViewModal/documentView";
import { Button } from "@/components/ui/button";
import { getUserAccess } from "@/utils/permissions/permissions";
import { useMatchedModule } from "@/utils/useMatchedModule/useMatchedModule";
import { Download, Eye } from "lucide-react";
import { FileItem } from "../type/interface";

interface FileUploadItemProps {
  file: FileItem;
  viewFile: (path: string, type: string) => void;
  downloadFile: (path: string, name: string, type: string) => void;
  FileIcon: ({ type }: { type: "pdf" | "image" | "other" }) => JSX.Element;
  indexNumber: number;
  lastIndex?: number | string;
}
const FileUploadItem = ({
  file,
  viewFile,
  downloadFile,
  FileIcon,
  indexNumber,
  lastIndex,
}: FileUploadItemProps) => {
  const matchedModule = useMatchedModule();
  const permissions = matchedModule?.modulePermission || [];

  const hasPostAndDeletePermission =
    getUserAccess(permissions) === "full-access";

  return (
    <div>
      {file.status === "complete" && (
        <div className="flex justify-end space-x-2 mb-1">
          <Button
            type="button" // Add this
            variant="ghost"
            size="sm"
            // className="h-8 px-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
            // onClick={() =>
            //   file.path && downloadFile(file.path, file.name, file.type)
            // }
            className={`h-8 px-2 ${
              hasPostAndDeletePermission
                ? "text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                : "text-gray-400 cursor-not-allowed"
            }`}
            onClick={() =>
              hasPostAndDeletePermission &&
              file.path &&
              downloadFile(file.path, file.name, file.type)
            }
            disabled={!hasPostAndDeletePermission}
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
              <Eye className="h-4 w-4 " />
              View
            </Button>
          </DocumentView>
        </div>
      )}
      <div className="bg-[#EDF2FF] rounded-lg p-3 relative">
        <span className="text-[10px] -py-1 px-[7px] bg-opacity-75 bg-[#011C28] text-white rounded-full absolute top-1 right-1">
          {/* {indexNumber > 1 ? "Old" : "New"} */}
          {indexNumber == lastIndex ? "New" : "Old"}
        </span>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center w-full">
            <div
              className={`h-10 w-10 flex items-center justify-center rounded-md border ${
                file.type === "pdf"
                  ? "border-none"
                  : file.type === "image"
                  ? "border-none"
                  : "bg-gray-50 border-gray-100"
              }`}
            >
              <FileIcon type={file.type} />
            </div>
            <div className="ml-3 w-full">
              <p className="text-sm font-normal  max-w-[75%]  truncate overflow-hidden text-ellipsis whitespace-nowrap leading-6 text-[#272E35]">
                {file.name}
              </p>
              <p className="text-sm text-gray-500">{file.size}</p>
            </div>
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
  );
};

export default FileUploadItem;
