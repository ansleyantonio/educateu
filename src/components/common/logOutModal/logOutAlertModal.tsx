"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuths } from "@/hooks/userContext";
import Image from "next/image";
import { useState } from "react";
import logout from "/public/assets/logo/agent/logout-02.svg";

export function LogOutAlertModal({
  logoutPath,
  navigation = false,
  pathName,
}: {
  logoutPath: string;
  navigation?: boolean;
  pathName?: string;
}) {
  const [open, setOpen] = useState(false);
  const auth = useAuths();
  const handelLogOut = () => {
    auth?.logout(logoutPath);
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div
          // href="/login"
          className={`flex items-center w-full justify-start cursor-pointer gap-2 xl:gap-3 p-2 xl:p-3  rounded-md  transition-all hover:bg-[#002F45]`}
        >
          <div className="flex justify-start items-center gap-x-2 w-full">
            {!navigation ? (
              <div className="w-[18px] h-[18px] xl:w-6 xl:h-6 relative z-auto">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Image
                        src={logout}
                        alt="logout"
                        className="absolute object-fill text-white w-full h-full"
                        fill
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Logout</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ) : (
              <div className="w-[18px] h-[18px] xl:w-6 xl:h-6 relative z-auto">
                <Image
                  src={logout}
                  alt="logout"
                  className="absolute object-fill text-white w-full h-full"
                  fill
                />
              </div>
            )}
            {navigation && (
              <span className="mt-1 text-white text-[12px] capitalize">
                Logout
              </span>
            )}
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            You will need to log in again to access your account.
          </DialogDescription>
        </DialogHeader>
        <div className="hidden"></div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="primary"
              className="border-none outline-none capitalize"
            >
              Close
            </Button>
          </DialogClose>
          <Button
            onClick={handelLogOut}
            variant="destructive"
            className="capitalize"
            type="button"
          >
            logout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
