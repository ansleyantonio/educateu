"use client"

import type React from "react"
import { useState } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Upload, Lock, LockIcon } from "lucide-react"
import PaymentMethodCard from "../components/paymentCard"
import PaymentSummary from "../components/payment_summary"
import Bank from "/public/assets/logo/admin/Group.svg"
import Paypal from "/public/assets/logo/admin/paypal.svg"
import CreditCard from "/public/assets/logo/admin/Credit_card_fill.svg"
import { DynamicFileUploadField } from "@/components/common/fields/assets/components/FileUpload/DynamicFileUpload"
import { Form } from "@/components/ui/form"
import { CustomField } from "@/components/common/fields/cusInputField"
import Image from "next/image"

// ✅ Define form values type
type PaymentFormValues = {
  accountHolder: string
  bankName: string
  branchCode: string
  accountNumber: string
  swiftCode: string
  currency: string
  bankDocument?: File | null
  cardNumber?: string
  expiry?: string
  cvv?: string
  cardName?: string
}

const PaymentForm = () => {
  const [selectedMethod, setSelectedMethod] = useState("bank")

  // ✅ React Hook Form setup
  const form = useForm<PaymentFormValues>({
    defaultValues: {
      accountHolder: "",
      bankName: "",
      branchCode: "",
      accountNumber: "",
      swiftCode: "",
      currency: "",
      bankDocument: null,
    },
  })

  const onSubmit: SubmitHandler<PaymentFormValues> = (data) => {
    console.log("Form submitted:", data)
  }

  const courseData = {
    title: "Advanced Course Development",
    subtitle: "Professional Certification Course",
    originalPrice: 3000.0,
    discount: 500.0,
    totalPrice: 2500.0,
  }

  return (
    <Form {...form}>
      <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="max-w-6xl mx-auto p-6 space-y-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Payment Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Method Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PaymentMethodCard
              imageSrc={Bank}
              title="Bank Transfer"
              description="Manual verification required"
              isSelected={selectedMethod === "bank"}
              onClick={() => setSelectedMethod("bank")}
            />
            <PaymentMethodCard
              imageSrc={CreditCard}
              title="Credit/Debit Card"
              description="Pay securely with your card"
              isSelected={selectedMethod === "card"}
              onClick={() => setSelectedMethod("card")}
            />
            <PaymentMethodCard
              imageSrc={Paypal}
              title="PayPal"
              description="Fast and secure payment"
              isSelected={selectedMethod === "paypal"}
              onClick={() => setSelectedMethod("paypal")}
            />
          </div>

          {/* Bank Transfer Form */}
          {selectedMethod === "bank" && (
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <CustomField.Text
                      name="accountHolder"
                      labelName="Account Holder Name"
                      placeholder="As shown on your bank statement"
                      form={form}
                    />
                  </div>
                  <div>
                    <CustomField.Text
                      name="bankName"
                      labelName="Bank Name"
                      placeholder="First National Bank"
                      form={form}
                    />
                  </div>
                  <div>
                    <CustomField.Text
                      name="branchCode"
                      labelName="Branch / Bank Code"
                      placeholder="e.g. 0215"
                      form={form}
                    />
                  </div>
                  <div>
                    <CustomField.Text
                      name="accountNumber"
                      labelName="Account Number"
                      placeholder="e.g. 1234567890"
                      form={form}
                    />
                  </div>
                  <div>
                    <CustomField.Text
                      name="swiftCode"
                      labelName="SWIFT / BIC Code"
                      placeholder="e.g. NWBKGB2L"
                      form={form}
                      />
                  </div>
                  <div>
                    <CustomField.SelectField
                      name="currency"
                      labelName="Currency"
                      placeholder="Select currency"
                      form={form}
                      options={[
                        { value: "usd", label: "USD" },
                        { value: "eur", label: "EUR" },
                        { value: "gbp", label: "GBP" },
                        { value: "bdt", label: "BDT" },
                      ]}
                    />
                  </div>
                </div>

                {/* File Upload Section */}
                <DynamicFileUploadField
                  form={form}
                  name="bankDocument"
                  labelName="Upload Void Cheque / Bank Letter (optional but recommended)"
                  acceptedTypes="image-pdf"
                />

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full text-white py-3"
                >
                  Submit
                </Button>

                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Lock className="h-4 w-4" />
                  <span>Secure Payment</span>
                </div>
              </CardContent>
            </Card>
          )}
        {/* PayPal Form */}
        {selectedMethod === "card" && (
          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <div className="py-8 flex items-center justify-center flex-col gap-4">
                <Image src={CreditCard} alt="credit card" width={30} height={30} className="object-contain" />
                <p className="text-gray-600 mb-6">
                  You will be redirected to Secure gateway to complete your payment
                </p>
              </div>
              <Button variant="primary" className="w-full text-white py-3">
                Continue with Card
              </Button>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Lock className="h-4 w-4" />
                  <span>Secure Payment</span>
                </div>
            </CardContent>
          </Card>
        )}
        {selectedMethod === "paypal" && (
          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <div className="py-8 flex items-center justify-center flex-col gap-4">
                <Image src={Paypal} alt="paypal" width={50} height={50} className="object-contain" />
                <p className="text-gray-600 mb-6">
                  You will be redirected to PayPal to complete your payment
                </p>
              </div>
              <Button variant="primary" className="w-full text-white py-3">
                Continue with PayPal
              </Button>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Lock className="h-4 w-4" />
                  <span>Secure Payment</span>
                </div> 
            </CardContent>
          </Card>
        )}
      </div>

        {/* Right Column - Course Summary */}
        <PaymentSummary courseData={courseData} />
      </div>
    </form>
    </Form>
  )
}

export default PaymentForm
