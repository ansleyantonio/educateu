/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { IProfessionalCertificateModuleForm } from "../../schemas/moduleSchema";
import { ProfessionalCertificateModuleDefaultValue } from "../../utils/professional_certificate_moduleDefaultValue";
import Form_field from "../formField/form_field";

const ViewProfessionalCertificateModuleFrom = ({
  setOpen,
  data,
}: {
  setOpen: any;
  data: any;
}) => {
  const form = useForm<IProfessionalCertificateModuleForm>({
    // resolver: zodResolver(ProfessionalCertificateModuleSchema.update),
    defaultValues: ProfessionalCertificateModuleDefaultValue(data),
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

export default ViewProfessionalCertificateModuleFrom;
