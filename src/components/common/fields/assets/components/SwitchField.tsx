import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/custom_ui/form";
import { Switch } from "@/components/ui/custom_ui/switch";
import { TextCaseFormat } from "@/utils/textFormate";
import { FieldPropsInterface } from "../interface/inputPropsType";

export const SwitchField = ({
  form,
  name,
  labelName,
  optional = true,
  disabled = false,
  viewOnly = false,
}: FieldPropsInterface) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex justify-between h-11 items-center rounded-lg border px-3 shadow-sm">
          {labelName && (
            <FormLabel className="font-semibold text-sm">
              {TextCaseFormat(labelName)}
              {!optional && <span className="text-[#7E8C9A]"> *</span>}
            </FormLabel>
          )}

          {viewOnly ? (
            <div className="text-sm font-medium text-gray-900">
              {field.value ? "Yes" : "No"}
            </div>
          ) : (
            <>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </>
          )}
        </FormItem>
      )}
    />
  );
};
