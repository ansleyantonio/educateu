/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export function UpdateProfileModal({
  setIsDialogOpen,
  isDialogOpen,
  updateData,
  applicationIid,
}: {
  setIsDialogOpen: (value: boolean) => void;
  isDialogOpen: boolean;
  updateData: any;
  applicationIid: string;
}) {
  // const user = useAuths();
  // const token = user?.user?.token;
  const queryClient = useQueryClient();

  const updateApplicationMutation = useApiMutation({
    safe: false,
    path: `admission/profile/application/${applicationIid}`,
    method: "POST",
    onSuccess: (data) => {
      showToast("success", data);
      setIsDialogOpen(false);
      // saveOrUpdateDataById(ApplicationId, completeStepList);
      queryClient.invalidateQueries({
        queryKey: ["list-of-admission-applications-data"],
      });
    },
  });

  const handelConfirm = () => {
    updateApplicationMutation.mutate(updateData);
  };
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild className="hidden">
        <Button variant="outline" className="capitalize">
          Update Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle className="capitalize">Update profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 "></div>
        <DialogFooter>
          <Button
            onClick={() => setIsDialogOpen(false)}
            className="capitalize"
            size={"sm"}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            onClick={handelConfirm}
            className="capitalize"
            size={"sm"}
            disabled={updateApplicationMutation.isPending}
            type="button"
          >
            {updateApplicationMutation.isPending && (
              <Loader2 className="animate-spin" />
            )}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
