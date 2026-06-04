"use client";
import { Card } from "@/components/ui/card";

const CourseProgression = () => {
  return (
    <Card className="p-4 mt-8">
      <h3 className="font-[1000] text-2xl mb-4">Course Progression</h3>

      <p className="text-[15px] font-bold mb-2">Completed Courses</p>

      <div className="bg-[#F0FDF4] p-4 rounded-lg mb-4">
        <div className="flex justify-between">
          <div className="flex flex-col">
            <p className="text-sm font-medium">Introduction to Business</p>
            <p className="text-sm text-muted-foreground">Semester 1</p>
          </div>

          <div className="flex flex-col text-right">
            <p className="text-sm font-bold">GPA: 3.8</p>
            <p className="text-sm text-muted-foreground">15 Credits</p>
          </div>
        </div>
      </div>

      <div className="bg-[#F0FDF4] p-4 rounded-lg">
        <div className="flex justify-between">
          <div className="flex flex-col">
            <p className="text-sm font-medium">Financial Accounting</p>
            <p className="text-sm text-muted-foreground">Semester 2</p>
          </div>

          <div className="flex flex-col text-right">
            <p className="text-sm font-bold">GPA: 3.5</p>
            <p className="text-sm text-muted-foreground">15 Credits</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CourseProgression;
