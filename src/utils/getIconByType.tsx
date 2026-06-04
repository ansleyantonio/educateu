import {
  Video,
  FileImage,
  FileText,
  FileCode,
  File,
  FileDigit,
  FileSpreadsheet,
} from "lucide-react";

export const getIconByType = (type: string) => {
  switch (
    type?.toLowerCase() // ensure case-insensitivity
  ) {
    case "video":
      return <Video className="w-5 h-5 text-blue-500" />;
    case "image":
      return <FileImage className="w-5 h-5 text-pink-500" />;
    case "pdf":
      return <FileDigit className="w-5 h-5 text-red-500" />;
    case "doc":
      return <FileText className="w-5 h-5 text-blue-700" />;
    case "excel":
      case "csv":
      return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
    case "text":
      return <FileText className="w-5 h-5 text-green-500" />;
    case "code":
      return <FileCode className="w-5 h-5 text-indigo-500" />;
    default:
      return <File className="w-5 h-5 text-gray-500" />;
  }
};
