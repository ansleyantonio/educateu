"use client";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/custom_ui/form";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuths } from "@/hooks/userContext";
import { TextCaseFormat } from "@/utils/textFormate";
import axios from "axios";
import { Camera, Eye, User, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export interface FieldPropsInterface {
  form: any;
  name: string;
  labelName?: string;
  optional?: boolean;
  viewOnly?: boolean;
  removeImage?: boolean;
}

export const UploadProfilePicture = ({
  form,
  name,
  labelName,
  optional = true,
  viewOnly = false,
  removeImage = true,
}: FieldPropsInterface) => {
  const user = useAuths();
  const token = user?.user?.token;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const ImageORFileGetViewPath = async (path: string, type?: string) => {
    setImageLoading(true);
    let url; // Declare the url variable here
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}${path}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: type === "pdf" ? "arraybuffer" : "blob",
      }
    );
    setImageLoading(false);

    if (type === "pdf") {
      const blob = new Blob([response.data], { type: "application/pdf" });
      url = window.URL.createObjectURL(blob);
    } else {
      const blob = new Blob([response.data]);
      url = window.URL.createObjectURL(blob);
    }
    return url;
  };

  useEffect(() => {
    const loadDefaultImage = async () => {
      const rawValue = form.watch(name);

      if (!rawValue || selectedImage) return;

      try {
        const parsed =
          typeof rawValue === "string" ? JSON.parse(rawValue) : rawValue;
        const imagePath = parsed?.path;

        if (imagePath) {
          const imageUrl = await ImageORFileGetViewPath(imagePath);
          setSelectedImage(imageUrl); // Preview URL generated with token
        }
      } catch (error) {
        console.error("Failed to parse or load default photo:", error);
      }
    };

    loadDefaultImage();
  }, [form, name]);

  const profileUploadMutation = useApiMutation({
    method: "POST",
    path: `uploads`,
    dataType: "multipart/form-data",

    onSuccess: async (data: any) => {
      //   console.log("data-----", data);
      if (data?.statusCode === 200) {
        // console.log("data-----success", data);
        // console.log("photo path", `${data?.data?.path}`);
        const responsePath = JSON.parse(data?.data?.path)?.path;
        form.setValue(name, `${data?.data?.path}`);
        const ImagePath = await ImageORFileGetViewPath(responsePath);
        setSelectedImage(ImagePath); // preview uploaded image
        // toast.success("Successfully uploaded profile!");
      } else {
        toast.error("failed to Upload picture .");
      }
    },
    onError: (error: any) => {
      console.log("error", error?.response);
      if (error) {
        showToast("error", error);
      }
    },
  });

  //   const profileUploadMutation = useMutation({
  //     mutationFn: (data: any) =>
  //       axios.post(`${process.env.NEXT_PUBLIC_API_URL}/uploads`, data, {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "multipart/form-data",
  //         },
  //       }),
  //     onSuccess: async (data: any) => {
  //       if (data?.data?.statusCode === 200) {
  //         const responsePath = JSON.parse(data.data.data.path)?.path;
  //         form.setValue(name, data.data.data.path);
  //         const ImagePath = await ImageFileView(responsePath);
  //         console.log("ImagePath------", ImagePath);
  //         setSelectedImage(ImagePath); // preview uploaded image

  //         toast.success("Successfully uploaded profile!");
  //       } else {
  //         toast.error("Upload failed.");
  //       }
  //     },
  //     onError: () => {
  //       toast.error("Failed to upload profile!");
  //     },
  //   });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    profileUploadMutation.mutate(formData);

    // For instant preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPreview(true);
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const error = form.formState.errors?.[name];
        // const isError = !!error;

        return (
          <FormItem className="w-full">
            <div>
              {labelName && (
                <label className="font-semibold text-[14px] leading-[24px] tracking-[0.02em] ">
                  {TextCaseFormat(labelName)}
                  {!optional && <span className="text-[#7E8C9A]">&nbsp;*</span>}
                </label>
              )}
            </div>
            <>
              <FormControl>
                <div className="relative inline-block group">
                  <Avatar className="w-32 h-32 mx-auto">
                    <AvatarImage
                      src={selectedImage || field.value || undefined}
                      alt="Profile picture"
                    />
                    <AvatarFallback className="text-2xl">
                      <User className="w-12 h-12" />
                    </AvatarFallback>
                  </Avatar>

                  {profileUploadMutation.isPending ||
                    (imageLoading && (
                      <div className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </div>
                    ))}

                  {!profileUploadMutation.isPending && selectedImage && (
                    <div className="absolute inset-0 bg-black/70 rounded-full items-center justify-center hidden group-hover:flex">
                      <div className="flex gap-2">
                        <Eye
                          className="w-6 h-6 text-white cursor-pointer"
                          onClick={handlePreview}
                        />
                        {!viewOnly && removeImage && (
                          <Button
                            variant="destructive"
                            size="icon"
                            className="w-6 h-6 rounded-full"
                            onClick={() => {
                              setSelectedImage(null);
                              form.setValue(name, "");
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                  {!viewOnly && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="absolute bottom-0 right-0 w-10 h-10 rounded-full border-4 border-background"
                      onClick={handleCameraClick}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <Dialog open={showPreview} onOpenChange={setShowPreview}>
                    <DialogContent className="max-w-xl p-0 overflow-hidden bg-white">
                      {(selectedImage || form.watch(name)) && (
                        <Image
                          src={selectedImage || form.watch(name)}
                          width={1000}
                          height={1000}
                          alt="Preview"
                          className="w-full h-auto rounded-md"
                        />
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </FormControl>
              <FormMessage />
            </>
          </FormItem>
        );
      }}
    />
  );
};
