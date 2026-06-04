/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import publish from "/public/assets/icons/publish.svg";

import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuths } from "@/hooks/userContext";

interface modalProps {
  data: any;
}

export function PublishCourseModal({ data }: modalProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const {editAccess} = useAuths()
  const updateAdvanceCourseMutation = useApiMutation({
    method: "PATCH",
    path: "courses/update",
    onSuccess: (data) => {
      showToast("success", data);
      queryClient.invalidateQueries({
        queryKey: ["fetch-degree-course-list"],
      });
      queryClient.invalidateQueries({
        queryKey: ["fetch-diploma-course-list"],
      });
      setIsOpen(!open);
    },
    onError: (error: any) => {
      showToast("error", error);
      setIsOpen(!open);
    },
  });

  //. Define a submit handler.
  function onSubmit() {
    const body = {
      status: "PUBLISHED",
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
      title="Publish Course"
      open={isOpen}
      handleOpen={() => setIsOpen(!isOpen)}
      triggerContent={
        <ActionButton
          disabled={data?.status === "PUBLISHED" || !editAccess}
          handleOpen={() => setIsOpen(!isOpen)}
          imageSrc={publish}
          variant="icon"
          tooltipContent="Publish"
        />
      }
    >
      <div>
        <h3>
          {" "}
          Are you sure you want to publish{" "}
          <span className="font-serif font-bold text-black text-md">
            {data?.title}
          </span>
        </h3>

        <div className="flex gap-x-3 justify-end items-center mt-4">
          <ActionButton
            handleOpen={() => setIsOpen(!isOpen)}
            buttonContent="Cancel"
            variant="outline"
          />
          <ActionButton
            handleOpen={() => onSubmit()}
            buttonContent="Publish"
            isPending={updateAdvanceCourseMutation.isPending}
            loadingContent="Publishing..."
          />
        </div>
      </div>
    </DialogWrapper>
  );
}
