import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import ActionButton from "@/components/common/button/actionButton";
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
import { Loader2 } from "lucide-react";
import { useState } from "react";
import user from "/public/assets/icons/user-sharing.svg";

export function FacultyUserLoginConfirmModal({ id }: { id: string }) {
  // console.log(id);
  const auth = useAuths();

  const [open, setOpen] = useState(false);

  const facultyLogin = useApiMutation({
    method: "POST",
    path: "auth/token",
    onSuccess: (data) => {
      //   const token = data?.data?.accessToken;
      //   const userId = data?.data?.user?.id;

      if (data.statusCode === 200) {
        const userData = {
          token: data?.data?.accessToken,
          userId: data?.data?.user?.id,
        };
        // console.log("lgin....", userData);
        auth?.logout();
        auth?.login(userData, "/faculty");
      }
    },
    onError: (error) => {
      console.error("Login failed", error);
    },
  });

  const handelLogin = (id: string) => {
    facultyLogin.mutate({ id: id });
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form>
        <DialogTrigger asChild>
          <ActionButton
            variant="icon"
            handleOpen={() => setOpen(!open)}
            imageSrc={user}
            tooltipContent="Login as Faculty"
          >
          </ActionButton>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              Are you sure your want to login as faculty?
            </DialogTitle>
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
              onClick={() => handelLogin(id)}
              value="primary"
              type="submit"
            >
              Confirm
              {facultyLogin.isPending && <Loader2 />}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
