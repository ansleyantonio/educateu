/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import CommonLoginPage from "@/components/common/login/page";
import {
  LoginForm,
  LoginType,
} from "@/components/common/login/schema/loginFormSchema";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { SendOptController } from "@/components/queryController/otpSend";
import { useAuths } from "@/hooks/userContext";
import { CookieStore } from "@/lib/CookieStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface ErrorType {
  response: {
    data: {
      message: string;
    };
  };
}

export default function LoginPage() {
  const [loginStage, setLoginStage] = useState(1);
  const [loginUserData, setLoginUserData] = useState<any>(null);

  const route = useRouter();

  const auth = useAuths();
  // login mutation function create
  const loginMutation = useMutation({
    mutationFn: (data: LoginType) => {
      return axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login?userportal=faculty`,
        data,
      );
    },
    onSuccess: (data) => {
      // console.log("Admin Login page Success data ", data);
      if (data.status === 200) {
        const userData = {
          token: data?.data?.accessToken,
          userId: data?.data?.user?.id,
          username: data?.data?.user?.username,
          passwordChanged: data?.data?.user?.passwordChanged,
        };
        // New User need to update password
        if (data?.data?.user?.passwordChanged == false) {
          const userData = {
            token: data?.data?.accessToken,
            path: "/faculty/login",
          };
          CookieStore.setCookieClient("accessTokenForceFullyLogin", userData);
          route.push("/enforce-password-change");
          return;
        } else {
          // if successfully login  then redirect to opt component
          const body = {
            email: data?.data?.user?.email,
          };

          // MFA Enable
          // const mfaEnabled = data?.data?.user?.mfaEnabled;
          const mfaEnabled = data?.data?.user?.needMFALogin;

          if (mfaEnabled) {
            setLoginStage(2);
            setLoginUserData({ ...userData, email: data?.data?.user?.email });
            const TOKEN = data?.data?.accessToken;
            SendOptController(body, TOKEN);
            return;
          }

          // if (data?.data?.user.needMFALogin) {
          //   setLoginStage(2);
          //   setLoginUserData({ ...userData, email: data?.data?.user?.email });
          //   const TOKEN = data?.data?.accessToken;
          //   SendOptController(body, TOKEN);
          //   return;
          // }

          // CookieStore.setCookieClient("authData", userData);
          auth?.login(userData, "/faculty");
        }
      } else {
        toast.error("Failed to login");
      }
    },

    onError: (error: any) => {
      console.log("error", error);
      if (error) {
        showToast("error", error?.response?.data);
      }
    },
  });

  const form = useForm<LoginType>({
    resolver: zodResolver(LoginForm.LoginFormSchema),
    defaultValues: LoginForm.defaultValues,
  });
  //. Define a submit handler.

  function onSubmit(values: LoginType) {
    loginMutation.mutate(values);
  }
  return (
    <CommonLoginPage
      loginStage={loginStage}
      loginUserData={loginUserData}
      setLoginStage={setLoginStage}
      form={form}
      onSubmit={onSubmit}
      loginMutation={loginMutation}
      portalName={"Faculty Portal"}
      redirectPth="/faculty"
    />
  );
}
