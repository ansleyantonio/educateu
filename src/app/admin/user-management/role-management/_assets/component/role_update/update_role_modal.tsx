/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/custom_ui/button";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchActiveRoleModuleData } from "../../controller/fetchData";
import RoleManagement from "./role-update";
import { useForm } from "react-hook-form";
import { RoleFormValues } from "../../interface/update_role_type";

interface RoleData {
  id: string;
  name: string;
  portalCategoryId: string;
  portalCategory: { id: string; name: string };
  userCount: number;
  roleModules: any[];
}

interface UpdateRoleModalProps {
  item: any;
  token: string;
}

const UpdateRoleModal = ({ item, token }: UpdateRoleModalProps) => {
  const [isActiveModal, setIsActiveModal] = useState(false);
  const [activeRole, setActiveRole] = useState<RoleData | null>(null);

  const activeRoleData = activeRole
    ? {
        roleId: activeRole.id,
        categoryId: activeRole.portalCategoryId,
      }
    : null;

  // Ensure `useQuery` is always called at the top level
  const { data, isLoading } = useQuery({
    queryKey: ["fetchActiveRoleModuleData", { activeRoleData, token }],
    queryFn: fetchActiveRoleModuleData,
    enabled: !!activeRoleData,
  });

  const form = useForm<RoleFormValues>({
    defaultValues: {
      roleName: activeRole?.name || "",
      modules: {},
    },
  });

  // console.log("activeRole", form?.formState?.errors);

  return (
    <>
      <Button
        size="sm"
        variant="primary"
        onClick={() => {
          setActiveRole(item);
          setIsActiveModal(true);
        }}
      >
        Update Role
      </Button>

      <Dialog
        open={isActiveModal}
        onOpenChange={(value) => setIsActiveModal(value)}
      >
        {/* DialogContent */}
        <DialogContent className="overflow-auto max-w-[500px] max-h-[80vh]">
          <DialogHeader className="hidden">
            <DialogTitle></DialogTitle>
          </DialogHeader>
          {activeRole && (
            <RoleManagement
              form={form}
              token={token}
              data={data}
              activeRole={activeRole}
              isLoading={isLoading}
              isActiveModal={isActiveModal}
              setIsActiveModal={setIsActiveModal}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UpdateRoleModal;
