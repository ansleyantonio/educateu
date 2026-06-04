"use client";

import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { AssessmentSchema } from "../schemas/schema";
import {
  convertAssessmentToFormValues,
  getDefaultValues,
  isDetailsFormValid,
} from "../utils/helper";
import { Assessment, AssessmentCategory, CreateAssessmentValues } from "../utils/types";
import AssessmentDetailedForm from "./AssessmentDetailedForm";
import AssessmentScheduleForm from "./AssessmentScheduleForm";

interface CreateAssessmentDialogProps {
  assessment?: Assessment | (Omit<Assessment, "id"> & { id?: string });
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  onSave?: () => void;
  onRefresh?: () => void;
  isEditMode?: boolean;
}

export function CreateAssessmentDialog({
  assessment,
  isEditMode,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
  onSave,
  onRefresh,
}: CreateAssessmentDialogProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const router = useRouter();

  const assessmentId = assessment?.id;
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const defaultValues = useMemo(() => getDefaultValues(), []);

  const form = useForm<CreateAssessmentValues | Assessment>({
    resolver: zodResolver(AssessmentSchema.create),
    defaultValues,
    mode: "onChange",
    reValidateMode: "onChange",
  });



  // Reset form when dialog opens/closes or assessment changes
  useEffect(() => {
    if (assessment && open) {
      // Populate form with assessment data (for both edit and duplicate mode)
      // Convert string dates to Date objects
      const formValues = convertAssessmentToFormValues(assessment);
      form.reset(formValues);
    } else if (!assessment && open) {
      // Reset to defaults when opening dialog without assessment (create mode)
      form.reset(getDefaultValues());
      setActiveTab("details");
    } else if (!open) {
      // Reset when dialog closes
      form.reset(getDefaultValues());
      setActiveTab("details");
    }
  }, [assessment, form, open]);


  const updateAssessmentMutation = useApiMutation({
    method: "PUT",
    path: `assessments/${assessmentId}`,
    onSuccess: () => {
      // showToast("success", "Assessment updated successfully");
      onSave?.();
    },
    onError: () => {
      const errorMessage = "Failed to update assessment";
      showToast("error", errorMessage);
    },
    isSuccessToast: false,
    isErrorToast: false,
  });

  const createAssessmentMutation = useApiMutation({
    method: "POST",
    path: `assessments`,
    onSuccess: (data: unknown) => {
      if (onRefresh) {
        onRefresh();
      }
      const response = data as {
        data?: { id?: string; assessment?: { id?: string; assessmentCategory?: AssessmentCategory } };
        id?: string;
      };
      const newAssessmentId = response.data?.assessment?.id;
      const assessmentCategory = response.data?.assessment?.assessmentCategory;
      if (newAssessmentId) {
        router.push(
          `/admin/course-management/assessments/assessment/${newAssessmentId}?assessmentCategory=${assessmentCategory}`
        );
      } else {
        onSave?.();
      }
    },
    onError: () => {
      const errorMessage = "Failed to create assessment";
      showToast("error", errorMessage);
    },
    isSuccessToast: false,
    isErrorToast: false,
  });

  // Helper function to convert Date to ISO string
  // Start dates: beginning of day (00:00:00.000Z)
  // End dates and due dates: end of day (23:59:59.000Z)
  const formatDateToISO = (
    date: Date | undefined,
    isEndDate: boolean = false
  ): string | undefined => {
    if (!date) return undefined;
    const formattedDate = new Date(date);
    if (isEndDate) {
      // Set time to end of day (23:59:59.000Z)
      formattedDate.setHours(23, 59, 59, 0);
    } else {
      // Set time to beginning of day (00:00:00.000Z)
      formattedDate.setHours(0, 0, 0, 0);
    }
    return formattedDate.toISOString();
  };

  async function onSubmit(data: CreateAssessmentValues | Assessment) {
    // Only submit when on the schedule tab
    if (activeTab !== "schedule") {
      return;
    }
    const formData = data as CreateAssessmentValues;
    const timeType = formData.timeType ?? "minutes";
    const baseTimeLimit = formData.timeLimit ?? 0;
    const normalizedTimeLimit =
      timeType === "hours" ? baseTimeLimit * 60 : baseTimeLimit;
    const { timeType: _timeType, ...formDataWithoutTimeType } = formData;
    // Convert Date objects to ISO strings
    // Start date: beginning of day (00:00:00.000Z)
    // End date and due date: end of day (23:59:59.000Z)
    const submissionData = {
      ...formDataWithoutTimeType,
      timeLimit: normalizedTimeLimit,
      availableStartDate: formatDateToISO(formData.availableStartDate, false),
      availableEndDate: formatDateToISO(formData.availableEndDate, true),
      dueDate: formatDateToISO(formData.dueDate, true),
      id: isEditMode ? undefined : formData.id,
    };

    try {
      if (isEditMode && assessmentId) {
        // Only update if we have an assessment ID (edit mode)
        updateAssessmentMutation.mutate(submissionData);
        // Navigation happens in onSuccess callback
      } else {
        // Create new assessment (create mode or duplicate mode)
        createAssessmentMutation.mutate({
          ...submissionData,

        });
        // Navigation happens in onSuccess callback
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      const { showToast: showToastError } = await import(
        "@/components/common/TostMessage/customTostMessage"
      );
      showToastError("error", errorMessage, undefined, "toast");
    }
  }

  const triggerButton = !trigger ? (
    <Button variant="primary" size="sm">
      <Plus className="w-4 h-4" />
      <span>Create New Assessemnt</span>
    </Button>
  ) : (
    trigger
  );

  return (
    <DialogWrapper
      title={isEditMode ? "Edit Assessment" : "Create Assessment"}
      open={open}
      handleOpen={setOpen}
      triggerContent={triggerButton}
      style="sm:max-w-[625px]"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs
            value={activeTab}
            onValueChange={async (val) => {
              const isValid = await isDetailsFormValid({
                form
              })
              if (!isValid && activeTab === "details") {
                return;
              }
              setActiveTab(val)
            }}
            className="w-full"
          >
            <TabsList className=" w-full h-auto bg-transparent p-0 border-b border-gray-200 justify-around">
              <TabsTrigger
                value="details"
                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary rounded-none px-0 pb-3 mr-8 font-medium text-gray-600 hover:text-teal-600"
              >
                Details
              </TabsTrigger>
              <TabsTrigger

                value="schedule"
                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary rounded-none px-0 pb-3 mr-8 font-medium text-gray-600 hover:text-teal-600"
              >
                Schedule & Submissions
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-4 mt-4">
              <AssessmentDetailedForm
                form={form}
                setOpen={(value) => {
                  if (typeof value === "function") {
                    setOpen(value(open));
                  } else {
                    setOpen(value);
                  }
                }}
                onActiveTab={setActiveTab}
                isEditMode={isEditMode}
              />
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4 mt-4">
              <AssessmentScheduleForm
                form={form}
                setActiveTab={setActiveTab}
                isSubmitting={
                  createAssessmentMutation.isPending ||
                  updateAssessmentMutation.isPending
                }
                isEditMode={isEditMode}
              />
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </DialogWrapper>
  );
}
