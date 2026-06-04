/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import UserName from "@/app/admin/user-management/_assets/components/page_components/Form/user_name";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { TemporaryListData } from "./temporaryList/temporaryDataList";
import { useQuery } from "@tanstack/react-query";
import { TemporaryAccessPermission } from "../../../controller/assign_system_permission";
import { useAuths } from "@/hooks/userContext";
import { Loader2 } from "lucide-react";

export function TemporaryAccessListBySingleUser({ user }: any) {
  const auth = useAuths();
  const token = auth?.user?.token;

  const [open, setOpen] = useState(false);
  const [activeUser, setActiveUser] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["fetch-temporary-access", activeUser, token],
    queryFn: TemporaryAccessPermission,
    enabled: !!activeUser,
  });

  return (
    <>
      <div
        className="cursor-pointer w-fit"
        onClick={() => {
          setOpen(true);
          setActiveUser(user?.id);
        }}
      >
        <UserName user={user} />
      </div>
      {activeUser && (
        <Dialog onOpenChange={setOpen} open={open}>
          <DialogContent className="overflow-hidden overflow-y-auto min-w-[95vw] max-h-[70vh] xl:min-w-[70vw] 2xl:min-w-[55vw]">
            <DialogHeader>
              <DialogTitle>Temporary Access List</DialogTitle>
              <DialogDescription className="hidden"></DialogDescription>
            </DialogHeader>
            <div className="w-full">
              {isLoading ? (
                <div className="flex justify-center items-center h-40 rounded-lg shadow-md bg-muted">
                  <Loader2 size={75} strokeWidth={2} className="animate-spin" />
                </div>
              ) : (
                <TemporaryListData user={data} setOpen={setOpen} />
              )}
            </div>
            <DialogFooter className="hidden">
              <Button type="submit"></Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
