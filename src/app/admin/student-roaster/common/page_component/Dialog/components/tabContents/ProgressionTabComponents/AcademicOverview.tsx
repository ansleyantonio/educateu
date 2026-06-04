"use client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/custom_ui/button";

type AcademicOverviewProps = {
  mode?: string;
};

const AcademicOverview = ({ mode }: AcademicOverviewProps) => {
  // console.log("MODE in oveview", mode)
  const gridCols = mode === "support" ? "grid-cols-2" : "grid-cols-3";

  return (
    <Card className="p-4 mt-4">
      <h3 className="font-bold text-md mb-4">
        Course & Academic Standing Overview
      </h3>

      <div className={`grid ${gridCols} gap-8 items-start`}>
        <div className="space-y-2 col-span-1">
          <p className="text-[15px] text-gray-500 font-medium">
            Current Status
          </p>
          <p className="text-[15px] font-bold">Active Student</p>

          <p className="text-[15px] text-gray-500 font-medium">Course Name</p>
          <p className="text-[15px] font-medium">Business Administration</p>

          <p className="text-[15px] text-gray-500 font-medium">
            Credits Progress
          </p>
          <p className="text-[15px] font-medium">90/120 Credits</p>

          {mode === "registry" && (
            <div className="col-span-3">
              <Progress value={60} />
            </div>
          )}
        </div>

        {mode === "registry" && (
          <div className="flex items-start pt-1">
            <Button variant="outline" size="sm">
              Change Status
            </Button>
          </div>
        )}

        <div className="space-y-2 col-span-1">
          <p className="text-[15px] text-gray-500 font-medium">Overall GPA</p>
          <p className="text-[15px] font-bold">3.6</p>

          <p className="text-[15px] text-gray-500 font-medium">
            Expected Completion
          </p>
          <p className="text-[15px] font-medium">1/31/2026</p>
        </div>
      </div>
    </Card>
  );
};

export default AcademicOverview;