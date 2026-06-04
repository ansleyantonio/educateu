/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/custom_ui/sheet";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { SelectComponent } from "@/components/common/fields/select_component";

// Define the filter schema dynamically
const createFilterSchema = (fields: string[]) => {
  const schema = fields.reduce(
    (acc, field) => {
      acc[field] = z.string().optional();
      return acc;
    },
    {} as Record<string, any>,
  );
  return z.object(schema);
};

interface FilterOption {
  value: string;
  label: string;
}

interface ApplicantTableFilterProps {
  filterFields: {
    field: string;
    label: string;
    options: FilterOption[];
  }[];
  onApplyFilter: (filters: Record<string, string>) => void;
  onResetFilter: () => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (isOpen: boolean) => void;
}

export function ApplicantTableFilter({
  filterFields,
  onApplyFilter,
  onResetFilter,
  isFilterOpen,
  setIsFilterOpen,
}: ApplicantTableFilterProps) {
  // Dynamically create the form schema based on filter fields
  const formSchema = createFilterSchema(filterFields.map((f) => f.field));

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: filterFields.reduce(
      (acc, field) => {
        acc[field.field] = "";
        return acc;
      },
      {} as Record<string, string>,
    ),
  });

  // Submit handler to apply filters
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onApplyFilter(values);
    setIsFilterOpen(false);
  };

  // Reset handler to clear all filters
  const handleResetFilters = () => {
    form.reset();
    onResetFilter();
    setIsFilterOpen(false);
  };

  return (
    <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
      <SheetContent className="overflow-y-auto max-h-screen">
        <div className="pb-20 h-full">
          <SheetHeader>
            <SheetTitle>Filter</SheetTitle>
          </SheetHeader>
          <div className="grid gap-4 mt-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {filterFields.map(({ field, label, options }) => (
                  <FormField
                    key={field}
                    control={form.control}
                    name={field as string}
                    render={({ field: formField }) => (
                      <FormItem>
                        <label className="capitalize cusFormLabel">
                          {label}
                        </label>
                        <SelectComponent
                          options={options}
                          placeholder={`Select ${label}`}
                          value={formField.value || ""}
                          onChange={formField.onChange}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  <Button
                    type="button"
                    onClick={handleResetFilters}
                    variant="outline"
                    className="font-semibold"
                  >
                    Reset
                  </Button>
                  <Button type="submit" className="font-semibold bg-blue-600">
                    Apply Filter
                  </Button>
                </div>
              </form>
            </Form>
          </div>
          <div className="h-10"></div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
