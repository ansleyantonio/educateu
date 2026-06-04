import { Button } from "@/components/ui/custom_ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import deleteDeviceController from "./queryController/deleteDeviceController";

interface IDeviceInfo {
  id: string;
  token: string;
  userId: string;
  deviceIP?: string;
}

interface IDeleteDevice extends IDeviceInfo {
  deleteOpen: boolean;
  setDeleteOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DeleteDeviceHistory = ({
  id,
  token,
  userId,
  deviceIP = "",
  deleteOpen,
  setDeleteOpen,
}: IDeleteDevice) => {
  // console.log(token, userId, id);
  const deviceInfo = {
    id,
    token,
    userId,
    deviceIP,
  };

  const deleteMutation = useMutation({
    mutationFn: async (deviceInfo: IDeviceInfo) =>
      deleteDeviceController(deviceInfo),
    onSuccess: (data) => {
      if (data.status === 200 || data.status === 201) {
        setDeleteOpen(false);
        return toast.success(data.message);
      }
      toast.error(data.message);
    },
    onError: (error) => {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete device");
    },
  });

  return (
    <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
      <DialogContent>
        <DialogHeader className="hidden">
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <div>
          <h1 className="p-4 mb-8 text-xl font-extrabold">
            Are you want to delete this device?
          </h1>
          <div className="flex gap-5 justify-end items-center">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate(deviceInfo)}
            >
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDeviceHistory;
