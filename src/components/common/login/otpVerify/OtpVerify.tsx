/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

// import { useAuth } from "@/app/hook/userContext";
import { SendOptController } from "@/components/queryController/otpSend";
import { useAuths } from "@/hooks/userContext";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { z } from "zod";
import InputVerify from "../../fields/Input_verify";
import { LoginForm } from "../schema/loginFormSchema";
const formSchema = LoginForm.otpSchema;
interface Props {
  email: string;
  token: string;
  userId: string;
}

//formSchemaType
type formSchemaType = z.infer<typeof formSchema>;
type UpdateData = formSchemaType & {
  email: string;
};

const OtpVerify = ({ loginUserData, redirectPth }: any) => {
  const auth = useAuths();
  const token = loginUserData?.token;
  // console.log("token------", token);
  // const [loginUserData, setLoginUserData] = useState<any>(null);
  // const [loginStage, setLoginStage] = useState(1);

  // console.log("loginUserData in otp", loginUserData);
  const form = useForm<formSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
    mode: "onChange",
  });

  // loginMutation
  const otpVerifyMutation = useMutation({
    mutationFn: (data: any) => {
      // console.log("data", data);
      return axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/communication/match-otp`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    },
    onSuccess: (data) => {
      // toast.success("Successfully login!");
      // save login information to local storage
      //
      toast.success("Successfully login!");
      auth?.login(loginUserData, redirectPth);
      // console.log("otp verify", data);
    },
    onError: (error: any) => {
      const fallbackMessage =
        error?.response?.data?.message || "Something went wrong";
      if (error?.response?.data?.errors) {
        toast.error(error?.response?.data?.errors); // Show the specific validation message
      } else {
        toast.error(fallbackMessage); // Fallback to general message
      }
    },
  });

  // otp send
  const body = {
    email: loginUserData?.email,
  };
  const otpSend = async () => {
    await SendOptController(body, token);
  };

  // otpSendMutation.mutate(body);

  //. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    //set email in values
    otpVerifyMutation.mutate({ otp: values.code });
  }

  return (
    <FormProvider {...form}>
      {/* Use FormProvider instead of Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="w-full">
          <InputVerify
            otpSend={otpSend}
            form={form}
            name="code"
            placeholder="Enter your opt here"
            labelName="Verify OTP"
            optional={true}
          />
        </div>

        {/* login button  */}
        <div>
          <Button
            type="submit"
            className="w-full !py-4    bg-[#00425A] hover:bg-[#00425A]/90"
          >
            {otpVerifyMutation.isPending && (
              <Loader2 className="animate-spin" />
            )}
            Verify OTP
          </Button>

          {/* <div className="mt-4 font-semibold text-center text-[#444444] text[16px]">
            <hr />
            <div className="mt-3">
              <span>Didn’t receive the code? Resend code in 30</span>
            </div>
          </div> */}
        </div>
      </form>
    </FormProvider>
  );
};

export default OtpVerify;
