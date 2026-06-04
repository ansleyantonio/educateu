/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import RegistrationDialogContent from "./RegistrationDialog/RegistrationDialog";
import { Button } from "@/components/ui/custom_ui/button";
import dateFormat from "@/utils/DateFormatter";

interface RegistrationDetailsTabProps {
  mode?: string;
  regDetails?: any;
}

const RegistrationDetailsTab = ({
  mode,
  regDetails,
}: RegistrationDetailsTabProps) => {
  console.log(regDetails, "Registration Details");
  return (
    <div className="p-4 mt-8">
      <div className="p-5 w-full bg-white rounded-xl border shadow-sm">
        <div className="pb-2 mb-4 border-b border-gray-200">
          <div className="grid grid-cols-3 gap-4 font-medium text-gray-500">
            <p className="text-[15px]">Course Title</p>
            <p className="text-[15px]">Course Duration</p>
            <p className="text-[15px]">Actions</p>
          </div>
        </div>

        <Dialog>
          <div className="grid grid-cols-3 gap-4 items-start">
            {/* Trigger 1: Clickable course info */}
            <DialogTrigger asChild>
              <div className="cursor-pointer">
                <p className="text-sm font-medium text-blue-700 hover:underline">
                  {regDetails?.course?.title || "Course Title Not Available"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {regDetails?.course?.durationLength ||
                    "Course Duration Not Available"}{" "}
                  Years
                </p>
              </div>
            </DialogTrigger>

            <div>
              <p className="text-sm font-medium text-gray-900">
                {dateFormat.duration(new Date(), regDetails?.course?.endDate)}
              </p>
              <p className="text-xs text-muted-foreground">
                {dateFormat.customFormatDate(
                  regDetails?.course?.startDate,
                  "DD-MM-YYYY",
                )}{" "}
                -{" "}
                {dateFormat.customFormatDate(
                  regDetails?.course?.endDate,
                  "DD-MM-YYYY",
                ) || "End Date Not Available"}
              </p>
            </div>

            {/* Trigger 2: Button */}
            <DialogTrigger asChild>
              <div className="w-fit">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </DialogTrigger>
          </div>

          {/* Shared Dialog content */}
          <RegistrationDialogContent regDetails={regDetails} />
        </Dialog>
      </div>
    </div>
  );
};

export default RegistrationDetailsTab;
