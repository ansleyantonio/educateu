/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { passwordRules } from "@/utils/passwordRules";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

interface Props {
  fControl: any;
  name: string;
  labelName: string;
  optional?: boolean;
}

export const CusPassword = ({
  fControl,
  name,
  labelName,
  optional = true,
}: Props) => {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");

  const { watch } = useFormContext();

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  const showMismatch =
    name === "confirmPassword" &&
    confirmPassword?.length > 0 &&
    password !== confirmPassword;

  return (
    <FormField
      control={fControl}
      name={name}
      render={({ field }) => (
        <FormItem>
          <label className="capitalize font-semibold text-[14px] leading-[24px] tracking-[0.02em]">
            {labelName}
            {!optional && <span className="text-[#7E8C9A]">&nbsp;*</span>}
          </label>

          <FormControl>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={`Enter your ${labelName} here`}
                {...field}
                value={passwordValue}
                onChange={(e) => {
                  field.onChange(e);
                  setPasswordValue(e.target.value);
                }}
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeIcon className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </FormControl>

          {passwordValue && name === "password" && (
            <ul className="mt-2 space-y-1 text-sm">
              {passwordRules.map((rule, index) => {
                const passed = rule.test(passwordValue);
                return (
                  <li
                    key={index}
                    className={`flex items-center gap-2 ${
                      passed ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full inline-block ${
                        passed ? "bg-green-600" : "bg-gray-400"
                      }`}
                    />
                    {rule.label}
                  </li>
                );
              })}
            </ul>
          )}

          <FormMessage />
        </FormItem>
      )}
    />
  );
};
