/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/custom_ui/sheet";
import { z } from "zod";
import { FormProvider, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/custom_ui/button";
import { CustomField } from "@/components/common/fields/cusInputField";
import { AwardingBodyFilterSchema } from "../../interface/CreateAwardingBodySchema";
import { MonthEnum, RequiredDocumentEnum } from "../../interface/CreateAwardingBodySchema";

interface AwardingBodyFilterProps {
  form: UseFormReturn<any, any>;
  setFilter: (filter: any) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (isFilterOpen: boolean) => void;
}

const selectedRequiredDocuments = RequiredDocumentEnum.options.map((doc) => ({
  label: doc
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" "),
  value: doc,
}));

const selectedMonthOptions = MonthEnum.options.map((month) => ({
  label: month
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" "),
  value: month,
}));

export function AwardingBodyFilter({
  form,
  setFilter,
  isFilterOpen,
  setIsFilterOpen,
}: AwardingBodyFilterProps) {
  const onSubmit = (values: z.infer<typeof AwardingBodyFilterSchema>) => {
    setFilter(values);
    setIsFilterOpen(false);
  };

  return (
    <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
      <SheetContent className="overflow-y-auto max-h-screen">
        <div className="pb-20 h-full">
          <SheetHeader>
            <SheetTitle>Filter Awarding Bodies</SheetTitle>
          </SheetHeader>

          <FormProvider {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-9 space-y-4"
            >
              {/* Intake Period Multi-Select */}
              <CustomField.MultiCheckField
                form={form}
                name="intakePeriod"
                labelName="Intake Period"
                options={selectedMonthOptions}
                placeholder="Select intake periods"
              />

              <CustomField.MultiCheckField
                form={form}
                name="selectRequiredDocuments"
                labelName="Required Documents"
                options={selectedRequiredDocuments}
                placeholder="Select documents"
              />

              <div className="flex justify-end items-center gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    form.reset();
                  }}
                >
                  Clear
                </Button>

                <Button type="submit" variant="primary">
                  Apply
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </SheetContent>
    </Sheet>
  );
}