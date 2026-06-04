import { Card, CardContent } from "@/components/ui/custom_ui/customCard";
import Image from "next/image";
import React from "react";

export default function PaymentMethodCard({
  icon,
  title,
  description,
  isSelected,
  onClick,
  imageSrc
}: {
  icon?: React.ReactNode;
  title: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
  imageSrc?: string;
}) {
  return (
    <Card
      className={`cursor-pointer transition-all ${
        isSelected ? "ring-2 ring-blue-500 bg-blue-50" : "hover:shadow-md"
      }`}
      onClick={onClick}
    >
      <CardContent className="p-6 text-center flex justify-between flex-col">
        <div className="flex justify-center mb-4">
          {imageSrc ? (
            <div className="border p-2 bg-white rounded-sm">
              <Image src={imageSrc} alt={title} width={20} height={20} className="object-contain" />
            </div>
          ) : (
            icon
          )}
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-xs text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
}
