/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { IAssignableModule } from "@/app/admin/course-management/courses/_assets/types/assignable-module";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { CustomField } from "@/components/common/fields/cusInputField";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import ExpandableText from "@/utils/EnabledText";
import { StatusWithIcon } from "@/utils/status_point";
import { useQueryClient } from "@tanstack/react-query";
import { BookOpen, Calendar, CircleCheck, CirclePlus } from "lucide-react";
import { useState } from "react";

interface lessonProps {
  module: IAssignableModule;
  id: string;
  semesterNo?: number;
  semesters?: number;
}

const AssignModuleDialog = ({
  module,
  id,
  semesterNo,
  semesters,
}: lessonProps) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<string>("");

  // Compute semester number
  const isSemester: number =
    semesterNo ?? parseInt(selectedSemester.replace(/\D/g, ""), 10);

  const isAdvanced: boolean =
    module?.courseType === "DEGREE_COURSE" ||
    module?.courseType === "DIPLOMA_COURSE";

  // Mutations without internal toasts
  const assignMutation = useApiMutation({
    method: "POST",
    path: "courses/assign-module",
    isSuccessToast: false,
    isErrorToast: false,
  });

  const assignModuleMutation = useApiMutation({
    method: "POST",
    path: `courses/${id}/update-module-semester`,
    isSuccessToast: false,
    isErrorToast: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async () => {
    if (!module?.id) return;

    setIsLoading(true);
    try {
      // Always assign module
      const assignResult = await assignMutation.mutateAsync({
        moduleId: module?.id,
        courseId: id,
      });

      // Assign semester only for DEGREE modules
      const semesterResult = isAdvanced
        ? await assignModuleMutation.mutateAsync({
            moduleId: module?.id,
            semesterNumber: isSemester,
          })
        : assignResult;

      showToast("success", semesterResult);

      queryClient.invalidateQueries({
        queryKey: ["fetch_courses_assigned_modules"],
      });
      queryClient.invalidateQueries({
        queryKey: ["get-semester-modules"],
      });
      setOpen(false);
    } catch (err: any) {
      showToast("error", err);
      setOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogWrapper
      handleOpen={() => setOpen(true)}
      closer={false}
      open={open}
      triggerContent={
        <ActionButton
          variant="primaryIcon"
          icon={<CirclePlus />}
          tooltipContent="Assign to Module"
          handleOpen={() => {
            setOpen(true);
          }}
        />
      }
      style="p-2 min-w-[400px]"
    >
      <div className="space-y-6">
        {/* Top Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
          {/* Left Section */}
          <div className="flex-1 space-y-3">
            {/* Icon + Title */}
            <div className="flex gap-3 items-center text-[#008994]">
              {/* Icon */}
              <div className="p-3 rounded-xl shadow-inner bg-[#E1F1F2] shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>

              {/* Title and Code */}
              <div className="min-w-0">
                <h3 className="text-xl font-bold leading-snug sm:text-2xl text-[#008994] truncate">
                  {module?.title}
                </h3>
                <p className="text-sm font-medium sm:text-base text-muted-foreground truncate">
                  {module?.code}
                </p>
              </div>
            </div>

            {/* Description */}
            {module?.description && (
              <div className="text-sm text-gray-600">
                <ExpandableText text={module?.description} />
              </div>
            )}

            {/* Module Details */}
            <div className="flex flex-wrap gap-3 text-sm">
              <StatusWithIcon
                label="Status"
                status={module?.status}
                showBg={true}
              />

              <StatusWithIcon
                label={`${isAdvanced ? "Credit" : "Minutes"}`}
                status={
                  isAdvanced
                    ? module?.credit?.toString()
                    : module?.estimatedTimeToComplete?.toString()
                }
                className="!text-blue-500 !bg-blue-100"
                showBg={true}
              />
              <StatusWithIcon
                label="Type"
                status={module?.courseType}
                showBg={true}
                className="!text-purple-700 !bg-purple-100 !border-purple-200"
              />
            </div>
          </div>

          {/* Semester Badge */}
          <div className="self-start">
            {semesterNo && (
              <div className="flex gap-1 items-center py-2 px-4 font-semibold text-white rounded-lg shadow-lg bg-[#CE9042]">
                <Calendar className="w-4 h-4 text-white" />
                <span className="text-sm sm:text-base">
                  Semester {semesterNo}
                </span>
              </div>
            )}

            {semesters && (
              <CustomField.SingleSelectField
                name="semester"
                placeholder="Select Semester"
                options={Array.from(
                  { length: semesters || 0 },
                  (_, i) => `Semester ${i + 1}`
                )}
                onValueChange={(value) => setSelectedSemester(value)}
              />
            )}
          </div>
        </div>

        {/* Confirmation Text */}
        <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
          Are you sure you want to assign{" "}
          <span className="font-semibold text-[#008994]">{module?.title}</span>{" "}
          module?
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse gap-3 justify-end mt-6 sm:flex-row">
          <ActionButton
            handleOpen={() => setOpen(false)}
            variant="outline"
            buttonContent="Cancel"
          />
          <ActionButton
            handleOpen={() => onSubmit()}
            buttonContent="Assign"
            disabled={isAdvanced && !isSemester}
            isPending={isLoading}
            loadingContent="Assigning..."
            icon={<CircleCheck />}
          />
        </div>
      </div>
    </DialogWrapper>
  );
};

export default AssignModuleDialog;
