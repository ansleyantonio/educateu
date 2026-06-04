/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/custom_ui/form";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuths } from "@/hooks/userContext";
import axios from "axios";
import { Eye, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

interface FileItem {
  name: string;
  size: number;
  path: string;
}

interface MultiFileUploadFieldProps {
  form: any;
  name: string;
  labelName?: string;
  optional?: boolean;
  viewOnly?: boolean;
  multiple?: boolean;
  maxSizeMB?: number;
}

export const MultiFileUploadField = ({
  form,
  name,
  labelName,
  optional = false,
  viewOnly = false,
  multiple = false,
  maxSizeMB = 5,
}: MultiFileUploadFieldProps) => {
  const user = useAuths();
  const token = user?.user?.token;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  const ImageOrFileGetViewPath = async (path: string, type?: string) => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}${path}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: type === "pdf" ? "arraybuffer" : "blob",
      }
    );

    const blob = new Blob([response.data], {
      type: type === "pdf" ? "application/pdf" : undefined,
    });
    return URL.createObjectURL(blob);
  };

  const uploadMutation = useApiMutation({
    method: "POST",
    path: `uploads`,
    dataType: "multipart/form-data",
    onSuccess: async (data: any) => {
      if (data?.statusCode === 200) {
        const responsePath = JSON.parse(data?.data?.path)?.path;
        const fileData: FileItem = {
          name: data?.data?.originalname,
          size: data?.data?.size,
          path: responsePath,
        };

        const currentValue: FileItem[] = form.watch(name) || [];
        const newValue = multiple ? [...currentValue, fileData] : [fileData];
        form.setValue(name, newValue);
        toast.success("Uploaded successfully");
      } else toast.error("Upload failed.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Upload error");
    },
  });

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`${file.name} exceeds ${maxSizeMB}MB limit.`);
        continue;
      }

      const formData = new FormData();
      formData.append("file", file);
      uploadMutation.mutate(formData);
    }
  };

  const handlePreview = async (file: FileItem, index: number) => {
    setLoadingIndex(index);
    const url = await ImageOrFileGetViewPath(file.path);
    setPreviewUrl(url);
    setShowPreview(true);
    setLoadingIndex(null);
  };

  const handleRemove = (index: number) => {
    const current: FileItem[] = form.watch(name) || [];
    const updated = current.filter((_, i) => i !== index);
    form.setValue(name, updated);
  };

  const handleDownload = async (file: FileItem) => {
    const link = document.createElement("a");
    const url = await ImageOrFileGetViewPath(file.path);
    link.href = url;
    link.download = file.name;
    link.click();
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={() => (
        <FormItem className="w-full">
          {labelName && (
            <label className="font-semibold text-[14px]">
              {labelName} {!optional && <span className="text-red-500">*</span>}
            </label>
          )}

          <FormControl>
          {!viewOnly && (
            <div
              className="border-2 border-dashed border-green-400 rounded-md p-4 text-center cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              Drag & Drop or{" "}
              <span className="text-blue-600 underline">Choose files</span> to
              upload
              <div className="text-sm text-gray-500">
                Files Supported: PDF, Image, Scan | Max: {maxSizeMB}MB
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple={multiple}
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.pdf"
              />
            </div>
            )}
          </FormControl>

          <div className="space-y-2 mt-4">
            {(form.watch(name) || []).map((file: FileItem, index: number) => (
              <div
                key={index}
                className="flex justify-between items-center bg-blue-50 p-2 rounded-md"
              >
                <div>
                  <div className="text-sm font-medium truncate w-48">
                    {file.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(1)}MB
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(file)}
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handlePreview(file, index)}
                  >
                    {loadingIndex === index ? (
                      <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                  {!viewOnly && (
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemove(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <FormMessage />

          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogContent className="max-w-3xl p-4">
              {previewUrl && (
                <>
                  {previewUrl.includes("blob") && previewUrl.includes("pdf") ? (
                    <iframe src={previewUrl} className="w-full h-[600px]" />
                  ) : (
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      width={1000}
                      height={600}
                      className="rounded-md w-full h-auto"
                    />
                  )}
                </>
              )}
            </DialogContent>
          </Dialog>
        </FormItem>
      )}
    />
  );
};
