"use client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/custom_ui/button";

const EngagementScore = () => {
  return (
    <Card className="p-4 mt-4">
      <h3 className="font-bold text-md mb-4">Engagement Score</h3>
      <h1 className="font-bold text-2xl">35%</h1>

      <div className="flex items-center justify-between">
        <div className="text-[#991B1B] bg-[#FEE2E2] rounded px-2 py-1 text-sm">
          At risk of disengagement
        </div>
        <Button
          size="lg"
          variant="outline"
          className="text-[#DC2626] border-[#DC2626] hover:bg-[#FECACA]/20 py-1"
        >
          Send Warning
        </Button>
      </div>

      <p className="text-sm text-gray-500 font-medium mt-4">
        Scoring based on login frequency, time spent on platform, course access
        rate, assignment & quiz submissions, lesson completion rate, forum
        participation.
      </p>
    </Card>
  );
};

export default EngagementScore;