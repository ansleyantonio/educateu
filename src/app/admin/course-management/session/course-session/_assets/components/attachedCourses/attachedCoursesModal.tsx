/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import ActionButton from "@/components/common/button/actionButton";
import { BookOpen, ClipboardList } from "lucide-react";
import CoursesInfoTable from "./courseInfo";
import { useAuths } from "@/hooks/userContext";

export function AttachedCourses({ sessionData }: { sessionData: any }) {
  const [open, setOpen] = useState(false);
  const { editAccess } = useAuths();

  return (
    <DialogWrapper
      title={
        <>
          <BookOpen className="inline mr-2 w-6 h-6" />
          Attached Courses
        </>
      }
      open={open}
      handleOpen={() => setOpen(!open)}
      style=" min-w-[85%]"
      triggerContent={
        <ActionButton
          disabled={!editAccess}
          handleOpen={() => setOpen(!open)}
          icon={<ClipboardList />}
          variant="icon"
          tooltipContent="Attached Courses"
        />
      }
    >
      <div>
        <CoursesInfoTable sessionData={sessionData} />
      </div>
    </DialogWrapper>
  );
}
