"use client";
import { Card } from "@/components/ui/card";

const EngagementBreakDown = () => {
  return (
    <Card className="p-4 mt-4">
      <h3 className="font-bold text-md mb-4">Engagement Breakdown</h3>

      <div className="grid grid-cols-4 gap-2 items-start">
          <div>
            <p className="text-[15px] text-gray-500 font-medium">Login Frequency</p>
            <p className="text-xl">15 logins</p>
            <p className="text-sm text-gray-500 font-medium">From start of course</p>
          </div>
          <div>
            <p className="text-[15px] text-gray-500 font-medium">Time Spent on Platform</p>
            <p className="text-xl">45 hours</p>
            <p className="text-sm text-gray-500 font-medium">From start of course</p>
          </div>
          <div>
            <p className="text-[15px] text-gray-500 font-medium">Course Access Rate</p>
            <p className="text-xl">65%</p>
            <p className="text-sm text-gray-500 font-medium">Assigned modules viewed</p>
          </div>
          <div>
            <p className="text-[15px] text-gray-500 font-medium">Assignment Submission Rate</p>
            <p className="text-xl">70%</p>
            <p className="text-sm text-gray-500 font-medium">On-time submissions</p>
          </div>
      </div>
    </Card>
  );
};

export default EngagementBreakDown;
