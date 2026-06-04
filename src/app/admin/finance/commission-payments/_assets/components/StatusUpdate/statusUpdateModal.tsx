"use client";
import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { useState } from "react";
import check from "/public/assets/icons/check_ring.svg";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { useQueryClient } from "@tanstack/react-query";
import { Info } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
const CheckStatusModal = ({ data }: { data: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const updateCheckStatusMutation = useApiMutation({
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
    console.log("Cheing id", data);
    //    updateCheckStatusMutation.mutate(body);
  }

  return (
    <DialogWrapper
      open={isOpen}
      handleOpen={() => setIsOpen(!isOpen)}
      triggerContent={
        <ActionButton
          disabled={data?.status === "CHECKED"}
          handleOpen={() => setIsOpen(!isOpen)}
          imageSrc={check}
          variant="icon"
          tooltipContent="Check Status"
        />
      }
      style="min-w-[400px]"
    >
      <div>
        <div className="flex gap-x-3">
          <Info />
          <div className="font-semibold">
            <h3>You’re about to mark {data?.name} as Paid</h3>
            <p className="mt-2 text-xs">This cannot be undone.</p>
          </div>
        </div>

        <div className="flex gap-x-3 justify-end items-center mt-4">
          <ActionButton
            handleOpen={() => setIsOpen(!isOpen)}
            buttonContent="Cancel"
            variant="outline"
          />
          <ActionButton
            handleOpen={() => onSubmit()}
            buttonContent="Confirm"
            isPending={updateCheckStatusMutation.isPending}
          />
        </div>
      </div>
    </DialogWrapper>
  );
};

export default CheckStatusModal;
