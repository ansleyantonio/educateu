/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  AdvanceModuleSchema,
  IAdvanceModuleForm,
} from "../../schemas/moduleSchema";
import { AdvanceModuleDefaultValue } from "../../utils/advanceModuleDefaultValue";
import Form_field from "../formField/form_field";

const ViewAdvanceModuleFrom = ({
  isEdit,
  setOpen,
  data,
}: {
  isEdit: boolean;
  setOpen: any;
  data: any;
}) => {
  const form = useForm<IAdvanceModuleForm>({
    resolver: zodResolver(AdvanceModuleSchema.update),
    defaultValues: AdvanceModuleDefaultValue(data),
    // defaultValues: {

    // } ,
  });

  return (
    <Form {...form}>
      <form className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <Form_field viewOnly={isEdit} form={form} />
        </div>

        {/* login button  */}
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

export default ViewAdvanceModuleFrom;
