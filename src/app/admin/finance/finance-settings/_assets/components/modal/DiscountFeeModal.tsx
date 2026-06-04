/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { useState } from "react";
import discount from "/public/assets/logo/agent/admin/discount.svg";
import ActionButton from "@/components/common/button/actionButton";

// ---------------- Promo Code Modal ----------------
export function PromoCodeModal() {
  const [open, setOpen] = useState(false);

  const promoCodes = [
    { code: "Earlybird 2025", type: "Early Bird", value: "15%" },
    { code: "Earlybird 2025", type: "Percent", value: "15%" },
    { code: "Earlybird 2025", type: "Early Bird", value: "15%" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ActionButton
                      variant="icon"
                      tooltipContent="Promo Discount"
                      imageSrc={discount}
          handleOpen={() => setOpen(true)}
                    ></ActionButton>
      </DialogTrigger>

      <DialogContent className="w-full md:min-w-[65%] h-auto overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-bold text-base text-black">
            Promo Code
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {promoCodes.map((p, idx) => (
            <div
              key={idx}
              className="grid grid-cols-3 gap-4 border rounded-md p-3"
            >
              <div>
                <label className="text-sm font-medium">Code Name</label>
                <input
                  type="text"
                  value={p.code}
                  className="mt-1 w-full rounded-md border px-2 py-1 text-sm bg-gray-50"
                  readOnly
                />
              </div>
              <div>
                <label className="text-sm font-medium">Discount Type</label>
                <input
                  type="text"
                  value={p.type}
                  className="mt-1 w-full rounded-md border px-2 py-1 text-sm bg-gray-50"
                  readOnly
                />
              </div>
              <div>
                <label className="text-sm font-medium">Discount Value</label>
                <input
                  type="text"
                  value={p.value}
                  className="mt-1 w-full rounded-md border px-2 py-1 text-sm bg-gray-50"
                  readOnly
                />
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}