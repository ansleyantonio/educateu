"use client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { GrUploadOption } from "react-icons/gr";

interface UploadCardProps {
  title: string;
}

const UploadCard: React.FC<UploadCardProps> = ({ title }) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      console.log("Uploaded files:", files);
    }
  };

  return (
    <Card className="p-6 space-y-4 rounded-md border border-gray-200 shadow-sm">
      {/* Title */}
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>

      {/* Upload Area */}
      <label
        htmlFor={title}
        className="flex flex-col gap-2 justify-center items-center py-8 rounded-md border border-gray-300 border-dashed transition-all cursor-pointer hover:bg-gray-50"
      >
        <GrUploadOption size={30} className="text-gray-400" />
        <p className="text-sm text-center text-gray-700">
          Drag and Drop files here or{" "}
          <span className="text-blue-600 underline">choose file</span>
        </p>
        <Input
          type="file"
          id={title}
          className="hidden"
          onChange={handleFileUpload}
        />
      </label>

      {/* File Info */}
      <div className="flex justify-between text-sm text-gray-600">
        <p>Files Supported: PDF, Image, Scan</p>
        <p>Maximum size: 5MB</p>
      </div>
    </Card>
  );
};

export default UploadCard;
