/* eslint-disable no-unused-vars */
"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuths } from "@/hooks/userContext";
import { getUserAccess } from "@/utils/permissions/permissions";
import { useMatchedModule } from "@/utils/useMatchedModule/useMatchedModule";
import { Plus } from "lucide-react";
import { useState } from "react";
import AddNoteForm from "./addNoteForm";

interface AddNoteProps {
  setTabValue: (value: string) => void;
}
const AddNote = ({ setTabValue }: AddNoteProps) => {
  const auth = useAuths();
  const token = auth?.user?.token;

  const [isOpenDialog, setIsOpenDialog] = useState(false);

  const matchedModule = useMatchedModule();
  const permissions = matchedModule?.modulePermission ?? [];

  const hasPostAndDeletePermission =
    getUserAccess(permissions) === "full-access";

  return (
    <>
      <Button
        onClick={() => setIsOpenDialog(true)}
        variant="primary"
        disabled={!hasPostAndDeletePermission}
      >
        <Plus className="" size={16} /> Add Note
      </Button>
      <Dialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
        <DialogContent className="sm:min-w-[650px]">
          <DialogHeader>
            <DialogTitle>Add Notes</DialogTitle>
            <DialogDescription />
          </DialogHeader>

          {token && (
            <AddNoteForm
              setTabValue={setTabValue}
              setIsOpenDialog={setIsOpenDialog}
              token={token}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddNote;
