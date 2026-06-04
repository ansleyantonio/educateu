"use client";
import ActionButton from "@/components/common/button/actionButton";
import { CustomField } from "@/components/common/fields/cusInputField";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, CircleCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  I_InvoiceUpdate_Form,
  InvoiceSchema,
} from "../../schemas/updateInvoiceSchema";
import InvoiceModal from "./invoiceModal";

interface InvoiceActionProps {
  invoiceIds: string[];
}

const InvoiceAction = ({ invoiceIds }: InvoiceActionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState<I_InvoiceUpdate_Form>();

  // invoiceStatus
  const form = useForm<I_InvoiceUpdate_Form>({
    resolver: zodResolver(InvoiceSchema.updateInvoiceStatusSchema),
    defaultValues: {
      invoiceIds,
      invoiceStatus: "",
      note: "",
    },
    mode: "onChange",
  });

  form.setValue("invoiceIds", invoiceIds);

  const setStatus = (value: string) => {
    form.setValue("invoiceStatus", value);
  };

  const onSubmit = (values: I_InvoiceUpdate_Form) => {
    setValue(values);
    setIsOpen(true);
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <ActionButton
            handleOpen={() => {
              setStatus("APPROVED");
              form.handleSubmit(onSubmit);
            }}
            buttonContent="Approve"
            variant="outline"
            icon={<CircleCheck size={24} strokeWidth={2} />}
            btnStyle="font-semibold text-gray-600 w-full"
            lastIcon={<ChevronRight className="ml-auto" />}
          />

          <CustomField.TextArea
            form={form}
            labelName="Invoice Info"
            name="note"
            placeholder="Write here comments for required."
          />

          <ActionButton
            handleOpen={() => {
              setStatus("REJECTED");
              form.handleSubmit(onSubmit);
            }}
            type="submit"
            buttonContent="Reject"
            variant="outline"
            icon={<CircleCheck size={24} strokeWidth={2} />}
            btnStyle="font-semibold  text-gray-600 w-full"
            lastIcon={<ChevronRight className="ml-auto" />}
          />
        </form>
      </Form>
      <InvoiceModal value={value} isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  );
};

export default InvoiceAction;
