import { useAuths } from "@/hooks/userContext";
import { Image } from "antd";
import axios from "axios";
import { Loader } from "lucide-react";
//import Image from "next/image";
import React, { useState } from "react";
import { DialogWrapper } from "../common/dialog/common_dialog/common_dialog";

interface FilePath {
  path: string;
  mimetype?: string;
}

interface DocumentViewProps {
  path: string | FilePath;
  dataType: string;
  title?: string;
  children: React.ReactNode;
}

const DocumentView: React.FC<DocumentViewProps> = ({
  path,
  dataType,
  title,
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  dataType = dataType.toLowerCase();
  const user = useAuths();
  const token = user?.user?.token;

  const extractRealPath = (input: string | FilePath): string => {
    try {
      // Handle JSON stringified object
      if (typeof input === "string") {
        if (input.startsWith("{")) {
          const parsed = JSON.parse(input);
          return parsed.path || "";
        }
        // Handle full URLs or plain paths
        return input;
      }

      // Already an object
      return input.path;
    } catch (error) {
      console.error("Invalid path format:", input);
      return "";
    }
  };

  const fetchFileUrl = async (actualPath: string) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}${actualPath}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: dataType === "pdf" ? "arraybuffer" : "blob",
        },
      );

      const blob = new Blob([response.data], {
        type:
          dataType === "pdf"
            ? "application/pdf"
            : dataType === "image"
              ? "image/*"
              : dataType === "video"
                ? "video/*"
                : "application/octet-stream",
      });

      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (error) {
      console.error("Failed to load file preview:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (actualPath: string, name = "document") => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}${actualPath}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        },
      );

      // Normalize type
      let normalizedType = dataType;
      if (dataType === "excel") normalizedType = "xlsx";

      const mimeMap: Record<string, { mime: string; ext: string }> = {
        pdf: { mime: "application/pdf", ext: ".pdf" },
        image: {
          mime: response.headers["content-type"] || "image/jpeg",
          ext: ".jpg",
        },
        doc: { mime: "application/msword", ext: ".doc" },
        docx: {
          mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ext: ".docx",
        },
        xls: { mime: "application/vnd.ms-excel", ext: ".xls" },
        xlsx: {
          mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          ext: ".xlsx",
        },
      };

      const { mime, ext } = mimeMap[normalizedType] || {
        mime: "application/octet-stream",
        ext: "",
      };

      const blob = new Blob([response.data], { type: mime });
      const url = window.URL.createObjectURL(blob);

      let filename = name;
      if (!filename.includes(".")) {
        filename += ext;
      }

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  // const downloadFile = async (actualPath: string, name = "document") => {
  //   try {
  //     const response = await axios.get(
  //       `${process.env.NEXT_PUBLIC_API_URL}${actualPath}`,
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //         responseType: "blob",
  //       }
  //     );

  //     // Map file types to MIME + extension
  //     const mimeMap: Record<string, { mime: string; ext: string }> = {
  //       pdf: { mime: "application/pdf", ext: ".pdf" },
  //       image: {
  //         mime: response.headers["content-type"] || "image/jpeg",
  //         ext: ".jpg",
  //       },
  //       doc: { mime: "application/msword", ext: ".doc" },
  //       docx: {
  //         mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  //         ext: ".docx",
  //       },
  //       xls: { mime: "application/vnd.ms-excel", ext: ".xls" },
  //       xlsx: {
  //         mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //         ext: ".xlsx",
  //       },
  //     };

  //     const { mime, ext } = mimeMap[dataType] || {
  //       mime: "application/octet-stream",
  //       ext: "",
  //     };

  //     const blob = new Blob([response.data], { type: mime });
  //     const url = window.URL.createObjectURL(blob);

  //     let filename = name;
  //     if (!filename.includes(".")) {
  //       filename += ext;
  //     }

  //     const a = document.createElement("a");
  //     a.href = url;
  //     a.download = filename;
  //     document.body.appendChild(a);
  //     a.click();

  //     window.URL.revokeObjectURL(url);
  //     document.body.removeChild(a);
  //   } catch (error) {
  //     console.error("Error downloading file:", error);
  //   }
  // };

  const actualPath = extractRealPath(path);

  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen);

    if (isOpen) {
      const actualPath = extractRealPath(path);
      // console.log("actualPath", actualPath);
      fetchFileUrl(actualPath);
    } else {
      setPreviewUrl(null); // clear the URL when closing
    }
  };

  return (
    <DialogWrapper
      handleOpen={handleDialogChange}
      open={open}
      title={title || "Document Preview"}
      triggerContent={children}
      style="min:h-[45vh] w-[55%] lg:w-[40%] max-h-[60vh] overflow-hidden p-4"
    >
      {loading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <Loader className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : previewUrl ? (
        <>
          {dataType === "pdf" ? (
            <iframe
              src={previewUrl}
              className="w-full rounded-md min-h-[40vh]"
            />
          ) : dataType === "image" ? (
            <div className="flex justify-center items-center mx-auto w-full min-h-[40vh]">
              <Image
                src={previewUrl}
                alt="Preview"
                style={{
                  //  height: 400,
                  maxWidth: "100%",
                  maxHeight: "100%",
                  // width: displayDimensions.width,
                  // height: displayDimensions.height,
                  objectFit: "contain",
                }}
                onError={(e) => {
                  console.log("Error to load image", e);
                }}
                className="object-contain rounded-md"
              />
            </div>
          ) : dataType === "video" ? (
            <div className="overflow-hidden relative w-full rounded-md aspect-[4/2]">
              <video
                src={previewUrl}
                controls
                className="object-cover w-full h-full rounded-md"
              />
            </div>
          ) : ["doc", "excel", "docx", "xls", "xlsx"].includes(dataType) ? (
            <div className="flex flex-col justify-center items-center min-h-[30vh]">
              <p className="mb-3 text-sm text-center text-muted-foreground">
                Preview not supported for this file type.
              </p>
              <button
                onClick={() => downloadFile(actualPath, title || "document")}
                className="py-2 px-4 text-white bg-blue-600 rounded-md"
              >
                Download File
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <div className="flex justify-center items-center min-h-[30vh]">
          <p className="text-sm text-center text-muted-foreground">
            No preview available.
          </p>
        </div>
      )}
    </DialogWrapper>
  );
};

export default DocumentView;
