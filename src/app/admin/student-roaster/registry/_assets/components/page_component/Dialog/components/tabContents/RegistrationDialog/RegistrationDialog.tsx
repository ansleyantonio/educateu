"use client";

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const RegistrationDialogContent = () => {
  return (
    <DialogContent className="max-w-md sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>Migration Data - Business Administration</DialogTitle>
        <DialogDescription>
          Detailed course and financial information.
        </DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
        <div>
          <p className="font-semibold">Course Enrolled</p>
          <p>Business Administration</p>
        </div>
        <div>
          <p className="font-semibold">Course Start Date</p>
          <p>2/1/2024</p>
        </div>
        <div>
          <p className="font-semibold">Expected End Date</p>
          <p>1/31/2026</p>
        </div>
        <div>
          <p className="font-semibold">Course Fee (Gross)</p>
          <p>£15,000</p>
        </div>
        <div>
          <p className="font-semibold">Waiver/Discount</p>
          <p>£2,000</p>
        </div>
        <div>
          <p className="font-semibold">Source of Funds</p>
          <p>Self-funded</p>
        </div>
        <div>
          <p className="font-semibold">Year of Entry</p>
          <p>First Year</p>
        </div>
        <div>
          <p className="font-semibold">Net Fee</p>
          <p>£13,000</p>
        </div>
      </div>
    </DialogContent>
  );
};

export default RegistrationDialogContent;