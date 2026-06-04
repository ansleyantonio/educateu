/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/custom_ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuths } from "@/hooks/userContext";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { sessionTerminationController } from "../../query_controller/sessionTermination";
import { capitalizeName } from "@/utils/capitalizeName/capitalizeName";
// import { useQuery } from "@tanstack/react-query";

interface UserInfo {
  id: string;
  firstName?: string;
  lastName?: string;
}
interface Props {
  user: any;
  isOpen: boolean;
  setOpenSessionTerminationModal: (open: boolean) => void;
  userInfo?: UserInfo[];
}

interface Data {
  id: string;
  token: string;
}

const SessionTerminationModal = ({
  user,
  isOpen,
  setOpenSessionTerminationModal,
  userInfo
}: Props) => {
  const auth = useAuths();
  const token = auth?.user?.token;

  interface Data {
    id: string;
    token: string;
  }

  // Mutation for session termination
  const sesTerminationMutation = useMutation({
    mutationFn: (data: Data) => sessionTerminationController(data),
    onSuccess: (data) => {
      toast.success(data?.message);
      // console.log("Success:", data);
      setOpenSessionTerminationModal(false);
    },
    onError: (error) => {
      toast.error(error?.message);
      // setOpenSessionTerminationModal(false);
    },
  });

  // Handle form submission
  const handleSubmit = async (id: string) => {
    const data = {
      id,
      token: token ?? "",
    };
    await sesTerminationMutation.mutateAsync(data);
  };

  console.log("SESSION",userInfo);
  
  return (
    <Dialog open={isOpen} onOpenChange={setOpenSessionTerminationModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Session Termination
            {userInfo && userInfo.length > 0 && (
              <>
                {" "}
                for {capitalizeName(userInfo[0].firstName)}{" "}
                {capitalizeName(userInfo[0].lastName)}
              </>
            )}
          </DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <div></div>

        <DialogFooter className="!justify-center mt-5 !items-center">
          <Button onClick={() => handleSubmit(user.id)} variant="primary">
            Force Log Out from All Devices
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SessionTerminationModal;
