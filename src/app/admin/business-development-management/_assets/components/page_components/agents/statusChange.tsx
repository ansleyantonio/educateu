/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useAuths } from "@/hooks/userContext";
import { getUserAccess } from "@/utils/permissions/permissions";
import { useMatchedModule } from "@/utils/useMatchedModule/useMatchedModule";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";

const AgentStatusChangeModal = ({
  id,
  status,
  disabled = false,
}: {
  id: string;
  status: string;
  disabled?: boolean;
}) => {
  const auth = useAuths();
  const token = auth?.user?.token;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const queryClient = useQueryClient();
  const matchedModule = useMatchedModule();
  const permissions = matchedModule?.modulePermission || [];
  const accessLevel = getUserAccess(permissions);
  const canEdit = accessLevel === "full-access";

  const updateUserStatusMutation = useMutation({
    mutationFn: (updateStatus: any) => {
      return axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/business-development-management/${updateStatus?.id}`,
        {
          userStatus: updateStatus?.userStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    },
    onSuccess: () => {
      toast.success("Successfully changed user status!");
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["fetch-list-of-agents"] });
      queryClient.invalidateQueries({ queryKey: ["fetch-single-agent"] });
    },
    onError: (error: any) => {
      console.log("error", error?.response);
      if (error) {
        showToast("error", error);
      }
    },
  });

  const confirmStatusChange = (Id: string, Status: string) => {
    const updateStatus = {
      userStatus: Status,
      id: Id,
    };
    updateUserStatusMutation.mutate(updateStatus);
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <div
          className={`w-fit min-w-[95px] inline-block ${
            !canEdit || disabled
              ? "pointer-events-none opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          <Button
            onClick={() => {
              if (!canEdit || disabled) return;
              setIsModalOpen(true);
            }}
            className={`!text-xs transition ${
              status === "ACTIVE" ? "!text-red-500" : "text-green-500"
            } ${canEdit ? "hover:bg-gray-100" : ""}`}
            size="lg"
            variant="outline"
          >
            {status === "ACTIVE" ? "DEACTIVATE" : "ACTIVATE"}
          </Button>
        </div>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="hidden" />
          <DialogDescription className="hidden" />
          <h3 className="text-lg font-semibold">Are you sure?</h3>
          <p className="text-sm text-muted-foreground">
            {status === "ACTIVE"
              ? "Do you want to deactivate this user?"
              : "Do you want to activate this user?"}
          </p>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => setIsModalOpen(false)} variant="outline">
            Cancel
          </Button>
          <Button
            className="!text-xs"
            variant={status === "ACTIVE" ? "destructive" : "success"}
            onClick={() =>
              confirmStatusChange(
                id,
                status === "ACTIVE" ? "DEACTIVATED" : "ACTIVE"
              )
            }
          >
            Yes, Change
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AgentStatusChangeModal;
