/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { useAuth } from "@/app/hook/userContext";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { z } from "zod";

const formSchema = z.object({
  username: z.string().min(1, {
    message: "Email is required.",
  }),
  password: z.string().min(2, {
    message: "Password is required.",
  }),
});

const Login_form = () => {
  const [showPassword, setShowPassword] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const auth = useAuth();

  // Retrieve redirect path from query params (if any)
  const redirectPath = searchParams.get("redirect") || "/";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // loginMutation
  const loginMutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => {
      return axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/authentication/login`,
        data,
      );
    },
    onSuccess: (data) => {
      toast.success("Successfully login!");
      // save login information to local storage
      console.log("data loging", data.data);
      // localStorage.setItem("pen-user", JSON.stringify(data.data));
      //save login information to context
      auth?.login(data.data);
      // router.replace(redirectPath);

      // queryClient.invalidateQueries({ queryKey: ["getNewApplication"] });
    },
    onError: (error: any) => {
      console.log("error", error?.response);
      if (error) {
        showToast("error", error?.response?.data);
      }
    },
  });

  //. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    loginMutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <label className="cusFormLabel">email/username</label>
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
              <label className="cusFormLabel">password</label>
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
                      <EyeOffIcon className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <EyeIcon className="w-4 h-4 text-muted-foreground" />
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
          <div className="">
            <Link
              href="/"
              className="text-sm underline text-muted-foreground underline-offset-4"
            >
              Forgot your password?
            </Link>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default Login_form;
