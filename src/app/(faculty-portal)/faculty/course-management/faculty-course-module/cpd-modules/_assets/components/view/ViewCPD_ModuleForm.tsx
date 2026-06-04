/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { CPDModuleSchema, I_CPD_ModuleForm } from "../../schemas/moduleSchema";
import { CPD_ModuleDefaultValue } from "../../utils/cpd_ModuleDefaultValue";
import Form_field from "../formField/form_field";

const ViewCPD_ModuleFrom = ({ setOpen, data }: { setOpen: any; data: any }) => {
  const form = useForm<I_CPD_ModuleForm>({
    resolver: zodResolver(CPDModuleSchema.update),
    defaultValues: CPD_ModuleDefaultValue(data),
  });

  return (
    <Form {...form}>
      <form className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <Form_field viewOnly={true} form={form} />
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

export default ViewCPD_ModuleFrom;
