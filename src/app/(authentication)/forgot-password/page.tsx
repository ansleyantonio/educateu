"use client";
import { Card, CardContent } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import ForgotPasswordForm from "./_assets/components/forgotForm/forgotPassword";
import OTPVerify_form from "./_assets/components/forgotForm/otpVerify_form";
import SetPassword_form from "./_assets/components/forgotForm/setPassword_form";
const dynamicTitle = [
  "Forgot password!",
  "Check your inbox",
  "Set your password",
];
const ForgotPasswordPage = () => {
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#002633]">
      <div className="text-muted-foreground">
        <Card className="xl:min-w-[30rem] w-full !p-0 !m-0">
          <CardContent className="p-6 m-0">
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold">
                  {" "}
                  {dynamicTitle[step - 1]}
                </h1>
              </div>
              {/* forgot password form  */}
              {step === 1 && (
                <ForgotPasswordForm setEmail={setEmail} setStep={setStep} />
              )}

              {step === 2 && (
                <OTPVerify_form
                  email={email}
                  setStep={setStep}
                  setCode={setCode}
                />
              )}

              {step === 3 && (
                <SetPassword_form
                  redirectPath={redirectPath}
                  email={email}
                  code={code}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
