/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";

interface PreviewFileUploadProps {
    question: any;
    readonly?: boolean;
}

const PreviewFileUpload: React.FC<PreviewFileUploadProps> = ({ question, readonly = false }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState<string>("");

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
    };

    const validateFile = (file: File): boolean => {
        const maxSizeMB = question.maxSizeMB || 5;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;

        if (file.size > maxSizeBytes) {
            setError(`File "${file.name}" exceeds maximum size of ${maxSizeMB}MB`);
            return false;
        }

        if (question.fileTypes && question.fileTypes.length > 0) {
            const fileExtension = file.name.split(".").pop()?.toLowerCase();
            if (!fileExtension || !question.fileTypes.includes(fileExtension)) {
                setError(`File "${file.name}" is not an allowed file type`);
                return false;
            }
        }

        return true;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (readonly) return;
        setError("");

        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            const maxFiles = question.maxFiles || 1;

            // Validate all files first
            const validFiles: File[] = [];
            for (const file of newFiles) {
                if (validateFile(file)) {
                    validFiles.push(file);
                } else {
                    break; // Stop on first invalid file
                }
            }

            if (validFiles.length > 0) {
                setFiles((prev) => {
                    const combined = [...prev, ...validFiles];
                    return combined.slice(0, maxFiles);
                });
            }
        }

        // Reset input to allow selecting the same file again
        e.target.value = "";
    };

    const removeFile = (index: number) => {
        if (readonly) return;
        setFiles((prev) => prev.filter((_, i) => i !== index));
        setError("");
    };

    const formatFileTypes = () => {
        if (!question.fileTypes || question.fileTypes.length === 0) return ".jpeg, .jpg, .png";
        return question.fileTypes.map((type: string) => `.${type}`).join(", ");
    };

    const maxFiles = question.maxFiles || 1;

    return (
        <div className="flex flex-col gap-[24px]">
            <div className={`border flex items-center flex-col border-dashed rounded-lg p-[30px] gap-[10px] text-center text-[14px] ${readonly ? 'border-[#013E5B]/30 bg-[#013E5B]/5 text-[#013E5B] cursor-default' : 'border-[#CBD5E1] bg-[#F8FAFC] text-[#8C8C8C]'}`}>
                {readonly ? (
                    <>
                        <div className="text-[#013E5B] font-semibold">File Upload Question</div>
                        <div className="text-xs text-[#013E5B]/70 mt-2">
                            Max size: {question.maxSizeMB || 5}MB | Allowed: {formatFileTypes()}
                        </div>
                    </>
                ) : (
                    <>
                        <input
                            type="file"
                            multiple={maxFiles > 1}
                            accept={question.fileTypes?.map((type: string) => `.${type}`).join(",")}
                            onChange={handleFileChange}
                            className="hidden"
                            id={`file-upload-${question.id}`}
                            disabled={files.length >= maxFiles}
                        />
                        <label
                            htmlFor={`file-upload-${question.id}`}
                            className={`cursor-pointer flex flex-col items-center gap-[10px] w-full ${files.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <div className="w-[18px] h-[18px]">
                                <img src="/assets/icons/plus-vector.svg" alt="Upload" />
                            </div>
                            <div>
                                Upload your Signature ( Max size: {question.maxSizeMB || 5}MB )
                                <br />
                                Allowed File: {formatFileTypes()}
                                {maxFiles > 1 && (
                                    <>
                                        <br />
                                        Max files: {maxFiles} ({files.length}/{maxFiles} selected)
                                    </>
                                )}
                            </div>
                        </label>
                    </>
                )}
            </div>

            {error && (
                <div className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                    {error}
                </div>
            )}

            {files.length > 0 && (
                <div className="flex flex-col gap-2">
                    <div className="text-sm font-medium text-[#0F172A]">
                        Selected Files ({files.length}/{maxFiles}):
                    </div>
                    <div className="flex flex-col gap-2">
                        {files.map((file, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between bg-white border border-[#E2E8F0] rounded-lg p-3"
                            >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className="text-sm text-[#0F172A] truncate">
                                        {file.name}
                                    </div>
                                    <div className="text-xs text-[#64748B] whitespace-nowrap">
                                        ({formatFileSize(file.size)})
                                    </div>
                                </div>
                                {!readonly && (
                                    <button
                                        onClick={() => removeFile(index)}
                                        className="ml-2 text-red-500 hover:text-red-700 text-sm font-medium"
                                        type="button"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PreviewFileUpload;
