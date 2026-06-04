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

export const NumberText = ({
  form,
  name,
  placeholder,
  labelName,
  optional = true,
  disabled = false,
  viewOnly = false,
  customMessage,
  onChange,
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
                  <Input
                    className={`focus-visible:ring-0 focus-visible:ring-offset-0 ${
                      isError && "border-red-600"
                    }`}
                    placeholder={TextCaseFormat(placeholder)}
                    disabled={disabled}
                    type="text" // keep as text to allow number strings
                    value={field.value ?? ""} // default empty string
                    onChange={(event) => {
                      const inputValue = event.target.value;

                      // Allow empty string
                      if (inputValue === "") {
                        form.setValue(name, "");
                        field.onChange(event);
                        return;
                      }

                      // Check if input is valid number
                      if (!/^\d+$/.test(inputValue)) {
                        form.setError(name, {
                          type: "manual",
                          message: "Please type number",
                        });
                      } else {
                        form.clearErrors(name);
                        form.setValue(name, inputValue, {
                          shouldValidate: true,
                        });
                      }

                      field.onChange(event);

                      if (onChange) {
                        onChange(event);
                      }
                    }}
                  />
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
