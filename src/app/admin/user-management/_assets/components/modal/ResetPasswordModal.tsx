/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { CusPassword } from "@/components/common/fields/cusPasswordField";
import passwordValidation from "@/components/schema/passwordValidation";
import { Button } from "@/components/ui/custom_ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useAuths } from "@/hooks/userContext";
import { capitalizeName } from "@/utils/capitalizeName/capitalizeName";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { resetPasswordController } from "../../query_controller/resetPasswordController";

interface UserInfo {
  id: string;
  firstName?: string;
  lastName?: string;
}

const FormSchema = z
  .object({
    password: passwordValidation,
    confirmPassword: z.string().min(2, {
      message: "confirmPassword is required.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"], // Error will be shown under confirmPassword field
  });
// import { useQuery } from "@tanstack/react-query";
interface Props {
  id: string;
  isOpen: boolean;
  closeModal: () => void;
  userInfo?: UserInfo[];
}
const ResetPasswordModal = ({ id, isOpen, closeModal, userInfo }: Props) => {
  const auth = useAuths();
  const token = auth?.user?.token;
  interface Data {
    id: string;
    token: string;
    newPassword: string;
  }

  // Mutation for session termination
  const resetPasswordMutation = useMutation({
    mutationFn: (data: Data) => resetPasswordController(data),
    onSuccess: (data) => {
      toast.success(data.message);
      form.reset();

      closeModal();
      // console.log("Success:", data);
      // setOpenSessionTerminationModal(false);
    },
    onError: (error) => {
      toast.error(error.message);
      // setOpenSessionTerminationModal(false);
    },
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const body = {
      newPassword: data.password,
      id: id,
      token: token ?? "",
    };
    resetPasswordMutation.mutate(body);
  }

  const handelOpenModal = () => {
    form.reset();
    closeModal();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handelOpenModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Reset Password{" "}
            {userInfo &&
              userInfo.length > 0 &&
              ` of ${capitalizeName(userInfo[0].firstName)} ${capitalizeName(
                userInfo[0].lastName
              )}`}
          </DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <div></div>

        <DialogFooter className="!justify-center mt-1 !items-center">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full space-y-6"
            >
              <div className="w-full">
                <CusPassword
                  optional={false}
                  fControl={form.control}
                  labelName="Password"
                  name="password"
                />
              </div>

              <div className="w-full">
                <CusPassword
                  optional={false}
                  fControl={form.control}
                  labelName="Confirm Password"
                  name="confirmPassword"
                />
              </div>
              <Button
                disabled={resetPasswordMutation.isPending}
                variant="primary"
                className="w-full"
                type="submit"
              >
                Confirm
                {resetPasswordMutation.isPending && (
                  <Loader2Icon className="animate-spin ml-2" />
                )}
              </Button>
            </form>
          </Form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResetPasswordModal;
