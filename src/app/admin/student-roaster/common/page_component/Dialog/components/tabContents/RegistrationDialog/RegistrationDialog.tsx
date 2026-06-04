/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import dateFormat from "@/utils/DateFormatter";

interface RegistrationDetailsProps {
  regDetails?: any;
}
const RegistrationDialogContent = ({
  regDetails,
}: RegistrationDetailsProps) => {
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
          <p>{regDetails?.course?.title || "Course Title Not Available"}</p>
        </div>
        <div>
          <p className="font-semibold">Course Start Date</p>
          <p>
            {dateFormat.customFormatDate(
              regDetails?.course?.startDate,
              "DD-MM-YYYY",
            ) || "Start Date Not Available"}
          </p>
        </div>
        <div>
          <p className="font-semibold">Expected End Date</p>
          <p>
            {dateFormat.customFormatDate(
              regDetails?.course?.endDate,
              "DD-MM-YYYY",
            ) || "End Date Not Available"}
          </p>
        </div>
        <div>
          <p className="font-semibold">Course Fee (Gross)</p>
          <p>N/A</p>
        </div>
        <div>
          <p className="font-semibold">Waiver/Discount</p>
          <p>N/A</p>
        </div>
        <div>
          <p className="font-semibold">Source of Funds</p>
          <p>N/A</p>
        </div>
        <div>
          <p className="font-semibold">Year of Entry</p>
          <p>
            {dateFormat.customFormatDate(
              regDetails?.course?.startDate,
              "YYYY",
            ) || "Year of Entry Not Available"}
          </p>
        </div>
        <div>
          <p className="font-semibold">Net Fee</p>
          <p>N/A</p>
        </div>
      </div>
    </DialogContent>
  );
};

export default RegistrationDialogContent;

