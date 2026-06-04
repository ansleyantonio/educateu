/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Control, FieldPath, FieldValues } from "react-hook-form";

type Option = {
  value: string;
  label: string;
  children?: Option[];
};

interface SelectFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  options: Option[];
  disabled?: boolean;
}

export function SelectField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  options,
  disabled = false,
}: SelectFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={disabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholder || `Select ${label}`} />
              </SelectTrigger>
              {/* <SelectContent>
                {options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent> */}
              <SelectContent>
                {options.map((opt) => {
                  if (opt.children && opt.children.length > 0) {
                    // Grouped options (with children)
                    return (
                      <div key={opt.value}>
                        <div className="px-2 py-1 font-semibold text-gray-700">
                          {opt.label}
                        </div>
                        {opt.children.map((child) => (
                          <SelectItem key={child.value} value={child.value}>
                            {child.label}
                          </SelectItem>
                        ))}
                      </div>
                    );
                  } else {
                    // Standalone option (selectable)
                    return (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    );
                  }
                })}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
