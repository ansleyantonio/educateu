/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input } from "@/components/ui/custom_ui/input";
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
import { IFilterLists } from "./data_type";

interface ApplicantTableFilterProps {
  setFilterLists: (filterLists: IFilterLists | undefined) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (isFilterOpen: boolean) => void;
}

// Define schema for all filter fields
const formSchema = z.object({
  agent: z.string().optional(),
  subAgent: z.string().optional(),
  organization: z.string().optional(),
  admissionOfficer: z.string().optional(),
  awardingBody: z.string().optional(),
  programCourse: z.string().optional(),
  academicSession: z.string().optional(),
  year: z.string().optional(),
  applicationStatus: z.string().optional(),
  applicationDateRange: z.string().optional(),
  nationality: z.string().optional(),
  interviewStatus: z.string().optional(),
  onlineAssessmentStatus: z.string().optional(),
  additionalFileCheck: z.string().optional(),
  additionalStages: z.string().optional(),
});

export function ApplicantTableFilter({
  setFilterLists,
  isFilterOpen,
  setIsFilterOpen,
}: ApplicantTableFilterProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      agent: "",
      subAgent: "",
      organization: "",
      admissionOfficer: "",
      awardingBody: "",
      programCourse: "",
      academicSession: "",
      year: "",
      applicationStatus: "",
      applicationDateRange: "",
      nationality: "",
      interviewStatus: "",
      onlineAssessmentStatus: "",
      additionalFileCheck: "",
      additionalStages: "",
    },
  });

  // Submit handler to set the filters
  function onSubmit(values: z.infer<typeof formSchema>) {
    setFilterLists(values);
    setIsFilterOpen(false);
    console.log(values);
  }

  // Reset handler to clear all filters
  const handleResetFilters = () => {
    setFilterLists(undefined);
    form.reset();
    setIsFilterOpen(false);
  };

  // Example options for dropdowns
  const exampleOptions = [
    { value: "Option 1", label: "Option 1" },
    { value: "Option 2", label: "Option 2" },
  ];

  return (
    <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
      <SheetContent className="overflow-y-auto max-h-screen">
        <div className="pb-20 h-full">
          <SheetHeader>
            <SheetTitle>Filter Applicants</SheetTitle>
          </SheetHeader>
          <div className="grid gap-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {Object.keys(formSchema.shape).map((field) => (
                  <FormField
                    key={field}
                    control={form.control}
                    name={field as keyof z.infer<typeof formSchema>}
                    render={({ field: formField }) => (
                      <FormItem>
                        <label className="capitalize cusFormLabel">
                          {field.replace(/([A-Z])/g, " $1")}
                        </label>
                        {field === "applicationDateRange" ? (
                          <Input
                            placeholder={`Enter ${field}`}
                            {...formField}
                            value={formField.value || ""}
                          />
                        ) : (
                          <SelectComponent
                            options={exampleOptions}
                            placeholder={`Select ${field}`}
                            value={formField.value || ""}
                            onChange={formField.onChange}
                          />
                        )}
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
