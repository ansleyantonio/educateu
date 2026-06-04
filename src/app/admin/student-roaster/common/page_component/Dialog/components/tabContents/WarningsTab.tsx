"use client";
import SendWarning from "./WarningsComponent/SendWarning";
import HistoryWarning from "./WarningsComponent/HistoryWarning";
import { Card } from "@/components/ui/card";

interface WarningsTabProps {
  mode?: string;
}

const WarningsTab = ({ mode }: WarningsTabProps) => {
  return (
    <div className="p-4 mt-2">
      {/* <SendWarning />
      <HistoryWarning /> */}
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

export default WarningsTab;
