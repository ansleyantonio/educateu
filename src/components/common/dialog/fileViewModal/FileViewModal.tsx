/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/custom_ui/noClosedialog";
import { X } from "lucide-react";
import Image from "next/image";

const FileViewModal = ({
  viewType,
  viwPath,
  visible,
  setVisible,
}: {
  viewType: string;
  viwPath: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
}) => {
  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent className="p-0 bg-transparent border-none max-w-[90vw] max-h-[90vh]">
        <DialogHeader className="hidden">
          <DialogTitle className="capitalize bg-white">
            <div className="flex justify-between items-center">
              <X
                size={20}
                strokeWidth={3}
                onClick={() => setVisible(false)}
                className="text-red-500 cursor-pointer"
              />
            </div>
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className="relative">
          {viewType === "image" ? (
            <Image
              width={100}
              height={100}
              src={viwPath}
              alt="Preview"
              className="object-contain w-full h-full max-h-[90vh]"
              style={{ maxWidth: "90vw" }}
            />
          ) : (
            // <iframe
            //   src={viwPath}
            //   className="w-full border-none h-[80vh]"
            //   title="Document Preview"
            // />
            <iframe src={viwPath} width="100%" height="600"></iframe>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileViewModal;
