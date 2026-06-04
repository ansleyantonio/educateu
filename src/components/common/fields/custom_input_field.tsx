/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from "@/components/ui/custom_ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { TextCaseFormat } from "@/utils/textFormate";

interface textFieldProps {
  fControl: any;
  name: string;
  labelName: string;
  optional?: boolean;
  disabled?: boolean;
}

const Text = ({
  fControl,
  name,
  labelName,
  optional = true,
  disabled = false,
}: textFieldProps) => {
  return (
    <FormField
      control={fControl}
      name={name}
      render={({ field }) => (
        <FormItem>
          <label className="font-semibold capitalize text-[14px] leading-[24px] tracking-[0.02em]">
            {labelName}
            {/* {!optional && <span className="text-red-500">&nbsp;*</span>} */}
            {!optional && <span className="text-[#7E8C9A]">&nbsp;*</span>}
          </label>
          <FormControl>
            <Input
              className="focus-visible:ring-0 focus-visible:ring-offset-0"
              // placeholder={"(text)"}
              placeholder={TextCaseFormat(`Enter your ${labelName}`)}
              disabled={disabled}
              {...field}
              type="text"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const TextArea = ({
  fControl,
  name,
  labelName,
  optional = true,
  disabled = false,
}: textFieldProps) => {
  return (
    <FormField
      control={fControl}
      name={name}
      render={({ field }) => (
        <FormItem>
          <label className="font-semibold capitalize text-[14px] leading-[24px] tracking-[0.02em]">
            {labelName}
            {/* {!optional && <span className="text-red-500">&nbsp;*</span>} */}
            {!optional && <span className="text-[#7E8C9A]">&nbsp;*</span>}
          </label>
          <FormControl>
            <Textarea
              suppressHydrationWarning
              placeholder="None..."
              className="resize-none"
              rows={10}
              disabled={disabled}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const Number = ({
  fControl,
  name,
  labelName,
  optional = true,
  disabled = false,
}: textFieldProps) => {
  return (
    <FormField
      control={fControl}
      name={name}
      render={({ field }) => (
        <FormItem>
          <label className="font-semibold capitalize text-[14px] leading-[24px] tracking-[0.02em]">
            {labelName}
            {/* {!optional && <span className="text-red-500">&nbsp;*</span>} */}
            {!optional && <span className="text-[#7E8C9A]">&nbsp;*</span>}
          </label>
          <FormControl>
            <Input
              type="number"
              className="focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder={"(number)"}
              //   placeholder={"Enter your " + label}
              {...field}
              disabled={disabled}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
export const CustomInputField = {
  Text,
  TextArea,
  Number,
};
