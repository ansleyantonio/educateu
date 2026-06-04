"use client";
import { Check } from 'lucide-react';
import { Button } from "@/components/ui/button";

const GraduationEligibilityTab = () => {
  return (
    <div className="p-4 mt-8">
      <h3 className="font-[1000] text-2xl mb-4">
        Graduation Eligibility & Completion Status
      </h3>
      <p className="text-[15px] font-bold mb-2">Course Completion Checklist</p>

      <div className="bg-[#F0FDF4] p-4 rounded-lg mb-4">
        <div className="flex justify-between">
          <div className="flex flex-col">
            <p className="text-sm font-medium">
              Completed vs. Remaining Modules
            </p>
          </div>

          <div className="flex flex-col text-right">
            <p className="text-sm font-bold">6/8(2 remaining)</p>
          </div>
        </div>
      </div>

      <div className="bg-[#F0FDF4] p-4 rounded-lg mb-4">
        <div className="flex justify-between">
          <div className="flex flex-col">
            <p className="text-sm font-medium">Minimum GPA Requirement Met?</p>
          </div>

          <div className="flex flex-col text-right">
            <p className="text-sm font-bold"> <Check className='text-[#16A34A]'/></p>
          </div>
        </div>
      </div>

      <Button type="submit" variant="primary">
        Generate Transcript
      </Button>
    </div>
  );
};

export default GraduationEligibilityTab;
