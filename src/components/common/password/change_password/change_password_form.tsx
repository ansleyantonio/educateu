/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import passwordFormSchema from "@/components/schema/chnagePasswordSchema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useAuths } from "@/hooks/userContext";
import { passwordRules } from "@/utils/passwordRules";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import ChangePasswordController from "./controller/changePassword";
import { EyeIcon, EyeOffIcon } from "lucide-react";

// const formSchema = z
//   .object({
//     currentPassword: z.string().min(1, {
//       message: "Current Password is required.",
//     }),
//     newPassword: passwordValidation,
//     confirmPassword: z.string().min(1, {
//       message: "Confirm Password is required.",
//     }),
//   })
//   .refine((data) => data.newPassword === data.confirmPassword, {
//     message: "Passwords did not match.",
//     path: ["confirmPassword"],
//   });

const ChangePasswordForm = ({ setOpen }: { setOpen: any }) => {
  const auth = useAuths();
  const token = auth?.user?.token;

  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const form = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const changePassMutation = useMutation({
    mutationFn: (data: any) => ChangePasswordController(data),
    onSuccess: (data) => {
      if (data.statusCode == 400) {
        // console.log("data--------", data);
        toast.error(data?.message || "Failed to change password");
      } else {
        toast.success("Successfully changed password!");
        // clearAccessTokenForceFullyLogin();
        setOpen(false);
      }
    },
    onError: (error: any) => {
      console.error("Change password error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to change password",
      );
    },
  });

  async function handleChangePassword(
    values: z.infer<typeof passwordFormSchema>,
  ) {
    const body = {
      oldPassword: values.currentPassword,
      newPassword: values.newPassword,
    };
    changePassMutation.mutate({ token, body });
  }

  function onSubmit() {
    setIsModalOpen(true);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {/* Current Password */}
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <label className="cusFormLabel">Current Password</label>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword.currentPassword ? "text" : "password"}
                      placeholder="Enter your current password here"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 px-3 h-full hover:bg-transparent"
                      onClick={() =>
                        setShowPassword({
                          ...showPassword,
                          currentPassword: !showPassword.currentPassword,
                        })
                      }
                    >
                      {showPassword.currentPassword ? (
                        <EyeIcon className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <EyeOffIcon className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ✅ NEW - New Password with live validation rules */}
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => {
              const password = form.watch("newPassword"); // ✅ NEW

              return (
                <FormItem>
                  <label className="cusFormLabel">New Password</label>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword.newPassword ? "text" : "password"}
                        placeholder="Enter your new password here"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0 px-3 h-full hover:bg-transparent"
                        onClick={() =>
                          setShowPassword({
                            ...showPassword,
                            newPassword: !showPassword.newPassword,
                          })
                        }
                      >
                        {showPassword.newPassword ? (
                          <EyeIcon className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <EyeOffIcon className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>

                  {/* ✅ Password Rules UI */}
                  {password && (
                    <ul className="mt-2 space-y-1 text-sm">
                      {passwordRules.map((rule, index) => {
                        const passed = rule.test(password);
                        return (
                          <li
                            key={index}
                            className={`flex items-center gap-2 ${
                              passed ? "text-green-600" : "text-red-500"
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full inline-block ${
                                passed ? "bg-green-600" : "bg-gray-400"
                              }`}
                            />
                            {rule.label}
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  <FormMessage />
                </FormItem>
              );
            }}
          />

          {/* ✅ NEW - Confirm Password Live Match Feedback */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => {
              const newPassword = form.watch("newPassword"); // ✅ NEW
              const confirmPassword = form.watch("confirmPassword"); // ✅ NEW
              const passwordsMatch =
                confirmPassword && newPassword === confirmPassword;

              return (
                <FormItem>
                  <label className="cusFormLabel">Confirm Password</label>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={
                          showPassword.confirmPassword ? "text" : "password"
                        }
                        placeholder="Enter your confirm password here"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0 px-3 h-full hover:bg-transparent"
                        onClick={() =>
                          setShowPassword({
                            ...showPassword,
                            confirmPassword: !showPassword.confirmPassword,
                          })
                        }
                      >
                        {showPassword.confirmPassword ? (
                          <EyeIcon className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <EyeOffIcon className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-x-3 justify-end items-center">
          <Button
            onClick={() => setOpen(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="py-2 px-8 bg-[#013E5B] hover:bg-[#73b7d6]"
          >
            Save
          </Button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <h3 className="text-lg font-semibold">Are you sure?</h3>
              <p className="text-sm text-muted-foreground">
                Do you want to change your password?
              </p>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setIsModalOpen(false)} variant="outline">
                Cancel
              </Button>
              <Button
                onClick={() => {
                  handleChangePassword(form.getValues());
                  setIsModalOpen(false);
                }}
              >
                Yes, Change
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Form>
  );
};

export default ChangePasswordForm;
