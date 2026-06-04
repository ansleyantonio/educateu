/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { useState } from "react";
// import ViewAdvanceModuleFrom from "../view/ViewAdvanceModuleForm";
import dateFormat from "@/utils/DateFormatter";
import fileView from "/public/assets/icons/assignments.svg";

export function ViewCourseList({ data }: { data: any }) {
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(true);

  const handelOpen = () => {
    setOpen(!open);
    setIsEdit(true);
  };

  return (
    <DialogWrapper
      title={`${!isEdit ? "Update" : "View"} Course List`}
      open={open}
      handleOpen={handelOpen}
      triggerContent={
        <ActionButton
          variant="icon"
          btnStyle="hover:border-blue-700"
          tooltipContent="Course List"
          imageSrc={fileView}
          handleOpen={handelOpen}
        />
      }
      style="min-w-[75%]"
    >
      <div className="space-y-2">
        {data.length === 0 && (
          <div className="text-center text-sm">No Course List Found</div>
        )}
        {data?.map((item: any, index: number) => (
          <div key={index} className="grid grid-cols-3 gap-4  rounded-md p-3">
            <div>
              <label className="text-sm font-medium">Course Type</label>
              {/* <input
                type="text"
                value={item.courseType}
                className="py-3 mt-1 w-full rounded-md border px-2  text-sm bg-[#FFFFFF]"
                readOnly
              /> */}
              <div className=" mt-1 w-full rounded-md border px-2 py-3 text-sm bg-[#FFFFFF]">
                {item.courseType}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Course Name</label>
              <div className=" mt-1 w-full rounded-md border px-2 py-3 text-sm bg-[#FFFFFF]">
                {item.courseName}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Valid Date</label>
              <div className=" mt-1 w-full rounded-md border px-2 py-3 text-sm bg-[#FFFFFF]">
                {dateFormat.customFormatDate(item.startDate, "DD-MM-YYYY") +
                  "/" +
                  dateFormat.customFormatDate(item.endDate, "DD-MM-YYYY")}
              </div>
            </div>
          </div>
        ))}
      </div>
    </DialogWrapper>
  );
}
