/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/custom_ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuths } from "@/hooks/userContext";
import { cn } from "@/lib/utils";
import axios from "axios";
import { Download, Loader2Icon } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";


interface ButtonTooltipProps {
  path?: any;
  side?: "top" | "bottom" | "left" | "right";
  fileName?: string;
  disabled?:boolean
}
interface ViewPathResult {
  url: string;
  contentType: string;
}
function DownloadButton({
  path,
  fileName,
  side,
  disabled=false
}: ButtonTooltipProps) {
    const user = useAuths();
    const token = user?.user?.token;
 // Changed to return object with url and contentType
  const ImageOrFileGetViewPath = async (
    path: string
  ): Promise<ViewPathResult> => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}${path}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "arraybuffer",
      }
    );

    const contentType = response.headers["content-type"] || "";

    const blob = new Blob([response.data], {
      type: contentType,
    });
    return { url: URL.createObjectURL(blob), contentType };
  };

  const handleDownload = async () => {
    if (!path) return;

    try {
      const { url } = await ImageOrFileGetViewPath(path);

      // Create the download link
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName ? fileName : "download";

      // Append to DOM
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to download file");
    }
  };
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="ml-auto text-right flex gap-3">
                  <Button disabled={disabled} variant="outline" size="lg" onClick={handleDownload}>
                    <Download className="h-4 mr-1" />
                    Download
                  </Button>
                </div>
      </TooltipTrigger>
        <TooltipContent side={side} className={`bg-gray-500`}>
          {disabled ? <p className="text-[10px]">Access Denied</p> : <p className="text-[10px]">Download Document</p>}
        </TooltipContent>
    </Tooltip>
  );
}

export default DownloadButton;
