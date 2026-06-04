/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import archive from "/public/assets/icons/archive.svg";
import { useAuths } from "@/hooks/userContext";

interface modalProps {
  data: any;
}

export function ArchiveCourseModal({ data }: modalProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const { editAccess } = useAuths();
  const updateAdvanceCourseMutation = useApiMutation({
    method: "PATCH",
    path: "courses/update",
    onSuccess: (data) => {
      showToast("success", data);
      setIsOpen(!open);
      queryClient.invalidateQueries({
        queryKey: ["fetch-degree-course-list"],
      });
      queryClient.invalidateQueries({
        queryKey: ["fetch-diploma-course-list"],
      });
    },
    onError: (error: any) => {
      if (error?.response) {
        showToast("error", error.response?.data?.message);
      }
    },
  });

  //. Define a submit handler.
  function onSubmit() {
    const body = {
      status: "ARCHIVED",
      courseType: data?.courseType,
      id: data?.id,
      ...(data?.courseType === "DEGREE_COURSE" && {
        degreeType: data?.degreeType,
      }),
      ...(data?.courseType === "DIPLOMA_COURSE" && {
        diplomaType: data?.diplomaType,
      }),
    };
    updateAdvanceCourseMutation.mutate(body);
  }

  return (
    <DialogWrapper
      title="Archive Course"
      open={isOpen}
      handleOpen={() => setIsOpen(!isOpen)}
      triggerContent={
        <ActionButton
          handleOpen={() => setIsOpen(!isOpen)}
          disabled={data?.status === "ARCHIVED" || !editAccess}
          imageSrc={archive}
          variant="icon"
          tooltipContent="Archive"
        />
      }
    >
      <h1>
        {" "}
        Are you sure you want to archive
        <span className="font-serif font-bold text-black text-md">
          {data?.title}
        </span>
      </h1>

      <div className="flex gap-x-3 justify-end items-center mt-4">
        <ActionButton
          handleOpen={() => setIsOpen(!isOpen)}
          buttonContent="Cancel"
          variant="outline"
        />
        <ActionButton
          handleOpen={() => onSubmit()}
          buttonContent="Archive"
          isPending={updateAdvanceCourseMutation.isPending}
          loadingContent="Archiving..."
        />
      </div>
    </DialogWrapper>
  );
}
