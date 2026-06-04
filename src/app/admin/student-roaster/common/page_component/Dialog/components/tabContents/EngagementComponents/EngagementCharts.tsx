"use client";
import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type EngagementTrend = {
  week: string;
  engagement: number;
};

type BreakdownItem = {
  category: string;
  value: number;
};

// Sample data
const engagementTrendsData: EngagementTrend[] = [
  { week: "Week 1", engagement: 20 },
  { week: "Week 2", engagement: 40 },
  { week: "Week 3", engagement: 60 },
  { week: "Week 4", engagement: 30 },
  { week: "Week 5", engagement: 50 },
  { week: "Week 6", engagement: 70 },
];

const weeklyBreakdownData: BreakdownItem[] = [
  { category: "Login Frequency", value: 45 },
  { category: "Time on Platform", value: 30 },
  { category: "Course Access", value: 25 },
  { category: "Assignments Submitted", value: 40 },
  { category: "Lesson Completion", value: 35 },
  { category: "Forum Participation", value: 20 },
];

const EngagementCharts: React.FC = () => {

  const totalScore = useMemo(() => {
    const total = weeklyBreakdownData.reduce((sum, item) => sum + item.value, 0);
    const maxTotal = 6 * 100; 
    return Math.round((total / maxTotal) * 100);
  }, []);

  const getEngagementCategory = (score: number) => {
    if (score >= 70) return { label: "Highly Engaged", color: "green" };
    if (score >= 40) return { label: "Moderately Engaged", color: "yellow" };
    return { label: "At Risk of Disengagement", color: "red" };
  };

  const { label, color } = getEngagementCategory(totalScore);

  const handleSendWarning = () => {
    console.log("Warning sent and logged to student's profile.");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-md">Engagement Trends (6 Weeks)</h3>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={engagementTrendsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="engagement"
              stroke="#2563EB"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-md">Weekly Engagement Breakdown</h3>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={weeklyBreakdownData}
            barCategoryGap={0}
            barGap={4}
            margin={{ top: 20, right: 30, left: 0, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="category"
              angle={-22}
              textAnchor="end"
              interval={0}
              height={60}
            />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#013E5B" barSize={100} />
          </BarChart>
        </ResponsiveContainer>

        <div className="mb-4 p-3 rounded-lg border flex items-center justify-between"
          style={{
            backgroundColor:
              color === "green"
                ? "#D1FAE5"
                : color === "yellow"
                ? "#FEF9C3"
                : "#FECACA",
            borderColor:
              color === "green"
                ? "#10B981"
                : color === "yellow"
                ? "#FACC15"
                : "#EF4444",
          }}
        >
          <div>
            <p className="text-sm font-medium">Engagement Level: {label}</p>
            <p className="text-xs text-muted-foreground">{totalScore}%</p>
          </div>

          {color === "red" && (
            <Button variant="destructive" size="sm" onClick={handleSendWarning}>
              Send Warning
            </Button>
          )}
        </div>

      </Card>
    </div>
  );
};

export default EngagementCharts;