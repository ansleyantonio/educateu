/* eslint-disable @typescript-eslint/no-explicit-any */
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { IAssignedModule } from "../../../../types/assigned_module";

const UnassignModuleModal = ({
  id,
  module,
}: {
  id: string;
  module: IAssignedModule;
}) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const unassignModuleMutation = useApiMutation({
    method: "POST",
    path: "courses/unassign-module",
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: [`fetch_courses_assigned_modules`],
      });
      showToast("success", data);
      setOpen(false);
    },
    onError: (error: any) => {
      if (error?.response) {
        showToast("error", error.response?.data?.message);
      }
    },
  });

  // Define a submit handler.
  function onSubmit() {
    const body = { courseId: id, moduleId: module?.id };
    console.log("body", body);
    unassignModuleMutation.mutate(body);
  }

  return (
    <DialogWrapper
      handleOpen={() => setOpen(true)}
      closer={false}
      open={open}
      triggerContent={
        <ActionButton
          handleOpen={() => setOpen(true)}
          variant="icon"
          icon={<Trash2 strokeWidth={2} size={15} />}
          tooltipContent="Delete"
        />
      }
      style="p-4"
    >
      <p> Are you sure you want to delete {module?.title} Module?</p>

      <div className="flex gap-3 justify-end items-center mt-6">
        <ActionButton
          handleOpen={() => setOpen(false)}
          variant="outline"
          buttonContent="Cancel"
        />
        <ActionButton
          handleOpen={() => onSubmit()}
          buttonContent="Delete"
          variant="destructive"
          isPending={unassignModuleMutation?.isPending}
          loadingContent="Deleting..."
        />
      </div>
    </DialogWrapper>
  );
};

export default UnassignModuleModal;
