/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import CourseFinanceFormField from "../formField/CourseFinanceFormField";

const ViewCourseFeeForm = ({ setOpen, data }: { setOpen: any; data: any }) => {
  const form = useForm({
    defaultValues: {
      courseName: data.courseName,
      overallCourseFee: data.overallCourseFee,
      startDate: data.startDate,
      endDate: data.endDate,
      currencyType: data.currencyType,
      promoCodeStatus: data.promoCodeStatus,
    },
  });

  return (
    <Form {...form}>
      <form className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <CourseFinanceFormField form={form} viewOnly={true} />
        </div>
        <div className="flex gap-x-3 justify-end items-center">
          <Button
            onClick={() => setOpen(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ViewCourseFeeForm;
