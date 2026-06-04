/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useSearchParams } from "next/navigation";
import { CustomField } from "@/components/common/fields/cusInputField";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  ManualPaymentSchema,
  IManualPaymentForm,
} from "../schemas/manualPaymentSchema";
import onFormError from "@/utils/formError";
import { PublicUpload } from "@/components/common/fields/assets/components/FileUpload/PublicUpload";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";

const Page = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const applicationIdFromUrl = params.applicationId as string;
  const amountFromUrl = searchParams.get("amount");
  const currencyFromUrl = searchParams.get("currency");
  const semesterFeeFromUrl = searchParams.get("semester");

  const form = useForm<IManualPaymentForm>({
    resolver: zodResolver(ManualPaymentSchema),
    defaultValues: {
      paymentType: "FULL",
      accountNo: "",
      accountName: "",
      referenceNo: "",
      bankName: "",
      currency: currencyFromUrl || undefined,
      amount: amountFromUrl ? Number(amountFromUrl) : undefined,
      applicationId: applicationIdFromUrl || "",
      receipts: "",
    },
  });

  useEffect(() => {
    if (applicationIdFromUrl)
      form.setValue("applicationId", applicationIdFromUrl);
    if (currencyFromUrl) form.setValue("currency", currencyFromUrl);
    if (form.watch("paymentType") === "SEMESTER") {
      form.setValue("amount", Number(semesterFeeFromUrl));
    } else {
      form.setValue("amount", Number(amountFromUrl));
    }
  }, [form.watch("paymentType")]);

  const createManualPayment = useApiMutation({
    method: "POST",
    path: "manual-payments/create-manual-payment",
    isSuccessToast: true,
    isErrorToast: true,
    onSuccess: () => {
      setTimeout(() => {
        router.push(`/manual-payment/${applicationIdFromUrl}/success`);
        form.reset();
      }, 1000);
    },
  });

  const onSubmit = async (values: IManualPaymentForm) => {
    createManualPayment.mutate(values);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      {createManualPayment.isPending && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="px-6 py-4 bg-white rounded-lg shadow text-xl font-semibold animate-pulse">
            Processing Payment...
          </div>
        </div>
      )}

      <div className="w-full max-w-3xl bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Manual Payment Form
        </h2>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onFormError)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <CustomField.Text
                form={form}
                name="applicationId"
                labelName="Application ID"
                placeholder="Enter Application ID"
                disabled
              />
              <CustomField.SelectField
                form={form}
                name="paymentType"
                labelName="Payment Type"
                placeholder="Select Payment Type"
                options={[
                  { label: "Full", value: "FULL" },
                  { label: "Semester", value: "SEMESTER" },
                ]}
              />
              <CustomField.Text
                form={form}
                name="accountNo"
                labelName="Sender Account No"
                placeholder="Enter Account No"
              />
              <CustomField.Text
                form={form}
                name="accountName"
                labelName="Sender Account Name"
                placeholder="Enter Account Name"
              />
              <CustomField.Text
                form={form}
                name="referenceNo"
                labelName="Reference No"
                placeholder="Enter Reference No"
              />
              <CustomField.Text
                form={form}
                name="bankName"
                labelName="Bank Name"
                placeholder="Enter Bank Name"
              />
              <CustomField.SelectField
                form={form}
                name="currency"
                labelName="Currency"
                placeholder="Select Currency"
                options={[
                  { label: "USD", value: "USD" },
                  { label: "GBP", value: "GBP" },
                  { label: "EURO", value: "EURO" },
                  { label: "BDT", value: "BDT" },
                ]}
                disabled
              />
              <CustomField.Number
                form={form}
                name="amount"
                labelName="Amount"
                placeholder="Enter Amount"
                viewOnly={true}
              />
            </div>

            <div className="mt-4">
              <FormField
                control={form.control}
                name="receipts"
                render={() => (
                  <FormItem className="mt-4">
                    <PublicUpload
                      label="Upload Receipt"
                      defaultUrl={form.getValues("receipts")}
                      onUploadComplete={(url) => {
                        form.setValue("receipts", url, {
                          shouldValidate: true,
                        });
                      }}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-center mt-6">
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                Submit Payment Info
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Page;
