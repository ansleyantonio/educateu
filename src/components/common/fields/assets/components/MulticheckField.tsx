import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/custom_ui/form";
import { FieldPropsInterface } from "../interface/inputPropsType";
import { Checkbox } from "@/components/ui/checkbox";

interface MultiCheckFieldProps extends Omit<FieldPropsInterface, "options"> {
  options: { label: string; value: string }[];
}

export const MultiCheckField = ({
  form,
  name,
  labelName,
  options,
  optional = true,
  viewOnly = false,
  style,
}: MultiCheckFieldProps) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {labelName && (
            <FormLabel className="text-sm font-semibold">
              {labelName}
              {!optional && <span className="text-[#7E8C9A]"> *</span>}
            </FormLabel>
          )}

          <div className={style?.length ? style : "flex flex-col mt-2 gap-3"}>
            {options.map((option) => {
              const isChecked = field.value?.includes(option.value);

              return (
                <div key={option.value} className="flex items-center space-x-2">
                  <FormControl>
                    <label className="flex items-center space-x-2">
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          const newValue = checked
                            ? [...(field.value || []), option.value]
                            : (field.value || []).filter(
                                (val: string) => val !== option.value,
                              );
                          field.onChange(newValue);
                        }}
                        disabled={viewOnly}
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  </FormControl>
                </div>
              );
            })}
          </div>

          <FormMessage />
        </FormItem>
      )}
    />
  );
};
