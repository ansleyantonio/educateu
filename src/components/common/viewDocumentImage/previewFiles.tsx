"use client";

import { Button } from "@/components/ui/button";
import { Download, Eye } from "lucide-react";
import React, { useMemo } from "react";
import { useMatchedModule } from "@/utils/useMatchedModule/useMatchedModule";
import { getUserAccess } from "@/utils/permissions/permissions";

export interface RawFileData {
  path: string;
  mimetype: string;
  size: number;
  originalname: string;
}

interface FileUploadItemProps {
  jsonPath: string;
  viewFile?: (path: string, type: string) => void;
  downloadFile?: (path: string, name: string, type: string) => void;
}

const FileUploadItem = ({
  jsonPath,
  viewFile,
  downloadFile,
}: FileUploadItemProps) => {
  const { file, error } = useMemo(() => {
    try {
      const parsed = JSON.parse(jsonPath) as RawFileData;
      return { file: parsed, error: null };
    } catch (e) {
      console.error("Failed to parse file data:", e);
      return { file: null, error: "Invalid file data" };
    }
  }, [jsonPath]);

  const matchedModule = useMatchedModule();
  const permissions = matchedModule?.modulePermission ?? [];
  const hasPostAndDeletePermission = getUserAccess(permissions) === "full-access";

  const fileType = useMemo(() => {
    if (!file) return "other";
    return file.mimetype.startsWith("image")
      ? "image"
      : file.mimetype === "application/pdf"
      ? "pdf"
      : "other";
  }, [file]);

  const readableSize = useMemo(() => {
    if (!file) return "0 KB";
    return `${(file.size / 1024).toFixed(2)} KB`;
  }, [file]);

  const fileName = useMemo(() => {
    if (!file) return "Unknown file";
    return file.originalname.length > 30
      ? `${file.originalname.slice(0, 30)}...`
      : file.originalname;
  }, [file]);

  const FileIcon = () => {
    switch (fileType) {
      case "pdf":
        return <span>📄</span>;
      case "image":
        return <span>🖼️</span>;
      default:
        return <span>📁</span>;
    }
  };

  if (error || !file) {
    return (
      <div className="p-3 text-red-500 bg-red-50 rounded-lg">
        Failed to load file information
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div className="flex justify-end mb-1 space-x-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          // className="px-2 h-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
          className={`px-2 h-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50 ${
            !hasPostAndDeletePermission ? "opacity-50 cursor-not-allowed" : ""
          }`}
          // onClick={() => {
          //   if (downloadFile) {
          //     downloadFile(file?.path, fileName, fileType);
          //   }
          // }}
          onClick={() => {
            if (hasPostAndDeletePermission && downloadFile) {
              downloadFile(file?.path, fileName, fileType);
            }
          }}
          disabled={!hasPostAndDeletePermission}
        >
          <Download className="mr-1 w-4 h-4" />
          Download
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="px-2 h-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
          onClick={() => {
            if (viewFile) {
              viewFile(file?.path, fileType);
            }
          }}
        >
          <Eye className="mr-1 w-4 h-4" />
          View
        </Button>
      </div>

      <div className="p-3 rounded-lg bg-[#EDF2FF]">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div
              className={`h-10 w-10 flex items-center justify-center rounded-md ${
                fileType === "other" ? "bg-gray-50 border border-gray-100" : ""
              }`}
            >
              <FileIcon />
            </div>
            <div className="ml-3">
              <p className="text-sm font-normal leading-6 text-[#272E35]">
                {fileName}
              </p>
              <p className="text-sm text-gray-500">{readableSize}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadItem;
