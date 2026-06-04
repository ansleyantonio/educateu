"use client";
import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { useState } from "react";
import invitations from "/public/assets/icons/shear.svg";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { useQueryClient } from "@tanstack/react-query";

/* eslint-disable @typescript-eslint/no-explicit-any */
const ShareLinkModal = ({ data }: { data: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const updateShareMutation = useApiMutation({
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
    console.log("data", data);

    //updateShearMutation.mutate(body);
  }

  return (
    <DialogWrapper
      open={isOpen}
      handleOpen={() => setIsOpen(!isOpen)}
      triggerContent={
        <ActionButton
          handleOpen={() => setIsOpen(!isOpen)}
          imageSrc={invitations}
          variant="icon"
          tooltipContent="Share Link"
        />
      }
      style="min-w-[400px]"
    >
      <div>
        <h3>
          {" "}
          Are you sure to share {data?.name} ?
          <span className="font-serif font-bold text-black text-md">
            {data?.title}
          </span>
        </h3>

        <div className="flex gap-x-3 justify-end items-center mt-4">
          <ActionButton
            handleOpen={() => setIsOpen(!isOpen)}
            buttonContent="No"
            variant="outline"
          />
          <ActionButton
            handleOpen={() => onSubmit()}
            buttonContent="Share"
            isPending={updateShareMutation.isPending}
          />
        </div>
      </div>
    </DialogWrapper>
  );
};

export default ShareLinkModal;
