"use client";
import EngagementScore from "./EngagementComponents/EngagementScore";
import QuickEngagementAlert from "./EngagementComponents/QuickEngagementAlert";
import AcademicOverview from "./ProgressionTabComponents/AcademicOverview";
import EngagementBreakDown from "./EngagementComponents/EngagementBreakDown";
import EngagementCharts from "./EngagementComponents/EngagementCharts";
import { Card } from "@/components/ui/card";

type EngagementProps = {
    mode?: string;
}

const EngagementTab = ({ mode }: EngagementProps) => {
  return (
    <div className="m-0 p-0">
      {/* <QuickEngagementAlert />
      <AcademicOverview mode={mode}/>
      <EngagementScore />
      <EngagementCharts />
      <EngagementBreakDown /> */}
      <Card className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Hold tight! </h3>
            <p className="text-sm text-gray-500 mb-4">
              These tab will be ready to use once the student portal is live
            </p>
          </div>
        </Card>
    </div>
  );
};

export default EngagementTab;
