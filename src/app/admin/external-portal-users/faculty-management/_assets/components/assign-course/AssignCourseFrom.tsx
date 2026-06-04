"use client";
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Button } from "@/components/ui/button";
import { useAuths } from "@/hooks/userContext";
import onFormError from "@/utils/formError";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  assignCourseSchema,
  IAssignCourseForm,
} from "../../schemas/assignCourseSchema";
import hasDuplicateCourseIdAndRole from "../../utils/hasDuplicateCourseIdAndRole";
import Assign_Form_field from "../formField/assign_form_field";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";

type AssignCoursePayload = {
  courseAssign: {
    sessionId:string;
    userId: string;
    courseId: string;
    courseModuleId: string[];
    role: string[];
  }[];
};

const AssignCourseForm = ({
  setOpen,
  id,
}: {
  setOpen: (val: boolean) => void;
  id: string;
}) => {
  const auth = useAuths();
  const token = auth?.user?.token;
  const queryClient = useQueryClient();

  const form = useForm<IAssignCourseForm>({
    resolver: zodResolver(assignCourseSchema),
    defaultValues: {
      courseAssign: [{ course: "", module: [], role: "", id: id }],
    },
  });

  const assignCourseMutation = useApiMutation({
  path: "faculty-management/assign-course",
  method: "POST",
  onSuccess: (data) => {
    toast.success("Successfully assigned course!");
    form.reset();
    setOpen(false);
    queryClient.invalidateQueries({
      queryKey: ["fetch-assigned-courses"],
    });
  },
  onError: (error) => {
    toast.error(error || "Something went wrong!");
  },
});

  const onSubmit = (values: IAssignCourseForm) => {
    const payload: AssignCoursePayload = {
      courseAssign: values.courseAssign.map((a) => ({
        sessionId: a.session,
        userId: id,
        courseId: a.course,
        courseModuleId: a.module,
        role: [a.role],
      })),
    };

    // console.log(payload, "payload");
    const hasDuplicate = hasDuplicateCourseIdAndRole(payload.courseAssign);

    if (hasDuplicate) {
      toast.error("Duplicate course assignment found!");
      return;
    }
    assignCourseMutation.mutate(payload);
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onFormError)}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 gap-4">
          <Assign_Form_field id={id} form={form} />
        </div>

        <div className="flex gap-x-3 justify-end items-center">
          <Button
            onClick={() => setOpen(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={assignCourseMutation.isPending}
            type="submit"
            className="py-2 px-8 bg-[#013E5B] hover:bg-[#73b7d6] text-white"
          >
            {assignCourseMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Assign Course
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default AssignCourseForm;
