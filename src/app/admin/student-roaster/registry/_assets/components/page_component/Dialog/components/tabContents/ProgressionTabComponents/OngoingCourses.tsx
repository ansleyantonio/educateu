"use client";
import { Card } from "@/components/ui/card";
import StatusBadge from "@/utils/StatusBadge/StatusBadge";

const OngoingCourses = () => {
  return (
    <div className="p-4 mt-8">
      <h3 className="font-[1000] text-2xl mb-4">Ongoing Courses</h3>
      <Card className="p-4">
        <div className="mt-4 rounded-lg mb-4">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <p className="text-sm font-medium">International Business</p>
            </div>

            <div className="flex flex-col text-right">
              <p className="text-sm font-bold">GPA: 3.8</p>
              <p className="text-sm text-muted-foreground">15 Credits</p>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg mb-4">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
                <p className="text-sm text-muted-foreground">Course Modules</p>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center">
                <StatusBadge status="success" label="Completed" />
                <p className="text-sm text-muted-foreground">Global markets</p>
            </div>

            <div className="flex flex-col text-right">
              <p className="text-sm font-bold">GPA: 3.5 | 5 Credits</p>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-4">
                <StatusBadge status="pending" label="Awaiting Result" />
                <p className="text-sm text-muted-foreground">Global markets</p>
            </div>

            <div className="flex flex-col text-right">
              <p className="text-sm font-bold">5 Credits</p>
            </div>
          </div>


        </div>

      </Card>
    </div>
  );
};

export default OngoingCourses;
