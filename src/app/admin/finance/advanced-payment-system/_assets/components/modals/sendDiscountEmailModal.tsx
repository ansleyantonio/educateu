"use client";
import { useState, useEffect } from "react";
import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { useAuths } from "@/hooks/userContext";
import { CustomField } from "@/components/common/fields/cusInputField";
import { useForm, FormProvider } from "react-hook-form";

interface DiscountForm {
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number | "";
}

export function SendDiscountEmailModal({ emails }: { emails: string[] }) {
  const [open, setOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { editAccess } = useAuths();

  const form = useForm<DiscountForm>({
    defaultValues: {
      discountType: "PERCENTAGE",
      discountValue: "",
    },
  });

  const discountType = form.watch("discountType");
  const discountValue = form.watch("discountValue");

  const handleOpen = () => setOpen(!open);

  useEffect(() => {
    form.setValue("discountValue", "");
    form.clearErrors("discountValue");
  }, [discountType]);

  useEffect(() => {
    if (discountType === "PERCENTAGE" && discountValue !== "") {
      if (discountValue < 1 || discountValue > 100) {
        form.setError("discountValue", {
          type: "manual",
          message: "Percentage must be between 1 and 100",
        });
      } else {
        form.clearErrors("discountValue");
      }
    }
  }, [discountValue, discountType, form]);

  const handleSendEmail = async (values: DiscountForm) => {
    try {
      setIsSending(true);
      console.log("📤 Sending discount emails to:", emails);
      console.log("📨 Discount Data:", values);

      await new Promise((res) => setTimeout(res, 1200));
      console.log("✅ Discount emails sent successfully!");
      setOpen(false);
    } catch (error) {
      console.error("❌ Failed to send discount emails:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <DialogWrapper
      open={open}
      handleOpen={handleOpen}
      triggerContent={
        <ActionButton
          disabled={!editAccess || emails.length === 0}
          btnSize="lg"
          handleOpen={handleOpen}
          variant="outline"
          btnStyle="font-semibold text-gray-600"
          buttonContent="Send Discount Email"
        />
      }
      style="min-w-[40%]"
    >
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSendEmail)} className="space-y-6">
          <p className="text-lg font-semibold leading-none tracking-tight">
            Send Discount Email
          </p>

          <p className="text-sm text-gray-600">
            You’re about to send discount emails to{" "}
            <span className="font-semibold">{emails.length}</span>{" "}
            recipient{emails.length > 1 ? "s" : ""}.
          </p>

          <CustomField.SelectField
            form={form}
            name="discountType"
            labelName="Discount Type"
            placeholder="Select type"
            // options={["PERCENTAGE", "FIXED_AMOUNT"]}
            options={[
              { label: "Percentage", value: "PERCENTAGE" },
              { label: "Fixed Amount", value: "FIXED_AMOUNT" },
            ]}
          />

          <CustomField.Number
            form={form}
            name="discountValue"
            labelName={
              discountType === "PERCENTAGE"
                ? "Discount (%)"
                : "Discount Amount"
            }
            placeholder={
              discountType === "PERCENTAGE"
                ? "Enter percentage (1-100)"
                : "Enter fixed amount"
            }
            numberType="float"
            optional={false}
          />

          <div className="flex justify-end gap-3 pt-4">
            <ActionButton
              type="submit"
              isPending={isSending}
              loadingContent="Sending..."
              buttonContent="Send Now"
            />
            <ActionButton
              handleOpen={() => setOpen(false)}
              variant="outline"
              buttonContent="Cancel"
            />
          </div>
        </form>
      </FormProvider>
    </DialogWrapper>
  );
}