"use client";
import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { useState } from "react";
import history from "/public/assets/icons/history-info.svg";
import CourseHistory from "./courseHistory";

/* eslint-disable @typescript-eslint/no-explicit-any */
const CourseFeeHistoryModal = ({ data }: { data: any }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DialogWrapper
      title="Course Fee History"
      open={isOpen}
      handleOpen={() => setIsOpen(!isOpen)}
      triggerContent={
        <ActionButton
          handleOpen={() => setIsOpen(!isOpen)}
          imageSrc={history}
          variant="icon"
          tooltipContent="Course Fee History"
        />
      }
      style="min-w-[400px]"
    >
      <div>
        <CourseHistory historyData={historyData} />
      </div>
    </DialogWrapper>
  );
};

export default CourseFeeHistoryModal;

const historyData = {
  auditLogs: [
    {
      user: { username: "alice" },
      action: "created a new application",
      createdAt: "2025-08-20T10:15:00Z",
    },
    {
      user: { username: "bob" },
      action: "updated profile information",
      createdAt: "2025-08-21T14:45:00Z",
    },
    {
      user: { username: "charlie" },
      action: "submitted application",
      createdAt: "2025-08-22T08:30:00Z",
    },
  ],
};
