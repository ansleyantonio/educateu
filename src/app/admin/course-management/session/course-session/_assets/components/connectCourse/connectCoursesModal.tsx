"use client";
import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { CirclePlus } from "lucide-react";
import { useEffect, useState } from "react";
import ConnectCourseForm from "./connectCourseForm";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import connectCourseSchema, {
  IConnectCourseForm,
} from "../../schemas/connectCourseSchema";
import { Form } from "@/components/ui/form";
import onFormError from "@/utils/formError";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import DataFetcher from "@/hooks/fetchDataCollection/hooksExport";

const ConnectCoursesModal = ({ id }: { id: string }) => {
  const [open, setOpen] = useState(false);

  const form = useForm<IConnectCourseForm>({
    resolver: zodResolver(connectCourseSchema),
    defaultValues: {
      courseIds: [],
    },
    mode: "onChange",
  });

  const { courseIds } = DataFetcher.fetchCoursesBySessionId({
    sessionId: id,
    queryKey: "fetch-session-courses-to-duplicate",
    enabled: open,
  });

  useEffect(() => {
    if (open && courseIds?.length && form.getValues("courseIds").length === 0) {
      form.reset({ courseIds: [...courseIds] });
    }
  }, [open, courseIds, form]);

  const courseConnect = useApiMutation({
    method: "POST",
    path: `session/${id}/assign-course`,
    onSuccess: (response) => {
      form.reset();
      showToast("success", response);
      setOpen(false);
    },
    onError: (error) => {
      showToast("error", error);
    },
  });

  const onSubmit = (values: IConnectCourseForm) => {
    courseConnect.mutate(values);
  };

  return (
    <DialogWrapper
      title="Connect Courses"
      triggerContent={
        <ActionButton
          variant="icon"
          icon={<CirclePlus />}
          tooltipContent="Connect Courses"
          handleOpen={() => setOpen(!open)}
        />
      }
      open={open}
      handleOpen={() => setOpen(!open)}
      style="min-w-[55%] lg:min-w-[45%]"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onFormError)}
          className="space-y-4"
        >
          <div className="flex flex-col justify-between min-h-[300px]">
            <ConnectCourseForm form={form} isEditMode={false} />

            <div className="flex gap-3 justify-end">
              <ActionButton
                type="button"
                buttonContent="Cancel"
                variant="outline"
                handleOpen={() => setOpen(false)}
              />
              <ActionButton
                isPending={courseConnect.isPending}
                type="submit"
                handleOpen={() => form.handleSubmit(onSubmit, onFormError)}
                buttonContent="Connect"
                loadingContent="Connecting"
                variant="primary"
              />
            </div>
          </div>
        </form>
      </Form>
    </DialogWrapper>
  );
};

export default ConnectCoursesModal;
