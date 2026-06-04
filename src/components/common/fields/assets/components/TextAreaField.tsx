import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/custom_ui/form";
import { Textarea } from "@/components/ui/textarea";
import { TextCaseFormat } from "@/utils/textFormate";
import { FieldPropsInterface } from "../interface/inputPropsType";
export const TextArea = ({
  form,
  name,
  labelName,
  placeholder,
  optional = true,
  disabled = false,
  viewOnly = false,
}: FieldPropsInterface) => {
  return (
    <FormField
      control={form?.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {labelName && (
            <label className="font-semibold text-[14px] leading-[24px] tracking-[0.02em]">
              {TextCaseFormat(labelName)}
              {!optional && <span className="text-[#7E8C9A]">&nbsp;*</span>}
            </label>
          )}
          {viewOnly ? (
            <div className="py-2 px-3 text-sm text-gray-900 whitespace-pre-wrap break-all bg-white rounded-md border border-gray-200 min-h-[160px]">
              {field.value || ""}
            </div>
          ) : (
            <>
              <FormControl>
                <Textarea
                  suppressHydrationWarning
                  placeholder={TextCaseFormat(`${placeholder}`)}
                  className="resize-none"
                  rows={10}
                  disabled={disabled}
                  {...field}
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
