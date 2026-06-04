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
import { AuditLogFilterFormSchema } from "@/app/admin/user-management/audit-logging/_assets/utils/auditLogFilter";
import dateFormat from "@/utils/DateFormatter";

interface AuditLogFilterProps {
  form: UseFormReturn<any, any>;
  setFilter: (filter: any) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (isFilterOpen: boolean) => void;
}

export function AuditLogFilter({
  form,
  setFilter,
  isFilterOpen,
  setIsFilterOpen,
}: AuditLogFilterProps) {
  const onSubmit = (values: z.infer<typeof AuditLogFilterFormSchema>) => {
    const formatted = {
      ...values,
      startDate: values.startDate
        ? dateFormat.customFormatDate(values.startDate)
        : undefined,
      endDate: values.endDate
        ? dateFormat.customFormatDate(values.endDate)
        : undefined,
    };

    setFilter(formatted);
    setIsFilterOpen(false);
  };

  return (
    <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
      <SheetContent className="overflow-y-auto max-h-screen">
        <div className="pb-20 h-full">
          <SheetHeader>
            <SheetTitle>Filter Applicants</SheetTitle>
          </SheetHeader>
          <FormProvider {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-9 space-y-4"
            >
              <CustomField.MultiCheckField
                form={form}
                name="actionTypes"
                labelName="Action Types"
                options={actionTypes}
                placeholder="Select an option"
              />

              <CustomField.DatePickerAnd
                form={form}
                name="startDate"
                labelName="Start Date"
                placeholder="Select an option"
              />
              <CustomField.DatePickerAnd
                form={form}
                name="endDate"
                labelName="End Date"
                placeholder="Select an option"
              />
              {/* <CustomField.Text */}
              {/*   form={form} */}
              {/*   name="name" */}
              {/*   labelName="Name" */}
              {/*   placeholder="Enter name" */}
              {/* /> */}
              <div className="flex justify-between items-center mt-6">
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

const actionTypes = [
  { label: "User Creation", value: "user_creation" },
  { label: "User Update", value: "user_update" },
  { label: "Successful Login", value: "success_login" },
  { label: "Failed Login", value: "failed_login" },
  { label: "Password Reset by Admin", value: "password_reset" },
  { label: "Module &  Permission Assignments", value: "module_permission" },
  { label: "Role Assignment", value: "role_assign" },
  { label: "User Activation", value: "user_activation" },
  { label: "User Deactivation", value: "user_deactivation" },
];
