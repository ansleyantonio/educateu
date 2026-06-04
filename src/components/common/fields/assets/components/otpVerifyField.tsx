import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/custom_ui/form";
import { TextCaseFormat } from "@/utils/textFormate";
import { FieldPropsInterface } from "../interface/inputPropsType";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/custom_ui/input-otp";

/**
 * OTP
 * A reusable One-Time Password (OTP) input component using react-hook-form.
 *
 * Features:
 * - Custom slot-based input for digits
 * - Colored border feedback for each digit on submit
 * - Dynamic length (default: 6 digits)
 * - React Hook Form validation integrated
 */

export const OTP = ({
  form,
  name,
  maxLength = 6,
  labelName,
  optional = true,
  disabled = false,
}: FieldPropsInterface) => {
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
              {labelName && (
                <label className="font-semibold capitalize text-[14px] leading-[24px] tracking-[0.02em]">
                  {TextCaseFormat(labelName)}
                  {!optional && <span className="text-[#7E8C9A]">&nbsp;*</span>}
                </label>
              )}
              <FormControl>
                <InputOTP maxLength={maxLength} {...field} className="w-full">
                  <InputOTPGroup className="w-full flex justify-between gap-2">
                    {Array.from({ length: maxLength }, (_, i) => (
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

              {/* forget password */}
              <div className="md:flex justify-between items-center">
                {isSubmitted && isError && <FormMessage />}
              </div>
            </FormItem>
          );
        }}
      />
    </div>
  );
};
