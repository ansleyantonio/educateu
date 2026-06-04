/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { useState } from "react";
import discount from "/public/assets/logo/agent/admin/discount.svg";

// ---------------- Promo Code Modal ----------------
export function PromoCodeModal() {
  const [open, setOpen] = useState(false);

  const promoCodes = [
    { code: "Earlybird 2025", type: "Early Bird", value: "15%" },
    { code: "Earlybird 2025", type: "Percent", value: "15%" },
    { code: "Earlybird 2025", type: "Early Bird", value: "15%" },
  ];
const handleOpen = () => {
    setOpen(!open);
  };
  return (
    <DialogWrapper
              triggerContent={
                <ActionButton
                      variant="icon"
                      tooltipContent="Promo Discount"
                      imageSrc={discount}
          handleOpen={handleOpen}
           />
              }
              title="Promo Discount"
              open={open}
              handleOpen={handleOpen}
              style="min-w-[65%]"
            >
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
            </DialogWrapper>
  );
}


