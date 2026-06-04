/* eslint-disable @typescript-eslint/no-explicit-any */
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";

const UnassignCourse = ({
  course,
  sessionId,
}: {
  course: any;
  sessionId: string;
}) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const unassignCourseMutation = useApiMutation({
    method: "DELETE",
    path: `session/${sessionId}/unassign-course/${course.id}`,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["fetch-session-assigned-courses"],
      });
      showToast("success", data);
      setOpen(false);
    },
    onError: (error: any) => {
      if (error?.response) {
        showToast("error", error);
      }
    },
  });

  const handleUnassignCourse = () => {
    unassignCourseMutation.mutate(course.id);
  };
  return (
    <DialogWrapper
      title="Unassign Course"
      open={open}
      handleOpen={() => setOpen(!open)}
      triggerContent={
        <ActionButton
          variant="icon"
          icon={<Trash2 />}
          handleOpen={() => setOpen(!open)}
          tooltipContent="Unassign Course"
        />
      }
    >
      <div>
        <h2>Unassign Course</h2>
        <p>
          Are you sure you want to unassign{" "}
          <span className="font-semibold text-blue-700">{course.title}</span>?
        </p>

        <div className="flex gap-5 justify-end mt-5">
          <ActionButton
            variant="outline"
            handleOpen={() => setOpen(false)}
            buttonContent="No"
          />

          <ActionButton
            isPending={unassignCourseMutation?.isPending}
            loadingContent="Unassigning"
            buttonContent="Unassign"
            handleOpen={() => handleUnassignCourse()}
          />
        </div>
      </div>
    </DialogWrapper>
  );
};

export default UnassignCourse;
