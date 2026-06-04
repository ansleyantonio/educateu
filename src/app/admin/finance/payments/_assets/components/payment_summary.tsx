"use client";
import { Button } from "@/components/ui/custom_ui/button";
import { Card, CardContent } from "@/components/ui/custom_ui/customCard";
import { Input } from "@/components/ui/custom_ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import PaymentImage from "/public/assets/logo/admin/paymentImage.jpg"

interface CourseData {
  title: string;
  subtitle: string;
  originalPrice: number;
  discount: number;
  totalPrice: number;
}
type PaymentSummaryProps = {
  courseData: CourseData;
};

export default function PaymentSummary({ courseData }: PaymentSummaryProps) {
  const [couponCode, setCouponCode] = useState("");
  const applyCoupon = () => {
    // Coupon application logic would go here
    console.log("Applying coupon:", couponCode);
  };
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-0">
          <div className="relative p-4">
            <Image
              src={PaymentImage}
              alt="Course preview"
              width={400}
              height={200}
              className="w-full h-48 object-cover rounded-lg border-2 border-primary"
            />
          </div>
          <div className="p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                {courseData.title}
              </h3>
              <p className="text-sm text-gray-600">{courseData.subtitle}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Original Price</span>
                <span className="font-medium">
                  ${courseData.originalPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Discount Price</span>
                <span className="font-medium">
                  -${courseData.discount.toFixed(2)}
                </span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Price</span>
                <span>${courseData.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="coupon">Have a Coupon Code?</Label>
              <div className="flex gap-2">
                <Input
                  id="coupon"
                  placeholder="Earlybird 2025"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={applyCoupon}
                  className=" text-white px-6"
                  variant="primary"
                >
                  Apply
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg flex items-center justify-center gap-2 py-3">
              <div className="flex items-center gap-2 text-sm text-primary">
                <Lock className="h-4 w-4" />
              </div>
              <p className="text-sm text-primary mt-1">
                <span className="font-medium text-lg">Secure Payment</span> <br/>
                <span className="font-medium text-sm">Protected with end-to-end encryption</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
