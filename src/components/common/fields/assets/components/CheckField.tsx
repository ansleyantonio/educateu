import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/custom_ui/form";
import { FieldPropsInterface } from "../interface/inputPropsType";

export const CheckField = ({
  form,
  name,
  labelName,
  optional = true,
  disabled = false,
  viewOnly = false,
}: FieldPropsInterface) => {
  return (
    <div>
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem className="flex items-center space-x-2">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={disabled || viewOnly}
              />
            </FormControl>
            {labelName && (
              <FormLabel className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {labelName}
                {!optional && <span className="text-[#7E8C9A]"> *</span>}
              </FormLabel>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
