"use client";

import { useRef, useState, useEffect } from "react";
import { FileText, Trash2, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/custom_ui/button";
import { Card } from "@/components/ui/card";

interface UploadingFile {
  id: string;
  file: File;
  progress: number; // 0-100
  status: "uploading" | "complete";
}

const DocumentsTab = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  // Simulate upload progress
  useEffect(() => {
    if (uploadingFiles.length === 0) return;

    // For each uploading file, if status = uploading, increase progress
    const timers = uploadingFiles.map((uploadFile) => {
      if (uploadFile.status === "complete") return null;

      return setInterval(() => {
        setUploadingFiles((files) =>
          files.map((f) => {
            if (f.id === uploadFile.id) {
              const nextProgress = Math.min(f.progress + 10, 100);
              return {
                ...f,
                progress: nextProgress,
                status: nextProgress === 100 ? "complete" : "uploading",
              };
            }
            return f;
          })
        );
      }, 300); // increase every 300ms
    });

    // Cleanup timers
    return () => {
      timers.forEach((t) => {
        if (t) clearInterval(t);
      });
    };
  }, [uploadingFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newUploads: UploadingFile[] = Array.from(files).map((file) => ({
        id: `${Date.now()}-${file.name}-${Math.random()}`,
        file,
        progress: 0,
        status: "uploading",
      }));
      setUploadingFiles((prev) => [...prev, ...newUploads]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const newUploads: UploadingFile[] = Array.from(files).map((file) => ({
        id: `${Date.now()}-${file.name}-${Math.random()}`,
        file,
        progress: 0,
        status: "uploading",
      }));
      setUploadingFiles((prev) => [...prev, ...newUploads]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Remove uploaded or uploading file
  const handleRemoveFile = (id: string) => {
    setUploadingFiles((files) => files.filter((f) => f.id !== id));
  };

  return (
    <div className="p-4 mt-2">
      {/* Existing Documents */}
      {[
        {
          title: "Business Administration",
          size: "2.1 MB",
        },
        {
          title: "Academic Transcripts",
          size: "1.2 MB",
        },
      ].map((doc, index) => (
        <div
          key={index}
          className="w-full p-5 border rounded-xl bg-white shadow-sm mb-4"
        >
          <div className="grid grid-cols-2 gap-4 items-start">
            <div className="flex items-center">
              <FileText />
              <div className="flex flex-col ml-2">
                <p className="text-sm font-medium cursor-pointer hover:underline">
                  {doc.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  Uploaded: 1/15/2024 | Size: {doc.size}
                </p>
              </div>
            </div>

            <div className="ml-auto text-right flex gap-3">
              <Button variant="outline" size="lg">
                <Trash2 className="h-4 mr-1" />
                Delete File
              </Button>
              <Button variant="outline" size="lg">
                <Download className="h-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </div>
      ))}

      {/* Upload Section */}
      <Card className="mt-4 p-4">
        <h3 className="font-bold text-xl mb-4">File-Upload</h3>

        <div
          className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-gray-400 transition-all"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <Upload className="w-8 h-8 text-gray-500 mb-2" />
          <p className="text-sm text-gray-700 font-medium text-center">
            Drag & Drop your file here or click to upload
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf, image/*"
            className="hidden"
            id="fileUpload"
            onChange={handleFileChange}
            multiple
          />
        </div>

        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <p>Files Supported: PDF, Image, Scan</p>
          <p>Maximum size: 5MB</p>
        </div>

        {/* Uploading files list */}
        <div className="mt-4 space-y-3">
          {uploadingFiles.map(({ id, file, progress, status }) => (
            <div
              key={id}
              className="flex items-center justify-between bg-gray-50 p-3 rounded-md shadow-sm"
            >
              <div className="flex items-center gap-2">
                <FileText className="text-gray-500" />
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 min-w-[150px]">
                <div className="flex-grow bg-gray-200 rounded h-3 overflow-hidden">
                  <div
                    className={`h-3 bg-blue-500 transition-all duration-300`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs w-10 text-right">
                  {status === "complete" ? "Done" : `${progress}%`}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveFile(id)}
                >
                  <Trash2 className="h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default DocumentsTab;