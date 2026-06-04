/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { useQueryClient } from "@tanstack/react-query";
import { CircleCheckBig, CirclePlus } from "lucide-react";
import { useState } from "react";

interface lessonProps {
  lesson: any;
  id: string;
  setIsWaiting: React.Dispatch<React.SetStateAction<boolean>>;
  assignedData: Array<any>;
}

const AssignLessonModal = ({
  assignedData,
  setIsWaiting,
  lesson,
  id,
}: lessonProps) => {
  const [open, setOpen] = useState(false);
  const isAssigned = assignedData?.find((item: any) => item?.id === lesson?.id);

  const queryClient = useQueryClient();

  const deleteLessonMutation = useApiMutation({
    method: "POST",
    path: "course-modules/assign-lesson",
    onSuccess: (data: any) => {
      setIsWaiting(false);
      setOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["fetch-assigned-lessons"],
      });
      showToast("success", data);
    },
    onError: (error: any) => {
      if (error?.response) {
        showToast("error", error.response?.data?.message);
      }
    },
  });

  //. Define a submit handler.
  function onSubmit() {
    setIsWaiting(true);
    const body = { moduleId: id, lessonId: lesson?.id };
    deleteLessonMutation.mutate(body);
  }

  return (
    <DialogWrapper
      handleOpen={() => setOpen(true)}
      closer={false}
      open={open}
      triggerContent={
        <ActionButton
          variant="primaryIcon"
          disabled={isAssigned}
          icon={isAssigned ? <CircleCheckBig /> : <CirclePlus />}
          tooltipContent="Assign to Module"
          handleOpen={() => {
            setOpen(true);
          }}
        />
      }
      style="p-4"
    >
      <p> Are you sure you want to assign {lesson?.title} lesson?</p>

      <div className="flex gap-3 justify-end items-center mt-6">
        <ActionButton
          handleOpen={() => setOpen(false)}
          variant="outline"
          buttonContent="Cancel"
        />
        <ActionButton
          handleOpen={() => onSubmit()}
          buttonContent="Assign"
          isPending={deleteLessonMutation?.isPending}
          loadingContent="Assigning..."
        />
      </div>
    </DialogWrapper>
  );
};

export default AssignLessonModal;
