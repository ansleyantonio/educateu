/* eslint-disable @typescript-eslint/no-explicit-any */
import { Upload } from "lucide-react";

const FileUploadFromLocal = ({
  handleDragOver,
  handleDrop,
  triggerFileInput,
  upload,
  fieldName,
}: any) => {
  return (
    <>
      <div>
        <div
          className={`border-2 border-dashed rounded-lg px-6 py-3 ${
            upload.files?.length > 0 ? "border-green-500" : "border-gray-200"
          }`}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, fieldName)}
        >
          <div className="flex  gap-2 items-center">
            <Upload className="w-5 h-5 text-gray-400" />
            <div className="text-sm text-center">
              <p>
                Drag & Drop or{" "}
                <button
                  type="button"
                  onClick={() => triggerFileInput(fieldName)}
                  className="text-blue-500 hover:text-blue-700 font-medium"
                >
                  Choose files
                </button>{" "}
                to upload
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <p className="mt-1 text-xs text-gray-500">
            Files Supported: PDF, Image, Scan
          </p>
          <p className="mt-1 text-xs text-gray-500">Maximum size: 5MB</p>
        </div>
      </div>
    </>
  );
};

export default FileUploadFromLocal;
