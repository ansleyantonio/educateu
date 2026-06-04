/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import ViewSessionForm from "./viewSessionForm";
import fileView from "/public/assets/logo/agent/admin/file-view.svg";
import { Edit } from "lucide-react";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import ActionButton from "@/components/common/button/actionButton";
import { useAuths } from "@/hooks/userContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { SessionDefaultValue } from "../../utils/sessionValue";
import {
  ISessionForm,
  SessionSchema,
} from "../../schemas/CreateSessionFormSchema";
import DataFetcher from "@/hooks/fetchDataCollection/hooksExport";

interface ViewSessionProps {
  data: any;
  title?: string;
}

export function ViewSession({ data, title }: ViewSessionProps) {
  const [open, setOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(true);
  const { editAccess } = useAuths();

  const form = useForm<ISessionForm>({
    resolver: zodResolver(SessionSchema.updateSession),
    defaultValues: SessionDefaultValue(data),
    mode: "onChange",
    // shouldUnregister: false,
  });

  const { courseIds } = DataFetcher.fetchCoursesBySessionId({
    sessionId: data?.id,
    queryKey: "fetch-session-courses-to-duplicate",
    enabled: open,
  });

  useEffect(() => {
    if (
      open &&
      courseIds?.length &&
      (form?.getValues("courseIds")?.length ?? 0) === 0
    ) {
      form?.setValue("courseIds", [...courseIds], { shouldDirty: true });
    }
  }, [open, courseIds, form]);

  const handleOpen = () => {
    setIsEditMode(true);
    setOpen(!open);
    form.reset(SessionDefaultValue(data));
  };

  return (
    <DialogWrapper
      title={`${!isEditMode ? "Update" : "View"} Session`}
      open={open}
      handleOpen={handleOpen}
      style="min-w-[65%] min-h-[70%] xl:min-h-[50%]"
      triggerContent={
        title ? (
          <p className="text-blue-400 cursor-pointer">{title}</p>
        ) : (
          <ActionButton
            variant="icon"
            btnStyle="hover:border-blue-700"
            tooltipContent="View & Update"
            imageSrc={fileView}
            handleOpen={handleOpen}
          />
        )
      }
    >
      <div className="mr-6 rounded-md">
        <div>
          <ViewSessionForm
            sessionId={data?.id}
            form={form}
            data={data}
            isEditMode={isEditMode}
            setOpen={setOpen}
          />
        </div>

        {isEditMode && (
          <div className="flex gap-x-3 justify-end items-center mt-4">
            <ActionButton
              disabled={!editAccess}
              handleOpen={() => setIsEditMode(false)}
              buttonContent="Edit"
              icon={<Edit />}
              type="button"
            />
          </div>
        )}
      </div>
    </DialogWrapper>
  );
}
