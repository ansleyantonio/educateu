"use client";

import type { ReactNode } from "react";

interface WarningProps {
  icon?: ReactNode;
  message?: string;
  condition?: string;
}

const Warning = ({ icon, message, condition }: WarningProps) => {
  return (
    <div className="p-2 mb-2 flex items-center justify-between bg-[#FECACA] rounded">
      <div className="flex items-center gap-2">
        <span className="text-[#DC2626]">{icon}</span>
        <span className="text-[#991B1B]">{message}</span>
      </div>
      {condition && (
        <span className="bg-[#EF4444] text-[#F8FAFC] text-sm px-3 py-1 rounded-full">
          {condition}
        </span>
      )}
    </div>
  );
};

export default Warning;