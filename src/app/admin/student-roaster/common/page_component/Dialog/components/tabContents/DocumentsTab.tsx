/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useState, useEffect } from "react";
import { FileText, Trash2, Download, Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button"; // Fixed: removed custom_ui path
import { Card } from "@/components/ui/card";
import DownloadButton from "@/components/common/button/downloadButton";
import { formatStackedText } from "@/utils/CaseConverter";
import { useAuths } from "@/hooks/userContext";
import { DynamicFileUploadField } from "@/components/common/fields/assets/components/FileUpload/DynamicFileUpload";

// --- API Interfaces ---
interface AttachmentPath {
  path: string;
  mimetype: string;
  size: number;
  originalname: string;
}

interface Attachment {
  id: string;
  paths: AttachmentPath[];
  createdAt: string;
  updatedAt: string;
}

interface DocumentItem {
  id: string;
  supportingDocumentId: string;
  attachmentId: string;
  name: string; // category name like "qualification"
  status: string;
  createdAt: string;
  updatedAt: string;
  attachment: Attachment;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "complete";
}

// Fixed: Added FileItem interface to match DynamicFileUploadField expectations
interface FileItem {
  id: string;
  name: string;
  size: number;
  path?: string;
  localUrl?: string;
  progress: number;
  status: "uploading" | "complete" | "error";
  timeLeft?: string;
  uploadStartTime?: number;
}

interface DocumentsTabProps {
  mode?: string;
  documents?: DocumentItem[] | null; // API-based docs - can be null
  isLoading?: boolean;
  error?: string | null;
}

const DocumentsTab = ({ 
  mode, 
  documents = [], 
  isLoading = false, 
  error = null 
}: DocumentsTabProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filesByMode, setFilesByMode] = useState<Record<string, UploadingFile[]>>({});
  const { editAccess } = useAuths(); // Fixed: destructuring syntax

  // Helper function to safely parse attachment paths
  const parseAttachmentPaths = (paths: any[]): AttachmentPath[] => {
    if (!Array.isArray(paths) || paths.length === 0) {
      return [];
    }

    try {
      return paths.map((p) => {
        if (typeof p === "string") {
          const parsed = JSON.parse(p);
          return {
            path: parsed.path || "",
            mimetype: parsed.mimetype || "",
            size: parsed.size || 0,
            originalname: parsed.originalname || "Unknown"
          };
        }
        return {
          path: p.path || "",
          mimetype: p.mimetype || "",
          size: p.size || 0,
          originalname: p.originalname || "Unknown"
        };
      });
    } catch (err) {
      console.error("Error parsing attachment paths:", err);
      return [];
    }
  };

  // Simulate upload progress
  useEffect(() => {
    if (!mode || !filesByMode[mode]) return;

    const timers = filesByMode[mode].map((uploadFile) => {
      if (uploadFile.status === "complete") return null;

      return setInterval(() => {
        setFilesByMode((prev) => ({
          ...prev,
          [mode]: prev[mode].map((f) =>
            f.id === uploadFile.id
              ? {
                  ...f,
                  progress: Math.min(f.progress + 10, 100),
                  status: f.progress + 10 >= 100 ? "complete" : "uploading",
                }
              : f
          ),
        }));
      }, 300);
    });

    return () => {
      timers.forEach((t) => t && clearInterval(t));
    };
  }, [filesByMode, mode]);

  // Fixed: Updated to handle FileItem[] from DynamicFileUploadField
  const handleFileChange = (files: FileItem[]) => {
    if (!mode) return;
    
    // Convert FileItem[] to UploadingFile[] format for internal state
    const newUploads: UploadingFile[] = files.map((fileItem) => ({
      id: fileItem.id,
      file: new File([new Blob()], fileItem.name, { 
        type: 'application/octet-stream' 
      }), // Create dummy File object
      progress: fileItem.progress,
      status: fileItem.status === "error" ? "uploading" : fileItem.status,
    }));

    setFilesByMode((prev) => ({
      ...prev,
      [mode]: newUploads,
    }));
  };

  // Legacy file input change (keeping for backward compatibility)
  const handleLegacyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!mode) return;
    const files = e.target.files;
    if (files?.length) {
      const newUploads: UploadingFile[] = Array.from(files).map((file) => ({
        id: `${Date.now()}-${file.name}-${Math.random()}`,
        file,
        progress: 0,
        status: "uploading",
      }));

      setFilesByMode((prev) => ({
        ...prev,
        [mode]: [...(prev[mode] || []), ...newUploads],
      }));
    }
  };

  // Drag & drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!mode) return;

    const files = e.dataTransfer.files;
    if (files?.length) {
      const newUploads: UploadingFile[] = Array.from(files).map((file) => ({
        id: `${Date.now()}-${file.name}-${Math.random()}`,
        file,
        progress: 0,
        status: "uploading",
      }));

      setFilesByMode((prev) => ({
        ...prev,
        [mode]: [...(prev[mode] || []), ...newUploads],
      }));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleRemoveFile = (id: string) => {
    if (!mode) return;
    setFilesByMode((prev) => ({
      ...prev,
      [mode]: prev[mode]?.filter((f) => f.id !== id) || [],
    }));
  };

  // Local uploaded files (UI only)
  const uploadedFilesFromUI =
    mode && filesByMode[mode]
      ? filesByMode[mode]
          .filter((f) => f.status === "complete")
          .map((f) => ({
            id: f.id,
            name: mode, // category comes from `mode`
            size: f.file.size,
            status: "Uploaded",
            createdAt: new Date().toISOString(),
            path: URL.createObjectURL(f.file),
            isLocal: true,
          }))
      : [];

  // Process API documents with error handling
  const processedAPIDocuments = () => {
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return [];
    }

    return documents
      .filter((doc) => {
        // Validate required fields
        return (
          doc &&
          doc.id &&
          doc.name &&
          doc.attachment &&
          doc.attachment.paths &&
          Array.isArray(doc.attachment.paths)
        );
      })
      .map((doc) => {
        try {
          const parsedPaths = parseAttachmentPaths(doc.attachment.paths);
          const fileMeta = parsedPaths[0];
          
          if (!fileMeta || !fileMeta.path) {
            console.warn(`Invalid file metadata for document ${doc.id}`);
            return null;
          }

          return {
            id: doc.id,
            category: doc.name,
            size: fileMeta.size || 0,
            status: doc.status || "Unknown",
            createdAt: doc.createdAt || new Date().toISOString(),
            path: fileMeta.path,
            isLocal: false,
          };
        } catch (err) {
          console.error(`Error processing document ${doc.id}:`, err);
          return null;
        }
      })
      .filter((doc) => doc !== null); // Remove null entries
  };

  // Combine API + local uploads
  const allFiles = [
    ...processedAPIDocuments(),
    ...uploadedFilesFromUI.map((file) => ({
      id: file.id,
      category: file.name, // from mode
      size: file.size,
      status: file.status,
      createdAt: file.createdAt,
      path: file.path,
      isLocal: true,
    })),
  ];

  // Group by category
  const groupedByCategory: Record<string, typeof allFiles> = {};
  allFiles.forEach((file) => {
    if (!groupedByCategory[file.category]) {
      groupedByCategory[file.category] = [];
    }
    groupedByCategory[file.category].push(file);
  });

  // Rename files in each category to "Category Document X"
  Object.keys(groupedByCategory).forEach((category) => {
    groupedByCategory[category] = groupedByCategory[category]
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((file, index) => ({
        ...file,
        displayName: `${category.charAt(0).toUpperCase() + category.slice(1)} Document ${
          index + 1
        }`,
      }));
  });

  const handleDownloadFile = (file: any) => {
    try {
      if (file.isLocal) {
        const a = document.createElement("a");
        a.href = file.path;
        a.download = file.displayName || "download";
        a.click();
        URL.revokeObjectURL(file.path);
      } else {
        const downloadUrl = decodeURIComponent(file.path);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = file.displayName || "download";
        a.click();
      }
    } catch (err) {
      console.error("Error downloading file:", err);
      alert("Failed to download file. Please try again.");
    }
  };

  // Error state
  if (error) {
    return (
      <div className="p-4 mt-2">
        <Card className="p-6">
          <div className="flex items-center justify-center text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Documents</h3>
            <p className="text-sm text-gray-600">{error}</p>
            <Button 
              className="mt-4" 
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="p-4 mt-2">
        <Card className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Loading documents...</p>
          </div>
        </Card>
      </div>
    );
  }

  // No data state
  const hasNoData = Object.keys(groupedByCategory).length === 0 && 
                    (!mode || !filesByMode[mode] || filesByMode[mode].length === 0);

  return (
    <div className="p-4 mt-2">
      {hasNoData && !isLoading && !error ? (
        <Card className="p-6">
          <div className="text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Documents Available</h3>
            <p className="text-sm text-gray-500 mb-4">
              No documents have been uploaded yet. Use the upload section below to add your first document.
            </p>
          </div>
        </Card>
      ) : (
        // Existing documents display
        Object.keys(groupedByCategory).map((category) => (
          <div key={category} className="mb-6">
            <h2 className="text-lg font-bold mb-3">
              {formatStackedText(category.charAt(0).toUpperCase() + category.slice(1))}
            </h2>
            {groupedByCategory[category]?.map((doc, index) => (
              <div
                key={doc.id}
                className="w-full p-5 border rounded-xl bg-white shadow-sm mb-4"
              >
                <div className="grid grid-cols-2 gap-4 items-start">
                  <div className="flex items-center">
                    <FileText />
                    <div className="flex flex-col ml-2">
                      <p className="text-sm font-medium cursor-pointer hover:underline capitalize">
                        {formatStackedText(doc.category).split(" ").join("-")}-Document-{index + 1}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded: {new Date(doc.createdAt).toLocaleDateString()} | Size:{" "}
                        {doc.size > 0 ? (doc.size / 1024 / 1024).toFixed(2) : "0.00"} MB | Status: {doc.status}
                      </p>
                    </div>
                  </div>
                  <DownloadButton 
                    disabled={!editAccess}
                    path={doc.path} 
                    fileName={`${doc.category}-Document-${index + 1}`} 
                  />
                </div>
              </div>
            ))}
          </div>
        ))
      )}

      {/* Upload Section */}
      <Card className="mt-4 p-4">
        <h3 className="font-bold text-xl mb-4">File Upload</h3>
        <DynamicFileUploadField
          disabled={!editAccess}
          name="documents"
          labelName="Upload Documents"
          multiple={true}
          maxSizeMB={5}
          acceptedTypes="image-pdf"
          onValueChange={handleFileChange}
          optional={true}
        />
      </Card>
    </div>
  );
};

export default DocumentsTab;