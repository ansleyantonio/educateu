"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import RoleForm from "./role_form";
import {
  roleFormSchema,
  RoleFormValues,
} from "../../interface/create_role_schema";
import { useQuery } from "@tanstack/react-query";
import { fetchPortalsModule } from "../../controller/fetchData";
import { useAuths } from "@/hooks/userContext";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const CreateRoleModal = () => {
  const [isCreateModal, setIsCreateModal] = useState(false);
  const user = useAuths();
  const token = user?.user?.token;

  const { data, isLoading } = useQuery({
    queryKey: ["fetch-list-of-categories", { token }],
    queryFn: fetchPortalsModule,
  });

  // console.log("Fetching data", data.data.categories);

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      roleName: "",
      categories: [],
      modulePermissions: [],
    },
  });

  if (isLoading)
    return (
      <div>
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );

  return (
    <>
      <Button
        onClick={() => {
          setIsCreateModal(true);
          form.reset();
        }}
        variant="primary"
      >
        Create Role
      </Button>

      <Dialog open={isCreateModal} onOpenChange={setIsCreateModal}>
        <DialogContent className="overflow-y-auto max-w-[550px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Create Role</DialogTitle>
          </DialogHeader>
          {data && token && (
            <RoleForm
              setIsCreateModal={setIsCreateModal}
              form={form}
              token={token}
              CategoriesData={data.data.categories}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateRoleModal;
