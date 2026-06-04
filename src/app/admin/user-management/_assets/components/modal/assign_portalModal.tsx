"use client";
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
import { fetchAssignedPortal } from "../../query_controller/fetchAssignedPortal";
import { PortalList } from "./portal_list";

interface Props {
  id: string;
  category: string;
  isOpen: boolean;
  closeModal: () => void;
}

export function AssignPortalModal({ id, category, isOpen, closeModal }: Props) {
  const auth = useAuths();
  const token = auth?.user?.token;

  const { data, isLoading } = useQuery({
    queryKey: ["assign-portal", { id, token }],
    queryFn: fetchAssignedPortal,
    enabled: !!isOpen && !!id && !!token,
  });

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent>
        <DialogHeader className="hidden">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <PortalList
          id={id}
          closeModal={closeModal}
          data={data}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
