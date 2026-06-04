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

  const updateCPDCourseMutation = useApiMutation({
    method: "PATCH",
    path: "courses/update",
    onSuccess: (data) => {
      showToast("success", data);
      setIsOpen(!open);

      queryClient.invalidateQueries({
        queryKey: ["fetch-cpd-course-list"],
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
      status: "PUBLISHED",
      courseType: data?.courseType,
      id: data?.id,
    };
    updateCPDCourseMutation.mutate(body);
  }

  return (
    <DialogWrapper
      title="Publish Course"
      open={isOpen}
      handleOpen={() => setIsOpen(!isOpen)}
      triggerContent={
        <ActionButton
          handleOpen={() => setIsOpen(!isOpen)}
          disabled={data?.status === "PUBLISHED" || !editAccess}
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
            isPending={updateCPDCourseMutation?.isPending}
            loadingContent="Publishing..."
          />
        </div>
      </div>
    </DialogWrapper>
  );
}
