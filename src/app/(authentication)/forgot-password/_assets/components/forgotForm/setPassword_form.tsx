/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

// import { useAuth } from "@/app/hook/userContext";
// import { passwordRules } from "@/app/utils/passwordValidation/passwordValidation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { passwordRules } from "@/utils/passwordRules";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import { authenticationSchema } from "../../scheme/authentication_scheme";
const formSchema = authenticationSchema.setPasswordSchema;

interface Props {
  email: string;
  code: string;
  redirectPath?: string;
}

type resetUser = {
  email: string;
  otp: string;
  newPassword: string;
};

const SetPassword_form = ({ email, redirectPath, code }: Props) => {
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    // mode: "onChange",
  });

  // loginMutation
  const loginMutation = useMutation({
    mutationFn: (data: resetUser) => {
      return axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth-management/reset-password`,
        data,
      );
    },
    onSuccess: (data) => {
      console.log("data login---", data?.data?.data);
      // Save tokens to Zustand (auto-persisted to localStorage)

      toast.success("Successfully reset password!");
      router.push(`${redirectPath}/login`);
    },
    onError: (error: any) => {
      const errors = error?.response?.data?.errors;
      const fallbackMessage =
        error?.response?.data?.message || "Something went wrong";
      if (errors && Array.isArray(errors) && errors[0]?.messages?.[0]) {
        toast.error(errors[0].messages[0]); // Show the specific validation message
      } else {
        toast.error(fallbackMessage); // Fallback to general message
      }
    },
  });

  //. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // console.log(values);
    const resetUser: resetUser = {
      email,
      otp: code,
      newPassword: values.password,
    };
    loginMutation.mutate(resetUser);
  }

  const hasError = (fieldName: keyof typeof form.formState.errors) => {
    return !!form.formState.errors[fieldName];
  };
  const password = form.watch("password");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => {
            const isError = hasError("password");

            return (
              <FormItem>
                <label className="cusFormLabel">Password</label>
                <FormControl>
                  <div className="relative">
                    <Input
                      className={`focus-visible:ring-0 focus-visible:ring-offset-0  ${
                        isError && "border-red-600"
                      }`}
                      type={showPassword.password ? "text" : "password"}
                      placeholder="Enter your password here"
                      {...field}
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 px-3 h-full hover:bg-transparent"
                      onClick={() =>
                        setShowPassword((prev) => {
                          return {
                            ...prev,
                            password: !prev.password,
                          };
                        })
                      }
                    >
                      {showPassword.password ? (
                        <EyeOffIcon className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <EyeIcon className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </FormControl>

                <FormMessage />
              </FormItem>
            );
          }}
        />

        {/*  Password Rules UI */}
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

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => {
            const isError = hasError("confirmPassword");

            return (
              <FormItem>
                <label className="cusFormLabel">Confirm Password</label>
                <FormControl>
                  <div className="relative">
                    <Input
                      className={`focus-visible:ring-0 focus-visible:ring-offset-0  ${
                        isError && "border-red-600"
                      }`}
                      type={showPassword.confirmPassword ? "text" : "password"}
                      placeholder="Enter your password here"
                      {...field}
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 px-3 h-full hover:bg-transparent"
                      onClick={() =>
                        setShowPassword((prev) => {
                          return {
                            ...prev,
                            confirmPassword: !prev.confirmPassword,
                          };
                        })
                      }
                    >
                      {showPassword.confirmPassword ? (
                        <EyeOffIcon className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <EyeIcon className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </FormControl>

                <FormMessage />
              </FormItem>
            );
          }}
        />

        {/* login button  */}
        <div>
          <Button
            type="submit"
            className="w-full !py-4 bg-[#00425A] hover:bg-[#00425A]/90 my-4"
          >
            {loginMutation.isPending && <Loader2 className="animate-spin" />}
            Set Password
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SetPassword_form;
