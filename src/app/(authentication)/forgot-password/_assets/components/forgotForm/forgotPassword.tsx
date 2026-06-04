/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

// import { useAuth } from "@/app/hook/userContext";
import { CustomInputField } from "@/components/common/fields/custom_input_field";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { Form } from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { z } from "zod";
import { SendOptController } from "../../contoller/optSend";
import { authenticationSchema } from "../../scheme/authentication_scheme";
const formSchema = authenticationSchema.forgotPasswordSchema;
interface Props {
  setEmail: (email: string) => void;
  setStep: (step: number) => void;
}
const ForgotPasswordForm = ({ setEmail, setStep }: Props) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
    mode: "onChange",
  });

  // loginMutation
  const otpSendMutation = useMutation({
    mutationFn: SendOptController,
    // mutationFn: (data: z.infer<typeof formSchema>) => {
    //   return axios.post(
    //     `${process.env.NEXT_PUBLIC_API_URL}/auth-management/send-otp`,
    //     data
    //   );
    // },
    onSuccess: (data) => {
      // if (data.status === 200 || data.statusCode === 200) {
      // } else
      if (data?.statusCode === 400) {
        showToast("error", data?.message);
        return;
      }
      setEmail(form.getValues("email"));
      setStep(2);
    },

    onError: (error: any) => {
      const errors = error?.response?.data?.errors;
      console.log("errors----", errors);
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
    otpSendMutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <CustomInputField.Text
          fControl={form.control}
          name="email"
          // placeholder="Enter your email here"
          labelName="Email"
          optional={false}
        />

        {/* login button  */}
        <div>
          <Button
            type="submit"
            className="w-full !py-4 bg-[#00425A] hover:bg-[#00425A]/90 my-4"
          >
            {otpSendMutation.isPending && <Loader2 className="animate-spin" />}
            Continue with email
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ForgotPasswordForm;
