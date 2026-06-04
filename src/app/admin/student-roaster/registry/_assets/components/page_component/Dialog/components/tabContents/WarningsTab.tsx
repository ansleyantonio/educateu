"use client";
import SendWarning from "./WarningsComponent/SendWarning";
import HistoryWarning from "./WarningsComponent/HistoryWarning";

const WarningsTab = () => {
  return (
    <div className="p-4 mt-2">
      <SendWarning />
      <HistoryWarning />
    </div>
  );
};

export default WarningsTab;
