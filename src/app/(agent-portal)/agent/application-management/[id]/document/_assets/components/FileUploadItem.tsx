/* eslint-disable no-unused-vars */
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
  indexNumber: number;
  lastIndex?: number | string;
}
const FileUploadItem = ({
  file,
  removeFile,
  replaceFile,
  viewFile,
  downloadFile,
  FileIcon,
  indexNumber,
  lastIndex,
}: FileUploadItemProps) => {
  return (
    <div>
      {file.status === "complete" && (
        <div className="flex justify-end mb-1 space-x-2">
          <Button
            type="button" // Add this
            variant="ghost"
            size="sm"
            className="px-2 h-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
            onClick={() =>
              file.path && downloadFile(file.path, file.name, file.type)
            }
          >
            <Download className=" w-4 h-4" />
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
              className="px-2 h-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
              // onClick={(e) => {
              //   e.stopPropagation();
              //   if (file.path) {
              //     viewFile(file.path, file.type);
              //   }
              // }}
            >
              <Eye className=" w-4 h-4" />
              View
            </Button>
          </DocumentView>
        </div>
      )}
      <div className="p-3 rounded-lg bg-[#EDF2FF]">
        <div className="bg-[#EDF2FF] rounded-lg p-3 relative">
          <span className="text-[10px] -py-1 px-[7px] bg-opacity-75 bg-[#011C28] text-white rounded-full absolute top-1 right-1">
            {indexNumber == lastIndex ? "New" : "Old"}
          </span>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
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
              <div className="ml-3">
                <p className="text-sm font-normal leading-6 text-[#272E35]">
                  {file.name.slice(0, 30) +
                    (file.name.length > 30 ? "..." : "")}
                </p>
                <p className="text-sm text-gray-500">{file.size}</p>
              </div>
            </div>

            <div className="flex items-center">
              {file.status === "complete" && (
                <div className="flex justify-between items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-2 h-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
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
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {file.status === "uploading" && (
            <div className="mt-2">
              <div className="flex justify-between mb-1 text-xs text-gray-500">
                <span>{file.timeLeft}</span>
                <span>{file.progress}%</span>
              </div>
              <div className="overflow-hidden relative w-full h-1.5 bg-gray-200 rounded-full">
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

export default FileUploadItem;
