import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  permissionLabels,
  type FormSchema,
  type PermissionFields,
} from "../types/systemModule";
import type { UseFormReturn } from "react-hook-form";
import { handleDashboardChange } from "./systemModuleutils";

interface ModuleCheckboxGroupProps {
  index: number;
  module: FormSchema["modules"][number];
  form: UseFormReturn<FormSchema>;
}

export function ModuleCheckboxGroup({
  index,
  module,
  form,
}: ModuleCheckboxGroupProps) {
  const { setValue } = form;

  return (
    <div className="grid grid-cols-4 gap-4 items-center">
      <FormField
        control={form.control}
        name={`modules.${index}.name` as const}
        render={() => (
          <FormItem className="col-span-1 space-y-0">
            <FormLabel className="flex items-center space-x-2">
              <Checkbox
                checked={module.GET && module.POST && module.DELETE}
                onCheckedChange={(checked) =>
                  handleDashboardChange(
                    index,
                    checked === true,
                    (name, value) => setValue(name as PermissionFields, value),
                  )
                }
              />
              <span>{module.name}</span>
            </FormLabel>
          </FormItem>
        )}
      />
      {(["GET", "POST", "DELETE"] as const).map((permission) => (
        <FormField
          key={permission}
          control={form.control}
          name={`modules.${index}.${permission}` as const}
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FormControl>
                <FormLabel className="flex items-center space-x-2">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <span className="text-sm text-muted-foreground">
                    {permissionLabels[permission]}
                  </span>
                </FormLabel>
              </FormControl>
            </FormItem>
          )}
        />
      ))}
    </div>
  );
}
