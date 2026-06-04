"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useAuths } from "@/hooks/userContext";
import AddNoteForm from "./addNoteForm";

const AddNote = () => {
  const auth = useAuths();
  const token = auth?.user?.token;

  const [isOpenDialog, setIsOpenDialog] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpenDialog(true)} variant="primary">
        <Plus className="mr-2" size={16} /> Add Note
      </Button>
      <Dialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
        <DialogContent className="sm:min-w-[650px]">
          <DialogHeader>
            <DialogTitle>Add Notes</DialogTitle>
            <DialogDescription />
          </DialogHeader>

          {token && (
            <AddNoteForm setIsOpenDialog={setIsOpenDialog} token={token} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddNote;
