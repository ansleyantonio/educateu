/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuths } from "@/hooks/userContext";
import { ImageORFileGetViewPath } from "@/utils/getImageFilePath";
import Image from "next/image";
import { useEffect, useState } from "react";
import Ava from "/public/assets/logo/agent/admin/Avatar.png";

const UserINfo = ({ user }: { user: any }) => {
  const [imagePath, setImagePath] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const users = useAuths();
  const token = users?.user?.token;

  const rawValue = user?.photo;
  let path = "";

  try {
    if (rawValue) {
      const parsed = JSON.parse(rawValue);
      path = parsed?.path || "";
    }
  } catch (error) {
    console.error("Invalid photo JSON:", error);
  }

  useEffect(() => {
    const getImagePath = async () => {
      if (path && token) {
        const imagePath = await ImageORFileGetViewPath(path, token);
        setImagePath(imagePath);
      }
    };
    getImagePath();
  }, [path, token]);

  const handelImageOpen = () => {
    if (!imagePath) return;
    setShowPreview(true);
  };

  return (
    <>
      <div className="flex justify-start items-center gap-x-3">
        <div
          className="w-10 h-10 relative cursor-pointer"
          // onClick={handelImageOpen}
        >
          <Image
            alt="logo"
            src={imagePath || Ava}
            fill
            className="absolute object-fill rounded-full"
          />
        </div>
        <div className="space-y-1">
          <div className="flex gap-x-1 text-sm text-[#101828] font-bold capitalize">
            <p className="font-bold text-black">{user?.firstName}</p>
            <p>{user?.lastName}</p>
          </div>
          <p className="text-[#475467]"> {user?.username}</p>
        </div>
      </div>
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-xl p-0 overflow-hidden bg-white">
          {imagePath && (
            <Image
              src={imagePath || Ava}
              width={1000}
              height={1000}
              alt="Preview"
              className="w-full h-auto rounded-md"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserINfo;
