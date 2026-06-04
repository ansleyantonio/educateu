"use client";
import { Card } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { BellOff } from "lucide-react";
import Warning from "./Component/Warning";

const QuickEngagementAlert = () => {
  return (
    <Card className="mt-0">
      <div className="flex items-center gap-2 p-4">
        <Bell />
        <h3 className="font-bold text-md">Quick Engagement Alerts</h3>
      </div>
      <div className="p-2">
        <Warning icon={<BellOff />} message="Hasn't logged in for 12 days" condition="high"/>
        <Warning icon={<Bell />} message="Missed 3 assignments in a row" condition="critical"/>
      </div>
    </Card>
  );
};

export default QuickEngagementAlert;
