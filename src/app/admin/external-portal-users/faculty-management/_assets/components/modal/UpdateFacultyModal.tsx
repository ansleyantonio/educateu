/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import ActionButton from "@/components/common/button/actionButton";
import UpdateFacultyFrom from "../update/UpdateFacultyFrom";
import fileView from "/public/assets/logo/agent/admin/file-view.svg";
import { Edit } from "lucide-react";
import { useAuths } from "@/hooks/userContext";

export function UpdateFacultyModal({ data }: { data: any }) {
  const [open, setOpen] = useState(false);
  const [editView, setEditView] = useState(true);
  const { editAccess } = useAuths();

  const handleOpen = () => {
    setEditView(true);
    setOpen(!open);
  };

  return (
    <DialogWrapper
      title={`${!editView ? "Update" : "View"} Faculty`}
      open={open}
      handleOpen={handleOpen}
      style="min-w-[65%]"
      triggerContent={
        <ActionButton
          variant="icon"
          imageSrc={fileView}
          tooltipContent="View & Update Faculty"
          handleOpen={handleOpen}
        />
      }
    >
      <div className="mr-6 rounded-md">
        <UpdateFacultyFrom
          data={data}
          editView={editView}
          setEditView={setEditView}
          setOpen={setOpen}
        />

        {editView && (
          <div className="flex gap-x-3 justify-end items-center mt-4">
            <ActionButton
              disabled={!editAccess}
              handleOpen={() => setEditView(false)}
              buttonContent="Edit"
              icon={<Edit />}
              type="button"
            />
          </div>
        )}
      </div>
    </DialogWrapper>
  );
}