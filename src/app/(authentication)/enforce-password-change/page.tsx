/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { showToast } from "@/components/common/TostMessage/customTostMessage";
import passwordFormSchema from "@/components/schema/chnagePasswordSchema";
import { Button } from "@/components/ui/button";
import { Card, CardDescription } from "@/components/ui/card";
import { CardContent } from "@/components/ui/custom_ui/customCard";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { CookieStore } from "@/lib/CookieStore";
import { passwordRules } from "@/utils/passwordRules";
import { useMutation } from "@tanstack/react-query";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import ChangePasswordController from "./controller/changePassword";

interface UserData {
  token?: string;
  path?: string;
}

const EnforcePasswordChange = () => {
  // const userData = getAccessTokenForceFullyLogin();
  const userData: UserData | null = CookieStore.getCookieClient(
    "accessTokenForceFullyLogin"
  );

  const { token, path } = userData || {};

  // const { token, path } = JSON.parse(userData!) || {};
  // const token = userParseData.token;
  // const userId = userParseData.userId;
  const router = useRouter();

  const [open, setOpen] = useState(false);

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

  // const changePassMutation = useApiMutation({
  //   // safe: false,
  //   path: `communication/change-password`,
  //   method: "POST",
  //   onSuccess: (data) => {
  //     showToast("success", data);
  //     // saveOrUpdateDataById(ApplicationId, completeStepList);
  //     setOpen(false);
  //     router.push(`${path}`);
  //   },
  //   onError: (error: any) => {
  //     console.error("Change password error:", error);

  //     showToast("error", error || "Failed to change password");
  //   },
  // });

  const changePassMutation = useMutation({
    mutationFn: (data: any) => ChangePasswordController(data),
    onSuccess: (data: any) => {
      console.log("data", data);
      if (data.statusCode != 200) {
        // console.log("data--------", data);
        showToast("error", data || "Failed to change password");
        // toast.error(data?.message || "Failed to change password");
      } else {
        toast.success("Successfully changed password!");
        // clearAccessTokenForceFullyLogin();
        setOpen(false);
        router.push(`${path}`);
      }
    },
    onError: (error: any) => {
      console.error("Change password error:", error);
      showToast("error", error || "Failed to change password");
    },
  });

  async function handleChangePassword(
    values: z.infer<typeof passwordFormSchema>
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
    <div className="w-full h-screen bg-[#002633]">
      <div className="flex justify-center items-center h-full">
        <Card className="p-2 md:p-5 max-w-[50%]  !m-0 h-full max-h-[75%] 2xl:max-h-[60%] overflow-auto scroll-y-auto">
          <CardContent className="p-6 m-0">
            <CardDescription className="hidden"></CardDescription>
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold">
                  Change Your Password Now!
                </h1>
                <p className="text-sm text-muted-foreground">
                  For your security, you must update your password before
                  continuing.
                </p>
              </div>
              {/* login form  */}
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 gap-4">
                    {/* Current Password */}
                    <FormField
                      control={form.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <label className="cusFormLabel">
                            Current Password
                          </label>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={
                                  showPassword.currentPassword
                                    ? "text"
                                    : "password"
                                }
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
                                    currentPassword:
                                      !showPassword.currentPassword,
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

                    {/* New Password with live validation rules */}
                    <FormField
                      control={form.control}
                      name="newPassword"
                      render={({ field }) => {
                        const password = form.watch("newPassword");

                        return (
                          <FormItem>
                            <label className="cusFormLabel">New Password</label>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={
                                    showPassword.newPassword
                                      ? "text"
                                      : "password"
                                  }
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

                            {/*  Password Rules UI */}
                            {password && (
                              <ul className="mt-2 space-y-1 text-sm">
                                {passwordRules.map((rule, index) => {
                                  const passed = rule.test(password);
                                  return (
                                    <li
                                      key={index}
                                      className={`flex items-center gap-2 ${
                                        passed
                                          ? "text-green-600"
                                          : "text-red-500"
                                      }`}
                                    >
                                      <span
                                        className={`w-2 h-2 rounded-full inline-block ${
                                          passed
                                            ? "bg-green-600"
                                            : "bg-gray-400"
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

                    {/*Confirm Password Live Match Feedback */}
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => {
                        const newPassword = form.watch("newPassword");
                        const confirmPassword = form.watch("confirmPassword");
                        const passwordsMatch =
                          confirmPassword && newPassword === confirmPassword;

                        return (
                          <FormItem>
                            <label className="cusFormLabel">
                              Confirm Password
                            </label>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={
                                    showPassword.confirmPassword
                                      ? "text"
                                      : "password"
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
                                      confirmPassword:
                                        !showPassword.confirmPassword,
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
                            {/* 
                            {confirmPassword && !passwordsMatch && (
                              <p className="mt-1 text-sm text-red-500">
                                Passwords do not match
                              </p>
                            )} */}

                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-x-3 justify-end items-center">
                    {/* <Button
                      onClick={() => setOpen(false)}
                      type="button"
                      variant="outline"
                      className="capitalize"
                    >
                      Cancel
                    </Button> */}
                    <Button
                      type="submit"
                      className="py-2 px-8 capitalize bg-[#013E5B] hover:bg-[#73b7d6]"
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
                        <DialogTitle className="hidden">a</DialogTitle>

                        <h3 className="text-lg font-semibold">Are you sure?</h3>
                        <p className="text-sm text-muted-foreground">
                          Do you want to change your password?
                        </p>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          onClick={() => setIsModalOpen(false)}
                          variant="outline"
                        >
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnforcePasswordChange;
