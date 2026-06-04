"use client";
import { useState,useEffect  } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuths } from "@/hooks/userContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { updateGroupName } from "../../query_controller/updateGroupName";
import toast from "react-hot-toast";
import ActionButton from "@/components/common/button/actionButton";

type UpdateCommissionDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  commissionGroupId: string;
  commissionGroupName: string;
  refetchGroups: () => void;
};

export const UpdateCommissionDialogName = ({
  isOpen,
  onClose,
  commissionGroupId,
  commissionGroupName,
  refetchGroups
}: UpdateCommissionDialogProps) => {
  const user = useAuths();
  const token = user?.user?.token;

  const [groupName, setGroupName] = useState(commissionGroupName);

  const { mutate, isPending } = useMutation({
    mutationFn: async () =>
      await updateGroupName({
        token: token!,
        groupId: commissionGroupId,
        newName: groupName,
      }),
    onSuccess: () => {
      toast.success(" Template created successfully");
      refetchGroups();
      onClose();
    },
    onError: (error: unknown) => {
        if (error instanceof Error) {
          toast.error(error.message || "Failed to update group name");
        } else {
          toast.error("Failed to update group name");
        }
    }
  });

  useEffect(() => {
    setGroupName(commissionGroupName);
  }, [commissionGroupName, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <h1 className="font-bold tracking-wide leading-6 text-[24px] text-[#192128]">
          Update Group {commissionGroupName} Name
        </h1>
        <Textarea
          placeholder="Update The Group Name"
          className="p-[18px]"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <div className="flex justify-end gap-3 pt-4">
          <ActionButton
            btnStyle="border border-[#CFD6DD] text-[#4A545E] bg-white rounded-md p-2 text-sm shadow-sm hover:bg-gray-50"
            handleOpen={() => {
              onClose();
            }}
            buttonContent="Cancel"
            disabled={isPending}
          />
          <ActionButton
            btnStyle="bg-[#013E5B] text-white p-2 rounded-md flex items-center justify-center"
            handleOpen={() => mutate()}
            disabled={isPending}
            loadingContent="Updating..."
            isPending={isPending}
            buttonContent="Update"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
