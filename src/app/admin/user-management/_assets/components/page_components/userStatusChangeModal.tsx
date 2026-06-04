/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { CreateUsers } from "../../interface/CreateUserSchema";

interface UserInfo {
  id: string;
  firstName?: string;
  lastName?: string;
}

const UserStatusChangeModal = ({
  id,
  status,
  refetch,
  userInfo,
}: {
  id: string;
  status: string;
  refetch: () => void;
  userInfo?: CreateUsers;
}) => {
  const auth = useAuths();
  const token = auth?.user?.token;
  const [isModalOpen, setIsModalOpen] = useState(false);

  // updateUserStatusMutation
  const updateUserStatusMutation = useMutation({
    mutationFn: (updateStatus: any) => {
      return axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/user-management/user/users/${updateStatus?.id}`,
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
      //
      toast.success("Successfully User status change!");
      // Update the query cache
      refetch();
      //   User?.logout();
      setIsModalOpen(false);
      // queryClient.invalidateQueries({ queryKey: ["fetch-list-of-users"] });
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
    console.log("ss", updateStatus);
    updateUserStatusMutation.mutate(updateStatus);
    setIsModalOpen(true);
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button
          className={` w-[90px]
                            ${
                              status === "ACTIVE"
                                ? "!text-red-500"
                                : "text-green-500"
                            }`}
          size="sm"
          variant={status === "ACTIVE" ? "outline" : "outline"}
        >
          {status === "ACTIVE" ? "DEACTIVATE" : "ACTIVATE"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="hidden"></DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
          <h3 className="text-lg font-semibold">Are you sure?</h3>
          <p className="text-sm text-muted-foreground">
            {status === "ACTIVE"
              ? `Do you want to deactivate ${
                  userInfo?.firstName || "this user"
                } ${userInfo?.lastName || ""}?`
              : `Do you want to activate ${
                  userInfo?.firstName || "this user"
                } ${userInfo?.lastName || ""}?`}
          </p>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => setIsModalOpen(false)} variant="outline">
            Cancel
          </Button>
          <Button
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

export default UserStatusChangeModal;
