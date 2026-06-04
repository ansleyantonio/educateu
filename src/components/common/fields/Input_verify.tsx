/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface textFieldProps {
  otpSend: () => void;
  form: any;
  name: string;
  placeholder: string;
  labelName: string;
  options?: string[];
  optional?: boolean;
  disabled?: boolean;
}
const InputVerify = ({
  otpSend,
  form,
  name,
  placeholder,
  labelName,
  optional = true,
  disabled = false,
}: textFieldProps) => {
  const otpLength = 6;
  return (
    <div className="">
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => {
          const value = form.watch(name) || "";
          const isSubmitted = form.formState.isSubmitted;

          const error = form.formState.errors?.[name];
          const isError = !!error;
          const getSlotClass = (index: number) => {
            const isFilled = value.length > index;
            if (isSubmitted && isError) {
              return isFilled ? "border-red-500" : "border-red-500 ";
            }
            return isFilled ? "border-green-500" : "border-gray-300";
          };
          return (
            <FormItem>
              <label className="font-semibold capitalize text-[14px] leading-[24px] tracking-[0.02em]">
                {"6-digit code"}
                {/* {!optional && <span className="text-red-500">&nbsp;*</span>} */}
                {!optional && <span className="text-[#7E8C9A]">&nbsp;*</span>}
              </label>
              <div className="w-full">
                <FormControl>
                  <InputOTP maxLength={6} {...field} className="w-full">
                    <InputOTPGroup className="w-full flex justify-between gap-2">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <InputOTPSlot
                          key={i}
                          index={i}
                          className={`flex-1 h-9  lg:h-12  border-2 focus-visible:ring-0 focus-visible:ring-offset-0 ${getSlotClass(
                            i
                          )} rounded-md  transition-colors duration-200 text-center`}
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
              </div>
              {/* <FormDescription>
              Please enter the one-time password sent to your phone.
            </FormDescription> */}
              {/* forget password */}
              {isSubmitted && isError && <FormMessage />}
              <div className="md:flex justify-between items-center">
                <div>
                  <span className="text-sm text-muted-foreground">
                    Didn’t receive the code?
                  </span>
                </div>
                <div className="right-0 flex flex-col justify-end">
                  <a
                    onClick={otpSend}
                    className="text-sm active:scale-75 text-[#00425A] underline underline-offset-4 text-end cursor-pointer"
                  >
                    Send Again?
                  </a>
                </div>
              </div>
            </FormItem>
          );
        }}
      />
    </div>
  );
};

export default InputVerify;
