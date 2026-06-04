/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { UseFormReturn } from "react-hook-form";
import { LoginType } from "./schema/loginFormSchema";

interface CommonLoginPageProps {
  form: UseFormReturn<LoginType>;
  onSubmit: (values: LoginType) => void;
  loginMutation: any;
  redirectPth?: string;
}

const CommonLoginForm = ({
  form,

  onSubmit,
  loginMutation,
  redirectPth,
}: CommonLoginPageProps) => {
  const [showPassword, setShowPassword] = useState(false);

  // loginMutation

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <label className="cusFormLabel">Email/Username</label>
              <FormControl>
                <Input
                  placeholder="Enter your email/username here"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <label className="cusFormLabel">Password</label>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password here"
                    {...field}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 right-0 px-3 h-full hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
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
        {/* login button  */}
        <div>
          <Button
            type="submit"
            className="w-full bg-[#00425A] hover:bg-[#00425A]/90"
          >
            {loginMutation.isPending && <Loader2 className="animate-spin" />}
            Login
          </Button>
          {/* login with google  */}
          {/* Handle Google login  */}
          {/* <Button
            type="button"
            variant="outline"
            className="my-6 w-full"
            onClick={() => {
            }}
          >
            <Image
              src={GoogleIcon}
              alt="Google logo"
              width={20}
              height={20}
              className="mr-2"
            />
            Login With Google
          </Button> */}
          <div className="mt-3">
            <Link
              href={`/forgot-password?redirect=${redirectPth}`}
              className="text-sm active:scale-75 underline text-muted-foreground underline-offset-4 mt-2"
            >
              Forgot your password?
            </Link>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default CommonLoginForm;
