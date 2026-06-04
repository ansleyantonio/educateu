"use client";
import { Button } from "@/components/ui/custom_ui/button";
import { useAuths } from "@/hooks/userContext";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { FaAndroid, FaWindows } from "react-icons/fa";
import { FcLinux } from "react-icons/fc";
import DeleteDeviceHistory from "./delete_device";
import { fetchUserDeviceHistory } from "./queryController/fetch_device_history";
import Apple from "/public/assets/logo/dashboard_management/apple.svg";

export type IDeviceHistory = {
  id: number;
  deviceType: string;
  platform: string;
  browser: string;
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  session: string;
  userId: string;
  updatedAt: string;
};

const BrowserDeviceHistory = () => {
  const auth = useAuths();
  const token = auth?.user?.token;
  const userId = auth?.user?.userId;
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deviceID, setDeviceID] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["device-history", { token }],
    queryFn: fetchUserDeviceHistory,
  });

  // console.log("data", data);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="mt-12 mr-6 rounded-md border border-1 border-[#EAEDF0]">
      <DeleteDeviceHistory
        id={deviceID as string}
        userId={userId as string}
        deleteOpen={deleteOpen}
        setDeleteOpen={setDeleteOpen}
        token={token as string}
      />
      <div className="flex justify-between items-center py-4 px-6">
        <h1 className="text-base font-medium leading-6 text-[#000000]">
          Browser And Devices
        </h1>
      </div>
      <hr />
      {/* device */}
      <div className="divide-y">
        {data?.deviceHistory?.map((device: IDeviceHistory) => (
          <div
            key={device.id}
            className="flex justify-between items-center p-4 hover:bg-muted/50"
          >
            <div className="flex gap-3 items-center">
              {/* Device Type Icon Handling */}
              {device.platform.includes("Mac") ? (
                <Image src={Apple} width={20} height={20} alt="Apple icon" />
              ) : device.platform.includes("Linux") ? (
                <FcLinux className="w-5 h-5" />
              ) : device.platform.includes("Windows") ? (
                <FaWindows className="w-5 h-5 text-blue-500" />
              ) : device.platform.includes("Android") ? (
                <FaAndroid className="w-5 h-5 text-green-500" />
              ) : (
                <span className="text-gray-500">🖥️</span>
              )}

              <span className="font-medium">{device.platform}</span>
            </div>

            <div className="flex gap-10 justify-between items-center">
              <div className="w-[120px]">
                <span className="text-sm text-muted-foreground">
                  {device.city !== "Unknown" ? `${device.city}, ` : ""}
                  {device.country}
                </span>
              </div>

              <div className="flex gap-3 justify-between items-center">
                <span className="text-sm text-muted-foreground w-[120px]">
                  {new Date(device.updatedAt).toLocaleString()}
                </span>
                <Button
                  onClick={() => {
                    setDeleteOpen(true);
                    setDeviceID(String(device?.id));
                  }}
                  variant="ghost"
                  size="icon"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrowserDeviceHistory;
