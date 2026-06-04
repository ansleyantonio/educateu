import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuths } from "@/hooks/userContext";
import Image from "next/image";
import { useState } from "react";
import userProfile from "/public/assets/icons/user-sharing.svg";

const AgentUserLoginConfirmationModal = ({ id,canEdit, firstName, lastName }: { id: string,canEdit: boolean;firstName: string;lastName: string }) => {
  const auth = useAuths();

  const [open, setOpen] = useState(false);

  const { mutate: loginAsAgent } = useApiMutation({
    method: "POST",
    path: "auth/token",
    onSuccess: (data) => {
      const token = data?.data?.accessToken;
      const userId = data?.data?.user?.id;

      if (token && userId) {
        localStorage.setItem(
          "force-agent-login",
          JSON.stringify({ token, userId })
        );

        window.open("/agent", "_blank");

        auth?.logout();
      } else {
        console.log("Error In Log Out");
      }
    },
    onError: (error) => {
      console.error("Login failed", error);
    },
  });

  const handleAgentLogin = (id: string) => {
    // console.log("Handle Agent Log In", id)
    loginAsAgent({ id });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="lg"
            disabled={!canEdit}
            className={`${
              canEdit
                ? "hover:border-blue-700 border-[#E1E5E7]"
                : "cursor-not-allowed opacity-50"
            }`}
          >
            <Image src={userProfile} alt="User" width={18} height={18} />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Are you sure you want to login as agent <span className="font-semibold">{firstName} {lastName}</span>?</DialogTitle>
            <DialogDescription className="hidden">
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="hidden">
            <h2>sss</h2>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              {/* <Button variant="outline">Cancel</Button> */}
            </DialogClose>
            <Button
              onClick={() => handleAgentLogin(id)}
              value="primary"
              type="submit"
            >
              Confirm
              {/* {loginAsAgent.isPending && <Loader2 />} */}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default AgentUserLoginConfirmationModal;
