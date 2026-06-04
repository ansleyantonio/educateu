/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/custom_ui/form";
import { TextCaseFormat } from "@/utils/textFormate";
import { PlusOutlined } from "@ant-design/icons";
import { Upload, Image } from "antd";
import type { UploadProps, UploadFile } from "antd";
import { useState } from "react";
import { FieldPropsInterface } from "../schemas/IUploadProfile";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import { showToast } from "@/components/common/TostMessage/customTostMessage";

type FileType = Parameters<NonNullable<UploadProps["beforeUpload"]>>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export const UploadImageField = ({
  form,
  name,
  labelName,
  optional = true,
  viewOnly = false,
}: FieldPropsInterface) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>("");

  // Upload mutation
  const uploadPictureMutation = useApiMutation({
    method: "POST",
    dataType: "multipart/form-data",
    path: "uploads",
    onSuccess: (data) => {
      console.log("Upload successful:", data);
      showToast("success", "File uploaded successfully!", { duration: 5000 });
      // Optionally update the form value with the uploaded image URL
      form.setValue(name, data.url); // Assuming 'data.url' contains the image URL
    },
    onError: (error) => {
      console.error("Upload error:", error);
      showToast("error", "File upload failed!", { duration: 5000 });
    },
  });

  // Preview image handler
  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  // const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
  //   setFileList(newFileList);

  // Upload change handler
  const handleChange: UploadProps["onChange"] = ({ fileList }) => {
    setFileList(fileList);
    const file = fileList[0]?.originFileObj;
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      console.log("FileType ", file.type, formData);
      uploadPictureMutation.mutate(formData);
    }
  };

  const uploadButton = (
    <button
      style={{ border: 0, background: "none" }}
      type="button" // Important: set type="button" to prevent form submission
    >
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  return (
    <FormField
      control={form.control}
      name={name}
      render={() => (
        <FormItem>
          {/* Label */}
          {labelName && (
            <label className="text-sm font-semibold">
              {TextCaseFormat(labelName)}
              {!optional && <span className="text-[#7E8C9A]"> *</span>}
            </label>
          )}

          {/* View-only Mode */}
          {viewOnly ? (
            <Image
              src={form.getValues(name)}
              alt="Profile"
              className="object-cover mt-2 w-24 h-24 rounded-full border"
            />
          ) : (
            <>
              {/* Upload Area */}
              <FormControl>
                <Upload
                  listType="picture-circle"
                  fileList={fileList}
                  onChange={handleChange}
                  onPreview={handlePreview}
                  showUploadList={{
                    showRemoveIcon: true,
                    showPreviewIcon: true,
                  }}
                  beforeUpload={() => {
                    // Returning false in beforeUpload prevents Ant Design's default upload behavior.
                    // This allows you to handle the upload entirely within your onChange handler.
                    return false;
                  }}
                >
                  {fileList.length < 1 && uploadButton}
                </Upload>
              </FormControl>
              <FormMessage />
            </>
          )}

          {/* AntD Preview Image Modal */}
          {previewImage && (
            <Image
              src={previewImage}
              alt="Preview"
              wrapperStyle={{ display: "none" }}
              preview={{
                visible: previewOpen,
                onVisibleChange: (visible) => setPreviewOpen(visible),
                afterOpenChange: (visible) => !visible && setPreviewImage(""),
              }}
            />
          )}
        </FormItem>
      )}
    />
  );
};
