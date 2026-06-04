/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { useAuths } from "@/hooks/userContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { DeleteTemporaryAccess } from "../../../../controller/assign_system_permission";
import { useMatchedModule } from "@/utils/useMatchedModule/useMatchedModule";
import { getUserAccess } from "@/utils/permissions/permissions";

const DeleteTemporaryModal = ({
  id,
  closeModal,
}: {
  id: string;
  closeModal: () => void;
}) => {
  const auth = useAuths();
  const token = auth?.user?.token;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const matchedModule = useMatchedModule();
  const permissions = matchedModule?.modulePermission || [];

  const hasPostAndDeletePermission =
    getUserAccess(permissions) === "full-access";

  // updateUserStatusMutation
  const deleteTemporaryModuleMutation = useMutation({
    mutationFn: (id: string) => DeleteTemporaryAccess({ id, token }),

    onSuccess: (data) => {
      // Update the query cache
      queryClient.invalidateQueries({ queryKey: ["fetch-temporary-access"] });
      queryClient.invalidateQueries({
        queryKey: ["fetch-temporary-access-list"],
      });

      toast.success(data?.message || "Successfully delete!");
      closeModal();
      // confirm modal close
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message);
    },
  });
  const confirmStatusChange = (Id: string) => {
    deleteTemporaryModuleMutation.mutate(Id);
    setIsModalOpen(false);
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button
          // className={`!text-red-500 `}
          className={`!text-red-500 ${
            !hasPostAndDeletePermission ? "opacity-50 cursor-not-allowed" : ""
          }`}
          size="sm"
          variant={"outline"}
          disabled={!hasPostAndDeletePermission}
        >
          Revoke
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="hidden"></DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
          <h3 className="text-lg font-semibold">Are you sure?</h3>
          <p className="text-sm text-muted-foreground">
            Do you want to revoke this Temporary Access?
          </p>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => setIsModalOpen(false)} variant="outline">
            Cancel
          </Button>
          <Button
            variant={"destructive"}
            onClick={() => confirmStatusChange(id)}
          >
            Yes, revoke
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteTemporaryModal;
