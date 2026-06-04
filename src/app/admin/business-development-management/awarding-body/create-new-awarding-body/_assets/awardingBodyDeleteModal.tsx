/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
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
import ActionButton from "@/components/common/button/actionButton";
import { getUserAccess } from "@/utils/permissions/permissions";
import { useMatchedModule } from "@/utils/useMatchedModule/useMatchedModule";
import toast from "react-hot-toast";
import { Trash } from "lucide-react";

const AwardingBodyDeleteModal = ({
  id,
  name,
  disabled = false,
}: {
  id: string;
  name: string;
  disabled?: boolean;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const matchedModule = useMatchedModule();
  const permissions = matchedModule?.modulePermission || [];
  const accessLevel = getUserAccess(permissions);
  const canEdit = accessLevel === "full-access";

  const confirmDelete = (id: string) => {
    return `Deleted item with ${id}`;
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <ActionButton
          variant="icon"
          btnStyle="hover:border-blue-700"
          tooltipContent="Delete Awarding Body"
          icon={<Trash />}
          disabled={!canEdit}
          handleOpen={() => {
            if (!canEdit || disabled) return;
            // setIsModalOpen(true);
            toast.success("Delete functionality is coming soon 🚧");
          }}
        />
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="hidden" />
          <DialogDescription className="hidden" />
          <h3 className="text-lg font-semibold">
            Are you sure you want to delete?
          </h3>
          <p>Name: {name}</p>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => setIsModalOpen(false)} variant="outline">
            Cancel
          </Button>
          <Button
            className="text-xs"
            variant="destructive"
            onClick={() => confirmDelete(id)}
          >
            Yes, Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AwardingBodyDeleteModal;
