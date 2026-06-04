"use client";
import { useState } from "react";
import CreateLessonForm from "../create/CreateLessonForm";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import ActionButton from "@/components/common/button/actionButton";
import { useAuths } from "@/hooks/userContext";
import { ILessonForm } from "../../schemas/lessonSchema";

export function CreateLessonModal() {
  const [open, setOpen] = useState(false);
  const {editAccess} = useAuths()
  const [persistedFormData, setPersistedFormData] = useState<ILessonForm | undefined>();

  const handleFormDataChange = (formData: ILessonForm) => {
    setPersistedFormData(formData);
  };

  const handleFormReset = () => {
    setPersistedFormData(undefined);
  };

  const handleModalClose = (open: boolean) => {
    // Don't clear persisted data when modal closes
    setOpen(open);
  };
  return (
    <DialogWrapper
      title="Create Lesson"
      open={open}
      handleOpen={() => setOpen(!open)}
      triggerContent={
        <ActionButton
          buttonContent="Create Lesson"
          handleOpen={() => setOpen(!open)}
          disabled={!editAccess}
        />
      }
      style="min-w-[65%]"
    >
      <div>
        <CreateLessonForm
          setOpen={setOpen}
          persistedFormData={persistedFormData}
          onFormDataChange={handleFormDataChange}
          onFormReset={handleFormReset}
        />
      </div>
    </DialogWrapper>
  );
}
