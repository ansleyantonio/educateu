/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import discount from "/public/assets/logo/agent/admin/discount.svg";
import ActionButton from "@/components/common/button/actionButton";

export function PromoCodeModal({ data }: { data: any }) {
  const [open, setOpen] = useState(false);

  // Safely extract the promo codes array
  const promoCodes = data?.promotionalCodes ?? [];

  console.log(data, "dataaa")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ActionButton
          variant="icon"
          tooltipContent="Promo Discount"
          imageSrc={discount}
          handleOpen={() => setOpen(true)}
        />
      </DialogTrigger>

      <DialogContent className="w-full md:min-w-[65%] h-auto overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-bold text-base text-black">
            Promotional Code Status
          </DialogTitle>
        </DialogHeader>

        {promoCodes.length > 0 ? (
          <div className="space-y-4">
            {promoCodes.map((p: any, idx: number) => (
              <div
                key={p.id || idx}
                className="grid grid-cols-3 gap-4 border rounded-md p-3"
              >
                <div>
                  <label className="text-sm font-medium">Code Name</label>
                  <input
                    type="text"
                    value={p.codeName || "N/A"}
                    className="mt-1 w-full rounded-md border px-2 py-1 text-sm bg-gray-50"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Discount Type</label>
                  <input
                    type="text"
                    value={p.discountType || "N/A"}
                    className="mt-1 w-full rounded-md border px-2 py-1 text-sm bg-gray-50"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Discount Value</label>
                  <input
                    type="text"
                    value={
                      p.discountType === "PERCENTAGE"
                        ? `${p.discountValue}%`
                        : p.discountValue
                    }
                    className="mt-1 w-full rounded-md border px-2 py-1 text-sm bg-gray-50"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <input
                    type="text"
                    value={data.promoCodeStatus || "N/A"}
                    className="mt-1 w-full rounded-md border px-2 py-1 text-sm bg-gray-50"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <input
                    type="text"
                    value={
                      p.startDate
                        ? new Date(p.startDate).toLocaleDateString()
                        : "N/A"
                    }
                    className="mt-1 w-full rounded-md border px-2 py-1 text-sm bg-gray-50"
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <input
                    type="text"
                    value={
                      p.endDate
                        ? new Date(p.endDate).toLocaleDateString()
                        : "N/A"
                    }
                    className="mt-1 w-full rounded-md border px-2 py-1 text-sm bg-gray-50"
                    readOnly
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 text-center py-6">
            No promotional codes available.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
