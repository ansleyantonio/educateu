"use client";

import { useForm, FormProvider } from "react-hook-form";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomInputField } from "@/components/common/fields/custom_input_field";
import { Plus, FileText, Trash2, Upload } from "lucide-react";

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "complete";
}

type NoteFormValues = {
  title: string;
  description: string;
};

const NoteDialog = () => {
  const [open, setOpen] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<NoteFormValues>({
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const handleCancel = () => {
    form.reset();
    setUploadingFiles([]);
    setOpen(false);
  };

  const onSubmit = (data: NoteFormValues) => {
    console.log("Note data:", data);
    console.log("Uploaded files:", uploadingFiles);
    form.reset();
    setUploadingFiles([]);
    setOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newUploads: UploadingFile[] = Array.from(files)
        .filter((file) => file.type === "text/csv" && file.size <= 819200)
        .map((file) => ({
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
      const newUploads: UploadingFile[] = Array.from(files)
        .filter((file) => file.type === "text/csv" && file.size <= 819200)
        .map((file) => ({
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

  const handleRemoveFile = (id: string) => {
    setUploadingFiles((files) => files.filter((f) => f.id !== id));
  };

  useEffect(() => {
    if (uploadingFiles.length === 0) return;

    const timers = uploadingFiles.map((file) => {
      if (file.status === "complete") return null;

      return setInterval(() => {
        setUploadingFiles((files) =>
          files.map((f) => {
            if (f.id === file.id) {
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
      }, 300);
    });

    return () => {
      timers.forEach((t) => t && clearInterval(t));
    };
  }, [uploadingFiles]);

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="primary">
        <Plus className="mr-2" size={16} />
        Add Note
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:min-w-[650px]" forceMount>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>
              Enter note details and upload related files.
            </DialogDescription>
          </DialogHeader>

          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <CustomInputField.Text
                fControl={form.control}
                name="title"
                labelName="Note Title"
                optional={false}
              />

              <CustomInputField.TextArea
                fControl={form.control}
                name="description"
                labelName="Description"
                optional={false}
              />

              {/* File Upload Section */}
              <div>
                <label className="text-sm font-medium mb-2 block">Attachments</label>
                <div
                  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-gray-400 transition-all"
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <Upload className="w-8 h-8 text-gray-500 mb-2" />
                  <p className="text-sm text-gray-700 font-medium text-center">
                    Drag & Drop or Choose file to upload
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground text-center">
                  Only CSV allowed. Max size of 800K
                </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileChange}
                    multiple={false}
                  />
                </div>
              </div>

              {/* Uploading Files */}
              <div className="space-y-3">
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
                          className="h-3 bg-blue-500 transition-all duration-300"
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

              {/* Footer */}
              <DialogFooter className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NoteDialog;