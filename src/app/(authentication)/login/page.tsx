"use client";

import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Login_form from "./_assets/component/pageComponent/login_form";
import logo from "/public/assets/logo/agent/admin/logo.svg"; // logo

export default function LoginPage() {
  return (
    <main className="flex">
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
              <CardContent className="p-6 m-0">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h1 className="text-2xl font-semibold">Welcome back!</h1>
                    <p className="text-sm text-muted-foreground">
                      Login to your university account to stay up to date about
                      your applications.
                    </p>
                  </div>
                  {/* login form  */}
                  <Login_form />
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
