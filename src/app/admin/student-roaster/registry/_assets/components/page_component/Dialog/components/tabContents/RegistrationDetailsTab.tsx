"use client";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import RegistrationDialogContent from "./RegistrationDialog/RegistrationDialog";
import { Button } from "@/components/ui/custom_ui/button";

const RegistrationDetailsTab = () => {
  return (
    <div className="p-4 mt-8">
      <div className="w-full p-5 border rounded-xl bg-white shadow-sm">
        <div className="border-b border-gray-200 pb-2 mb-4">
          <div className="grid grid-cols-3 gap-4 text-gray-500 font-medium">
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
                <p className="text-sm text-blue-700 font-medium hover:underline">
                  Business Administration
                </p>
                <p className="text-xs text-muted-foreground">
                  University of Excellence
                </p>
              </div>
            </DialogTrigger>

            <div>
              <p className="text-sm font-medium text-gray-900">
                2 years 0 months
              </p>
              <p className="text-xs text-muted-foreground">
                2/1/2024 - 1/31/2026
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
          <RegistrationDialogContent />
        </Dialog>
      </div>
    </div>
  );
};

export default RegistrationDetailsTab;
