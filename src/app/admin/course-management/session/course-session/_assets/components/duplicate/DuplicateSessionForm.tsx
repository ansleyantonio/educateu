/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  ISessionForm,
  SessionSchema,
} from "../../schemas/CreateSessionFormSchema";
import Form_field from "../formField/formField";
import { SessionDefaultValue } from "../../utils/sessionValue";
import ActionButton from "@/components/common/button/actionButton";
import { useState } from "react";
import AddCoursesToSession from "./setCourse";
import DataFetcher from "@/hooks/fetchDataCollection/hooksExport";
import OverrideWarningDialog from "../overrideModal/overrideModal";
import { ArrowLeftIcon } from "lucide-react";

const DuplicateSessionForm = ({
  sessionData,
  setOpen,
}: {
  setOpen: (v: boolean) => void;
  sessionData: any;
}) => {
  const queryClient = useQueryClient();
  const [openList, setOpenList] = useState<string | null>(null);
  const [stage, setStage] = useState(0);

  const { data } = DataFetcher.fetchCoursesBySessionId({
    sessionId: sessionData?.id,
    queryKey: "fetch-session-courses-to-duplicate",
  });

  const existingCourses = data?.data?.sessionCourses;

  const form = useForm<ISessionForm>({
    resolver: zodResolver(SessionSchema.createSession),
    defaultValues: SessionDefaultValue(sessionData),
    mode: "onChange",
  });

  const selectedCourses = form.watch("courseIds");

  const createSessionMutation = useApiMutation({
    method: "POST",
    path: "session",
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["fetch-session-list"] });
      showToast("success", response);
      setOpen(false);
    },
    onError: (error: any) => {
      showToast("error", error);
    },
  });

  /** Stage 0 -> Stage 1 */
  function onNext(values: ISessionForm) {
    //console.log(values);
    setStage(1);
  }

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()}>
        {/* Step 0 - Session Details */}
        {stage === 0 && (
          <div className="grid grid-cols-1 gap-4">
            <Form_field form={form} />
          </div>
        )}

        {/* Step 1 - Connect Courses */}
        {stage === 1 && (
          <AddCoursesToSession
            data={existingCourses}
            form={form}
            openList={openList}
            setOpenList={setOpenList}
          />
        )}

        {/* Step 2 - Confirmation */}
        {stage === 2 && (
          <div>
            <h2 className="text-lg font-medium">
              Are you sure you want to duplicate this session{" "}
              {selectedCourses && selectedCourses?.length > 0
                ? `with the selected`
                : `without any`}{" "}
              courses?
            </h2>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex gap-3 justify-end items-center mt-4">
          {stage === 0 && (
            <>
              <ActionButton
                handleOpen={() => setOpen(false)}
                type="button"
                variant="outline"
                buttonContent="Cancel"
              />
              <ActionButton
                handleOpen={() => form.handleSubmit(onNext)()} // Fixed execution
                type="button"
                buttonContent="Next"
                variant="primary"
              />
            </>
          )}

          {stage === 1 && (
            <div className="flex gap-3 w-full !justify-between items-center mt-4">
              <ActionButton
                handleOpen={() => setStage(0)}
                type="button"
                variant="icon"
                icon={<ArrowLeftIcon />}
                tooltipContent="Back"
              />

              <div className="space-x-4">
                <ActionButton
                  handleOpen={() => setStage(2)} // Move to confirmation
                  type="button"
                  buttonContent="Yes"
                  variant="primary"
                  disabled={selectedCourses && selectedCourses?.length < 1}
                />

                <ActionButton
                  handleOpen={() => setStage(2)} // Skip and go to confirmation
                  type="button"
                  variant="outline"
                  buttonContent="Skip"
                />
              </div>
            </div>
          )}

          {stage === 2 && (
            <>
              <ActionButton
                handleOpen={() => setStage(1)} // Go back to step 1
                disabled={createSessionMutation?.isPending}
                type="button"
                variant="outline"
                buttonContent="Back"
              />
              {/* Modal for Active Session Warning */}
              <OverrideWarningDialog
                form={form}
                mutation={createSessionMutation.mutate}
                btnText="Yes, Duplicate"
                loadingContent="Duplicating"
                isPending={createSessionMutation.isPending}
              />
              {/* <ActionButton */}
              {/*   type="submit" */}
              {/*   isPending={createSessionMutation?.isPending} */}
              {/*   handleOpen={form.handleSubmit(onSubmit)} */}
              {/*   buttonContent="Yes, Duplicate" */}
              {/*   loadingContent="Duplicating" */}
              {/*   variant="primary" */}
              {/* /> */}
            </>
          )}
        </div>
      </form>
    </Form>
  );
};

export default DuplicateSessionForm;
