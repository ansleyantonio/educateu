/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, X, Eye } from "lucide-react";

interface PublicUploadProps {
  onUploadComplete?: (url: string) => void;
  disabled?: boolean;
  label?: string;
  defaultUrl?: string;
  defaultFileName?: string;
}

export const PublicUpload: React.FC<PublicUploadProps> = ({
  onUploadComplete,
  disabled = false,
  label,
  defaultUrl,
  defaultFileName,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(defaultUrl || null);
  const [fileName, setFileName] = useState<string | null>(defaultFileName || null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only images and PDFs are allowed.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(
        "http://18.171.208.170:4040/uploads-public",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (res.data?.status === "success") {
        const pathObj = JSON.parse(res.data.data.path);

        // Construct URL with original file name for proper PDF rendering
        let fileUrl = `http://18.171.208.170:4040${pathObj.path}`;
        if (pathObj.originalname) {
          const encodedName = encodeURIComponent(pathObj.originalname);
          fileUrl += `?filename=${encodedName}`;
        }

        setUploadedUrl(fileUrl);
        setFileName(pathObj.originalname || file.name);
        toast.success("File uploaded successfully!");
        onUploadComplete?.(fileUrl);
      } else {
        toast.error("Upload failed.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Something went wrong during upload.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleRemove = () => {
    setUploadedUrl(null);
    setFileName(null);
    onUploadComplete?.("");
  };

  const isPdf = uploadedUrl?.endsWith(".pdf") || (fileName?.endsWith(".pdf") ?? false);

  return (
    <div className="space-y-2">
      {label && <p className="font-medium">{label}</p>}

      {!uploadedUrl && (
        <div
          className={`p-4 text-center border-2 border-dashed rounded-md cursor-pointer ${
            disabled ? "opacity-50 cursor-not-allowed" : "border-green-400"
          }`}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <Upload className="mx-auto mb-2 w-6 h-6 text-gray-500" />
          Drag & Drop or <span className="underline text-blue-600">Choose file</span>
          <div className="text-sm text-gray-500 mt-1">Only Images or PDFs allowed</div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
            disabled={disabled}
          />
        </div>
      )}

      {uploading && (
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Uploading...</span>
        </div>
      )}

      {uploadedUrl && (
        <div className="flex items-center justify-between p-2 bg-blue-50 rounded-md">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setPreviewOpen(true);
            }}
            className="text-blue-600 underline truncate max-w-xs"
            title={fileName || uploadedUrl}
          >
            {fileName || uploadedUrl}
          </a>

          <div className="flex items-center gap-2">
            <Eye
              className="w-4 h-4 text-gray-600 cursor-pointer"
              onClick={() => setPreviewOpen(true)}
            />
            {!disabled && (
              <Button variant="destructive" size="icon" onClick={handleRemove}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {previewOpen && uploadedUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-3xl w-full max-h-full overflow-auto relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => setPreviewOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>

            {isPdf ? (
              <iframe
                src={uploadedUrl}
                className="w-full h-[80vh]"
                title={fileName || "Preview PDF"}
              />
            ) : (
              <img
                src={uploadedUrl}
                alt={fileName || "Preview"}
                className="max-h-[80vh] mx-auto"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};