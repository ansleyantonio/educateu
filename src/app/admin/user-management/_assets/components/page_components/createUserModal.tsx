"use client";
import { Button } from "@/components/ui/custom_ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuths } from "@/hooks/userContext";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchListOfPortalList } from "../../query_controller/fetchListOfPortalList";
import { fetchhListOfRoleList } from "../../query_controller/fetchhListOfRoleList";
import CreateUserForm from "./CreateUserForm";
import { PlusIcon } from "lucide-react";

export function CreateUser() {
  const token: string | undefined = useAuths()?.user?.token;

  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["fetch-list-of-portal", { token }],
    queryFn: fetchListOfPortalList,
  });

  const { data: roleData, isLoading: isRoleLoading } = useQuery({
    queryKey: ["fetch-list-of-roles", { token }],
    queryFn: fetchhListOfRoleList,
  });

  // console.log("Rle Data in user modal", roleData?.categories?.[0]);

  // console.log("data", data?.roles);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="primary">
          <PlusIcon className="w-5 h-5" color="#fff" />
          Create User
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full h-[85%]  overflow-y-auto">
        <DialogHeader className="hidden">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="mt-3 mr-6 rounded-md">
          <h1 className="py-1 px-6 text-base font-bold leading-6 text-[#000000]">
            Create User
          </h1>

          <div className="p-6">
            <CreateUserForm
              isLoading={isLoading}
              portalList={data}
              roleList={roleData?.categories?.[0]}
              setOpen={setOpen}
            />
          </div>
        </div>

        {/* <DialogFooter>
          <Button type="button">Cancel</Button>
          <Button type="submit">Save changes</Button>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}
