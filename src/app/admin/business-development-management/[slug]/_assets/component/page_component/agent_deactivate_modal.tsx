import { Button } from "@/components/ui/custom_ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { DeactivateAgentById } from "../../controller/deactivateAgent";
import toast from "react-hot-toast";
import { DeactivatedType } from "../../type/deactivated_type";

interface AgentDeactivateModalProps {
  open: boolean;
  agentName: string;
  agentId: string;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AgentDeactivateModal = ({
  open,
  agentName,
  agentId,
  setOpen,
}: AgentDeactivateModalProps) => {
  const deactivateAgent = useMutation({
    mutationFn: async (data: DeactivatedType) => {
      return await DeactivateAgentById(data);
    },
    onSuccess: ({ status }) => {
      if (status === 200) {
        toast.success("Successfully deactivated agent!");
        setOpen(false);
      }
    },
    onError: (error) => {
      console.log("Error deactivating agent", error);
      toast.error("Error deactivating agent");
    },
  });

  const handleDeactivate = () => {
    const data: DeactivatedType = {
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0YWVhY2M3OC0yZWE3LTQxMjUtOGZmOS01YzVmYzQ4NmRmMDUiLCJpYXQiOjE3Mzg2NDY4MjEsImV4cCI6MTczOTk0MjgyMX0.5EX-MX-L-PQbxDOtMgACglTKQ4n0eFT7Ew1vOjemnNM" as string,
      agentId,
      userStatus: "DEACTIVATED",
    };
    deactivateAgent.mutate(data);
    // setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="my-3 text-lg text-center text-red-500">
            Are you want to deactivate {agentName}?
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 justify-end">
          <Button variant="outline">Cancel</Button>
          <Button onClick={() => handleDeactivate()}>Deactivate</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgentDeactivateModal;
