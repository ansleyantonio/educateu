/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Eye } from "lucide-react";
import ActionButton from "@/components/common/button/actionButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { Loader2 } from "lucide-react";

interface CourseDetailsModalButtonProps {
  courseId: string;
  btnSize?: "sm" | "md" | "lg";
  btnStyle?: string;
  tooltipContent?: string;
  iconSize?: number;
}

export function CourseDetailsModalButton({
  courseId,
  btnStyle = "h-[30px] mt-[30px] w-[30px] text-xs hover:border-none border-gray-300",
  tooltipContent = "View Details Course",
  iconSize = 16,
}: CourseDetailsModalButtonProps) {
  const [open, setOpen] = useState(false);

  const { data: courseDetails, isLoading } = useFetchData({
    path: `courses/${courseId}`,
    queryKey: ["course-details", courseId],
    method: "GET",
    enabled: open && !!courseId,
  });

  const course = courseDetails?.data?.course;

  const InfoField = ({ label, value }: { label: string; value: any }) => (
    <div>
      <label className="text-sm font-medium text-gray-600">{label}</label>
      <input
        type="text"
        value={value || "N/A"}
        className="mt-1 w-full rounded-md border px-3 py-2 text-sm bg-gray-50"
        readOnly
      />
    </div>
  );

  return (
    <>
      {/* === BUTTON TRIGGER === */}
      <ActionButton
        type="button"
        handleOpen={() => setOpen(true)}
        variant="icon"
        btnSize="sm"
        tooltipContent={tooltipContent}
        btnStyle={btnStyle}
        icon={<Eye className={`h-${iconSize} w-${iconSize}`} />}
      />

      {/* === MODAL === */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full md:min-w-[65%] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-bold text-base text-black">
              Course Details
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : course ? (
            <div className="space-y-8">

              {/* ================= BASIC INFO ================= */}
              <section>
                <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <InfoField label="Course Title" value={course.title} />
                  <InfoField label="Course Code" value={course.code} />
                  <InfoField label="Course Type" value={course.courseType} />
                  <InfoField label="Status" value={course.status} />
                  <InfoField label="Duration (Minutes)" value={course.durationLength} />
                </div>
              </section>

              {/* ================= DESCRIPTION ================= */}
              <section>
                <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
                  Description
                </h3>

                <textarea
                  value={course.courseDescription || "N/A"}
                  className="mt-3 w-full rounded-md border px-3 py-2 text-sm bg-gray-50 min-h-[100px]"
                  readOnly
                />
              </section>

              {/* ================= STUDY MODES ================= */}
              <section>
                <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
                  Study Modes
                </h3>

                <div className="flex flex-wrap gap-2 mt-3">
                  {course.studyModes?.length ? (
                    course.studyModes.map((mode: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-md bg-gray-200 text-xs font-medium text-gray-700"
                      >
                        {mode}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No study modes</span>
                  )}
                </div>
              </section>

              {/* ================= ACCREDITATION ================= */}
              <section>
                <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
                  Accreditation Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <InfoField
                    label="Professional Accreditation"
                    value={course.professionalAccreditation}
                  />
                  <InfoField
                    label="Accreditation Body Code"
                    value={course.accreditationBodyCode}
                  />
                  <InfoField
                    label="Accreditation Start Date"
                    value={
                      course.accreditationStartDate
                        ? new Date(course.accreditationStartDate).toLocaleDateString()
                        : "N/A"
                    }
                  />
                  <InfoField
                    label="Accreditation End Date"
                    value={
                      course.accreditationEndDate
                        ? new Date(course.accreditationEndDate).toLocaleDateString()
                        : "N/A"
                    }
                  />
                </div>
              </section>

              {/* ================= MODULES ================= */}
              <section>
                <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
                  Course Modules
                </h3>

                {course.courseModules?.length > 0 ? (
                  <div className="space-y-4 mt-4">
                    {course.courseModules.map((mod: any, idx: number) => (
                      <div
                        key={mod.id}
                        className="border rounded-lg p-4 bg-gray-50 space-y-2"
                      >
                        <p className="text-sm font-medium">
                          Module {idx + 1}: {mod.cModule?.title}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoField label="Module Code" value={mod.cModule?.code} />
                          <InfoField
                            label="Module Type"
                            value={mod.cModule?.moduleType}
                          />
                          <InfoField
                            label="Estimated Time (Minutes)"
                            value={mod.cModule?.estimatedTimeToComplete}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mt-3">No modules found.</p>
                )}
              </section>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No course details found.</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
