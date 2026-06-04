/* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

const formSchema = z
  .object({
    currentPassword: z.string().min(1, {
      message: "Current Password is required.",
    }),
    newPassword: z.string().min(1, {
      message: "New Password is required.",
    }),
    confirmPassword: z.string().min(1, {
      message: "Confirm Password is required.",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords did not match.",
    path: ["confirmPassword"],
  });

const ChangePasswordForm = ({ setOpen }: { setOpen: any }) => {
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // API handler
  async function handleChangePassword(values: z.infer<typeof formSchema>) {
    console.log("API hit with values:", values);
    // Add your API call logic here
  }

  // Form submission handler
  function onSubmit() {
    setIsModalOpen(true); // Open confirmation modal
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
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
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() =>
                        setShowPassword({
                          ...showPassword,
                          currentPassword: !showPassword.currentPassword,
                        })
                      }
                    >
                      {showPassword.currentPassword ? (
                        <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
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
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() =>
                        setShowPassword({
                          ...showPassword,
                          newPassword: !showPassword.newPassword,
                        })
                      }
                    >
                      {showPassword.newPassword ? (
                        <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <label className="cusFormLabel">Confirm Password</label>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword.confirmPassword ? "text" : "password"}
                      placeholder="Enter your confirm password here"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() =>
                        setShowPassword({
                          ...showPassword,
                          confirmPassword: !showPassword.confirmPassword,
                        })
                      }
                    >
                      {showPassword.confirmPassword ? (
                        <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end items-center gap-x-3">
          <Button
            onClick={() => setOpen(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-[#013E5B] hover:bg-[#73b7d6] px-8 py-2"
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
