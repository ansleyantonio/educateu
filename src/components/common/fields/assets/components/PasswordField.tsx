import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/custom_ui/form";
import { Input } from "@/components/ui/custom_ui/input";
import { passwordRules } from "@/utils/passwordRules";
import { TextCaseFormat } from "@/utils/textFormate";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import { FieldPropsInterface } from "../interface/inputPropsType";

/**
 * Password
 * A reusable password input component with optional visibility toggle and strength validation.
 *
 * Features:
 * - Toggle between masked and unmasked text
 * - Displays strength rules when `mode === "validate"`
 * - Integrated with react-hook-form
 */
export const Password = ({
  form,
  name,
  labelName,
  placeholder,
  optional = true,
  mode = "normal",
}: FieldPropsInterface) => {
  const [showPassword, setShowPassword] = useState(false); // Show/hide password input
  const [passwordValue, setPasswordValue] = useState(""); // Local state to evaluate password strength
  //   const { watch } = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {labelName && (
            <label className="font-semibold  text-[14px] leading-[24px] tracking-[0.02em]">
              {TextCaseFormat(labelName)}
              {!optional && <span className="text-[#7E8C9A]">&nbsp;*</span>}
            </label>
          )}
          <FormControl>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={TextCaseFormat(`${placeholder}`)}
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
          {/* {mode === "validate" && passwordValue && ( */}
          {mode === "validate" &&
            passwordValue &&
            !passwordRules.every((rule) => rule.test(passwordValue)) && (
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
          {/* Error message (from react-hook-form) */}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
