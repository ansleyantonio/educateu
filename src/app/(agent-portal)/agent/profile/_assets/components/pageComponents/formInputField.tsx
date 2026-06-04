import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { AgentFormData } from "../../schema/agentSchema";

export function FormInput({
  label,
  name,
  form,
  readOnly = false,
  required = false,
}: {
  label: string;
  name: keyof AgentFormData;
  form: UseFormReturn<AgentFormData>;
  readOnly?: boolean;
  required?: boolean;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <label className="capitalize cusFormLabel">
            {label}
            {required && <span className="text-red-500"> *</span>}
          </label>
          <FormControl>
            <Input
              placeholder={`Enter your ${label.toLowerCase()}`}
              {...field}
              value={
                typeof field.value === "string" ||
                typeof field.value === "number"
                  ? field.value
                  : ""
              }
              disabled={readOnly}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
