/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

// import { useAuth } from "@/app/hook/userContext";
import { Form } from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { z } from "zod";
import { authenticationSchema } from "../../scheme/authentication_scheme";
import { InputFiledOTP } from "../otp/inputOtp";
const formSchema = authenticationSchema.otpSchema;
interface Props {
  email: string;
  setStep: (step: number) => void;
  setCode: (code: string) => void;
}

//formSchemaType
type formSchemaType = z.infer<typeof formSchema>;
type UpdateData = formSchemaType & {
  email: string;
};
const OTPVerify_form = ({ email, setStep, setCode }: Props) => {
  const form = useForm<formSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
    mode: "onChange",
  });

  // loginMutation
  const loginMutation = useMutation({
    mutationFn: (data: any) => {
      return axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth-management/match-otp`,
        data
      );
    },
    onSuccess: (data) => {
      // toast.success("Successfully login!");
      // save login information to local storage
      console.log("otp verify", data);
      setCode(form.getValues("code"));
      setStep(3);
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
    console.log(values);
    //set email in values
    loginMutation.mutate({ otp: values.code, email });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <InputFiledOTP
          email={email}
          form={form}
          name="code"
          placeholder="Enter your opt here"
          labelName="Verify OTP"
          optional={true}
        />

        {/* login button  */}
        <div>
          <Button
            type="submit"
            className="w-full !py-4 bg-[#00425A] hover:bg-[#00425A]/90 my-4"
          >
            {loginMutation.isPending && <Loader2 className="animate-spin" />}
            Verify OTP
          </Button>

          {/* <div className="mt-4 text-[#444444] text[16px] font-semibold text-center">
            <hr />
            <div className="mt-3">
              <span>Didn’t receive the code? Resend code in 30</span>
            </div>
          </div> */}
        </div>
      </form>
    </Form>
  );
};

export default OTPVerify_form;
