/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/custom_ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DownloadUserCSV } from "../../query_controller/downloadUserCSV";
import { uploadUserCSV } from "../../query_controller/uploadUserCSV";
import { useMutation } from "@tanstack/react-query";
import { useAuths } from "@/hooks/userContext";
import { toast } from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: () => void;
}

// interface UserCSVRow {
//   email: string;
//   password: string;
//   firstName?: string;
//   lastName?: string;
//   username: string;
//   address: string;
//   mobile: string;
//   roleName?: string;
// }

interface UploadResponse {
  success: boolean;
  message?: string;
  users?: string[];
  errors?: FailedRow[];
}

interface FailedRow {
  index: number;
  email?: string;
  errors: string[];
}

interface UploadError {
  error?: {
    message?: string;
    errors?: FailedRow[];
  };
}

export const useDownloadCSVTemplate = () => {
  return useMutation({
    mutationFn: DownloadUserCSV,
  });
};

const ExcelModal = ({ isOpen, onClose, onUploadSuccess }: Props) => {
  const auth = useAuths();
  const token = auth?.user?.token;

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [csvRows, setCsvRows] = useState<any[]>([]);
  const [successRows, setSuccessRows] = useState<Set<number>>(new Set());
  const [errorRows, setErrorRows] = useState<Map<number, string[]>>(new Map());

  const downloadColoredResult = (
    rows: any[],
    successSet: Set<number>,
    errorMap: Map<number, string[]>,
  ) => {
    const rowsWithStatus = rows.map((row, index) => {
      if (errorMap.has(index)) {
        return {
          Status: `❌ ${errorMap.get(index)?.join(", ")}`,
          ...row,
        };
      } else if (successSet.has(index)) {
        return {
          Status: "✅ Success",
          ...row,
        };
      }
      return {
        Status: "",
        ...row,
      };
    });

    const ws = XLSX.utils.json_to_sheet(rowsWithStatus);
    const wb = XLSX.utils.book_new();

    wb.SheetNames.push("Results");
    wb.Sheets["Results"] = ws;

    const wbout = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, "Upload_Result.xlsx");
  };

  const { mutate: uploadCSV, isPending: isUploading } = useMutation<
    UploadResponse,
    UploadError,
    { token: string; formData: FormData }
  >({
    mutationFn: uploadUserCSV,
    onSuccess: async (response) => {
      if (!csvFile) return;

      const parsedRows = await processCSV(csvFile);

      const successSet = new Set<number>();
      const errorMap = new Map<number, string[]>();

      if (response.success) {
        toast.success(response.message || "CSV uploaded successfully!");
        response.users?.forEach((_, idx) => successSet.add(idx));
        setSuccessRows(successSet);
        onUploadSuccess?.();
        handleClose();
      }

      // if (response.errors) {
      //   response.errors.forEach((row) => {
      //     errorMap.set(row.index, row.errors);
      //     row.errors.forEach((msg) => {
      //       toast.error(`Row ${row.index + 1}: ${msg}`);
      //     });
      //   });
      //   setErrorRows(errorMap);
      // }
      if (response.errors) {
        response.errors.forEach((row) => {
          errorMap.set(row.index, row.errors);
        });
        setErrorRows(errorMap);

        // Show one general error message instead of multiple:
        toast.error("Upload failed");
      }

      // Generate updated file
      setTimeout(() => {
        downloadColoredResult(parsedRows, successSet, errorMap);
        handleClose();
      }, 500);
    },
    onError: async (error: any) => {
      if (!csvFile) return;

      const parsedRows = await processCSV(csvFile);

      const errorData = error?.error;
      toast.error(errorData?.message || "Upload failed.");

      const errorMap = new Map<number, string[]>();
      // if (Array.isArray(errorData?.errors)) {
      //   errorData.errors.forEach((row: any) => {
      //     errorMap.set(row.index, row.errors);
      //     row.errors.forEach((msg: string) => {
      //       toast.error(`Row ${row.index + 1}: ${msg}`);
      //     });
      //   });
      //   setErrorRows(errorMap);
      // }
      if (Array.isArray(errorData?.errors)) {
        errorData.errors.forEach((row: any) => {
          errorMap.set(row.index, row.errors);
        });
        setErrorRows(errorMap);
      }

      setTimeout(() => {
        downloadColoredResult(parsedRows, new Set(), errorMap);
        handleClose();
      }, 500);
    },
  });

  const handleClose = () => {
    setCsvFile(null);
    setCsvRows([]);
    setErrorRows(new Map());
    setSuccessRows(new Set());
    onClose();
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type === "text/csv") {
      setCsvFile(file);
      processCSV(file);
    } else {
      toast.error("Only CSV files are allowed.");
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "text/csv") {
      setCsvFile(file);
      processCSV(file);
    } else {
      toast.error("Only CSV files are allowed.");
    }
  };

  const handleDeleteFile = () => {
    setCsvFile(null);
    setCsvRows([]);
    setSuccessRows(new Set());
    setErrorRows(new Map());
  };

  const handleUpload = () => {
    if (!csvFile || !token) return;

    const formData = new FormData();
    formData.append("file", csvFile);

    uploadCSV({ token, formData });
  };

  const { mutate: downloadCSVTemplate, isPending } = useDownloadCSVTemplate();

  const downloadCSV = () => {
    if (token) {
      downloadCSVTemplate({ token });
      onClose();
    }
    // onClose();
  };

  const processCSV = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const data = e.target?.result;
        if (typeof data === "string") {
          const workbook = XLSX.read(data, { type: "binary" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
          setCsvRows(json); // still set for UI if needed
          resolve(json);
        } else {
          reject("Invalid file content");
        }
      };
      reader.onerror = reject;
      reader.readAsBinaryString(file);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk User Upload</DialogTitle>
          <DialogDescription>
            Download the template and upload your CSV to bulk import users.
          </DialogDescription>
          <div className="flex justify-between items-center">
            <p className="text-xs text-red-500">
              Note: Email, password, and username are required fields. and
              address, mobile, firstName, lastName, and roleName are optional.
              but if you want to add them, please ensure they are in the correct
              format and follow Download CSV Template.
              <br />
            </p>
          </div>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <Button
            onClick={downloadCSV}
            disabled={isPending}
            className="w-full text-white bg-[#013E5B] hover:bg-[#0f4d6d]"
          >
            {isPending ? "Downloading Template..." : "Download CSV Template"}
          </Button>

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg px-6 py-8 text-center transition-colors duration-200 cursor-pointer ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-gray-100 hover:bg-gray-200"
            }`}
            onClick={() => document.getElementById("csvInput")?.click()}
          >
            {csvFile ? (
              <div className="flex justify-between items-center p-2 bg-green-100 rounded">
                <p className="text-green-600 font-medium truncate max-w-[75%]">
                  {csvFile.name}
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFile();
                  }}
                  className="ml-2 text-lg font-bold text-black hover:text-red-700"
                  aria-label="Remove file"
                  title="Remove file"
                >
                  ✕
                </button>
              </div>
            ) : (
              <p className="font-medium text-gray-600">
                Drag & Drop or Click to Upload CSV File
              </p>
            )}
            <input
              id="csvInput"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {csvFile && (
            <Button
              onClick={handleUpload}
              className="w-full text-white bg-[#013E5B] hover:bg-[#0f4d6d]"
            >
              {isUploading ? "Uploading..." : "Upload CSV"}
            </Button>
          )}
        </div>

        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExcelModal;

