/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import FileViewModal from "@/components/common/dialog/fileViewModal/FileViewModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/custom_ui/noClosedialog";
import { useAuths } from "@/hooks/userContext";
import axios from "axios";
import { X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import PreviewFiles from "./previewFiles";

const CheckDocumentViewPage = ({ attachment, name }: any) => {
  const auth = useAuths();
  const token = auth?.user?.token;

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
        // console.log("parsedPath", pathObj);
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
        },
      );
      // console.log("response", response);

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
        },
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

  return (
    <>
      <FileViewModal
        viewType={viewType}
        viwPath={viwPath}
        visible={visible}
        setVisible={setVisible}
      />

      <div>
        <span
          onClick={() => setOpen(true)}
          className="text-xs cursor-pointer text-[#30BD29]"
        >
          (View Document)
        </span>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize bg-white">
              <div className="flex justify-between items-center">
                <p>{name}</p>
                <X
                  size={20}
                  strokeWidth={3}
                  onClick={() => setOpen(false)}
                  className="cursor-pointer"
                />
              </div>
            </DialogTitle>
            <DialogDescription className="hidden"></DialogDescription>
          </DialogHeader>

          {attachment?.paths?.length > 0 &&
            attachment?.paths?.map((item: string, i: number) => (
              <div key={i}>
                <PreviewFiles
                  jsonPath={item}
                  viewFile={viewFile}
                  downloadFile={downloadFile}
                />
              </div>
            ))}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CheckDocumentViewPage;
