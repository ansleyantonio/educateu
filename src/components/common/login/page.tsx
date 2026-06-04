/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { AlertDialogDemo } from "@/components/inactivityModal/inactivityMessage";
import { Card, CardContent } from "@/components/ui/card";
import { MoveLeft } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import toast from "react-hot-toast";
import CommonLoginForm from "./login_form";
import OtpVerify from "./otpVerify/OtpVerify";
import { LoginType } from "./schema/loginFormSchema";
import logo from "/public/assets/logo/agent/admin/logo.svg"; // logo

interface CommonLoginPageProps {
  form: UseFormReturn<LoginType>;
  setLoginStage: (value: number) => void;
  onSubmit: (values: LoginType) => void;
  loginMutation: any;
  portalName?: string;
  loginStage?: number;
  loginUserData?: any;
  redirectPth?: string;
}

export default function CommonLoginPage({
  form,
  setLoginStage,
  onSubmit,
  loginMutation,
  portalName,
  loginStage,
  loginUserData,
  redirectPth,
}: CommonLoginPageProps) {
  // This code toast messages to show force logout reasons
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  const hasShownToast = useRef(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (reason && !hasShownToast.current) {
      if (reason === "Inactivity") {
        setOpen(true);
        return;
      }
      // CookieStore.clearAuthCookieClient();
      toast.error(reason);
      hasShownToast.current = true;

      // Remove query param after showing toast
      const url = new URL(window.location.href);
      url.searchParams.delete("reason");
      window.history.replaceState({}, document.title, url.toString());
    }
  }, [reason]);
  // end

  return (
    <main className="flex">
      {/* AlertDialogDemo */}
      <AlertDialogDemo open={open} setOpen={setOpen} />
      {/* Left Section */}
      <div className="flex flex-1 justify-center items-center min-h-screen bg-[#002633]">
        <div className="w-fit px-[56px]">
          <div className="relative mx-auto mb-12 rounded-full w-[6rem] h-[6rem]">
            <Image
              src={logo}
              alt="EduTech Logo"
              fill
              className="object-cover absolute text-white"
            />
          </div>
          <h1 className="mt-6 font-serif text-4xl font-extrabold text-white">
            Welcome To EducateU
          </h1>
        </div>

        {/* <div className="w-full px-[56px]"> */}
        {/*   <div className="relative mb-[4rem] w-[4rem] h-[4rem]"> */}
        {/*     <Image */}
        {/*       src={logo} */}
        {/*       alt="EduTech Logo" */}
        {/*       fill */}
        {/*       className="object-cover absolute text-white" */}
        {/*     /> */}
        {/*   </div> */}
        {/*   <div className="text-white"> */}
        {/*     <h1 className="mb-2 text-4xl font-semibold">Welcome</h1> */}
        {/*     <h2 className="mb-8 text-4xl font-semibold"> */}
        {/*       <span className="italic">EducateU</span>👋 */}
        {/*     </h2> */}
        {/*     <p className="leading-relaxed text-[#555F6D]"> */}
        {/*       Access your personalized learning dashboard and explore a world of */}
        {/*       opportunities. Track your progress, manage courses, and unlock new */}
        {/*       skills—all in one place. Log in to continue your journey toward */}
        {/*       achieving your goals with ease and efficiency! */}
        {/*     </p> */}
        {/*   </div> */}
        {/* </div> */}
      </div>
      {/* Right Section */}
      <div className="flex flex-1 justify-center items-center min-h-screen">
        <div className="w-full px-[56px]">
          {/* <div className="text-center lg:text-left">
            <h2 className="text-2xl font-semibold text-black md:mb-[1rem] lg:mb-[1rem] 2xl:mb-[12rem]">
              University of Edutech
            </h2>
          </div> */}
          <div className="text-muted-foreground">
            <Card className="w-full !p-0 !m-0">
              {/* Card Content */}
              <CardContent className="p-6 m-0">
                {/* Go Back Button */}

                {loginStage === 2 && (
                  <div
                    onClick={() => setLoginStage(1)}
                    className="inline-block relative cursor-pointer group"
                  >
                    <MoveLeft strokeWidth="3" className="text-[#002633]" />
                    <span className="absolute top-1/2 left-full py-1 px-2 text-xs text-white whitespace-nowrap rounded opacity-0 transition-opacity duration-200 -translate-y-1/2 group-hover:opacity-100 bg-[#002633]">
                      Back to Login
                    </span>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="space-y-2">
                    <h1 className="text-2xl font-semibold">
                      {loginStage === 1
                        ? ` Welcome ${portalName}`
                        : "Check Your Email"}
                      {/* Welcome {portalName} */}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {loginStage === 1 ? (
                        ` Login to your university account to stay up to date about
                      your applications.`
                      ) : (
                        <>
                          {" "}
                          Enter the 6-digit code we sent to{" "}
                          <span className="font-bold text-black">
                            {loginUserData?.email}
                          </span>{" "}
                          to create your new password
                        </>
                      )}
                      {/* Welcome {portalName} */}
                    </p>
                  </div>
                  {/* login form  */}
                  {loginStage === 1 && (
                    <CommonLoginForm
                      form={form}
                      onSubmit={onSubmit}
                      loginMutation={loginMutation}
                      redirectPth={redirectPth}
                    />
                  )}

                  {loginStage === 2 && (
                    <OtpVerify
                      setLoginStage={loginStage}
                      redirectPth={redirectPth}
                      loginUserData={loginUserData}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
            {/* <div className="flex items-center pt-4 space-x-2">
              <Checkbox id="stay-logged-in" />
              <label
                htmlFor="stay-logged-in"
                className="text-sm text-muted-foreground"
              >
                Stay logged in?
              </label>
            </div> */}
          </div>
        </div>
      </div>
    </main>
  );
}
