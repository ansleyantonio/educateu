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
import { useEffect, useState } from "react";
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
  const [loginUserData, setLoginUserData] = useState<any>(null);
  const [loginStage, setLoginStage] = useState(1);
  const route = useRouter();
  const auth = useAuths();

  useEffect(() => {
    const stored = localStorage.getItem("force-agent-login");
    if (stored) {
      const { token, userId } = JSON.parse(stored);
      if (token && userId) {
        auth?.login({ token, userId }, "/agent");
        localStorage.removeItem("force-agent-login");
      }
    }
  }, []);

  // login mutation function create
  const loginMutation = useMutation({
    mutationFn: (data: LoginType) => {
      return axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login?userportal=agent`,
        data,
      );
    },
    onSuccess: (data) => {
      if (data.status === 200) {
        const userData = {
          token: data?.data?.accessToken,
          userId: data?.data?.user?.id,
        };

        if (data?.data?.user?.passwordChanged == false) {
          CookieStore.clearAuthCookieClient();
          const userData = {
            token: data?.data?.accessToken,
            path: "/agent/login",
          };
          CookieStore.setCookieClient("accessTokenForceFullyLogin", userData);
          route.push("/enforce-password-change");
        } else {
          // if successfully login  then redirect to opt component
          // console.log("loginStage root", data);
          const body = {
            email: data?.data?.user?.email,
          };

          // MFA Enable
          // const mfaEnabled = data?.data?.user?.mfaEnabled;
          const mfaEnabled = data?.data?.user?.needMFALogin;

          if (mfaEnabled) {
            setLoginStage(2);
            setLoginUserData({
              ...userData,
              email: data?.data?.user?.email,
            });
            const TOKEN = data?.data?.accessToken;
            SendOptController(body, TOKEN);
            return;
          }

          //if not MFA enable then after 24 hours then otp send automatically
          // const EnforceOtp = isMoreThan24HoursOld(
          //   data?.data?.user.lastMFALogin,
          //   24
          // );
          // if (data?.data?.user.needMFALogin) {
          //   setLoginStage(2);
          //   setLoginUserData({ ...userData, email: data?.data?.user?.email });
          //   const TOKEN = data?.data?.accessToken;
          //   SendOptController(body, TOKEN);
          //   return;
          // }
          auth?.login(userData, "/agent");
          // auth?.login(userData, "/agent");
        }
        // redirect portal home page
      } else {
        toast.error("Failed to login");
      }
    },
    onError: (error: any) => {
      console.log("error", error);
      showToast("error", error?.response?.data);
    },
  });

  const form = useForm<LoginType>({
    resolver: zodResolver(LoginForm.LoginFormSchema),
    defaultValues: LoginForm.defaultValues,
  });
  //. Define a submit handler.
  function onSubmit(values: LoginType) {
    // console.log(values);

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
      portalName={"Agent Portal"}
      redirectPth="/agent"
    />

    // <CommonLoginPage
    //   setLoginUserData={setLoginUserData}
    //   loginUserData={loginUserData}
    //   loginStage={loginStage}
    //   form={form}
    //   onSubmit={onSubmit}
    //   loginMutation={loginMutation}
    //   portalName="Agent Portal"
    //   redirectPth="/agent"
    // />
  );
}
