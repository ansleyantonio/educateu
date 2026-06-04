/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/custom_ui/form";
import { Input } from "@/components/ui/custom_ui/input";
import { TextCaseFormat } from "@/utils/textFormate";
import { FieldPropsInterface } from "../interface/inputPropsType";

export const Text = ({
  form,
  name,
  placeholder,
  labelName,
  optional = true,
  disabled = false,
  viewOnly = false,
  customMessage,
  isArray = false,
  onChange,
  suffix,
}: FieldPropsInterface) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const error = form.formState.errors?.[name];
        const isError = !!error;
        return (
          <FormItem>
            {labelName && (
              <label className="font-semibold text-[14px] leading-[24px] tracking-[0.02em]">
                {TextCaseFormat(labelName)}
                {!optional && <span className="text-[#7E8C9A]">&nbsp;*</span>}
              </label>
            )}
            {viewOnly ? (
              <div className="py-2 px-3 text-sm text-gray-900 bg-white rounded-md border border-gray-200 min-h-[40px]">
                {field.value || ""}
              </div>
            ) : (
              <>
                <FormControl>
                  <div className="relative flex items-center">
                    <Input
                      className={`focus-visible:ring-0 focus-visible:ring-offset-0  ${
                        isError && "border-red-600"
                      }`}
                      placeholder={TextCaseFormat(placeholder)}
                      disabled={disabled}
                      {...field}
                      type="text"
                      onChange={(event) => {
                        const inputValue = event.target.value;
                        if (isArray) {
                          const arr = inputValue
                            .split(/[\s,]+/)
                            .map((v) => v.trim())
                            .filter((v) => v.length > 0);
                          form.setValue(name, arr as any, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        }
                        field.onChange(event);
                        if (onChange) {
                          onChange(event);
                        }
                      }}
                    />
                    {suffix && (
                      <span className="absolute right-3 text-gray-500 text-sm pointer-events-none">
                        {suffix}
                      </span>
                    )}
                  </div>
                </FormControl>
                <FormMessage>
                  {isError ? String(error?.message || "") : customMessage || ""}
                </FormMessage>
              </>
            )}
          </FormItem>
        );
      }}
    />
  );
};
