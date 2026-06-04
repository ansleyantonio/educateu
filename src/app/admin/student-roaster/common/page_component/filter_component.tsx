/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { CustomField } from "@/components/common/fields/cusInputField";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RefreshCw } from "lucide-react";
import ActionButton from "@/components/common/button/actionButton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import DataFetcher from "@/hooks/fetchDataCollection/hooksExport";
import onFormError from "@/utils/formError";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  useFetchStudentRoaster,
  useFetchStudentSession,
} from "../../hooks/useFetchStudentRoaster";

interface OptionType {
  label: string;
  value: string;
}

type FilterFormValues = {
  applicationId: string;
  agentId: string;
  studentStatus: string;
  awardingBodyId: string;
  sessionId: string;
  courseId: string;
  courseType: string;
  registeredCourse: string;
  status: string;
  yearofEntry: string;
  moduleId: string;
  cohort: string;
};

interface FilterComponentProps {
  mode?: string;
  onFilterChange?: (payload: Record<string, unknown>) => void;
}

interface SessionType {
  id?: string;
  sessionId?: string;
  name?: string;
  sessionName?: string;
}

interface CourseType {
  id: string;
  title: string;
}

export const FilterComponent = ({
  mode,
  onFilterChange,
}: FilterComponentProps) => {
  const { options: awardingBodyOptions } = DataFetcher.fetchAwardingBodies();
  const { data: studentSessionData } = useFetchStudentSession();

  const form = useForm<FilterFormValues>({
    defaultValues: {
      applicationId: "",
      agentId: "",
      studentStatus: "",
      awardingBodyId: "",
      sessionId: "",
      courseType: "",
      status: "",
      courseId: "",
      registeredCourse: "",
      yearofEntry: "",
      moduleId: "",
      cohort: "",
    },
  });

  const [filterPayload, setFilterPayload] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [sessionOptions, setSessionOptions] = useState<OptionType[]>([]);
  const [courseOptions, setCourseOptions] = useState<OptionType[]>([]);

  const awardingBodySelected = !!form.watch("awardingBodyId");

  useEffect(() => {
    if (Array.isArray(studentSessionData?.data?.sessions)) {
      const options = studentSessionData.data.sessions.map(
        (item: SessionType) => ({
          value: item?.id || item?.sessionId || "",
          label: item?.name || item?.sessionName || "",
        })
      );
      setSessionOptions(options);
    }
  }, [studentSessionData]);

  const { mutate: fetchCourses } = useApiMutation({
    method: "POST",
    path: "courses/get",
    onSuccess: (res) => {
      const courseOptions = (res?.data?.courses || []).map(
        (course: CourseType) => ({
          label: course.title,
          value: course.id,
        })
      );
      setCourseOptions(courseOptions);
    },
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      if (values.awardingBodyId) {
        fetchCourses({ awardingBodyId: values.awardingBodyId });
      } else {
        setCourseOptions([]); // Clear courses if awarding body is cleared
      }
    });

    return () => subscription.unsubscribe();
  }, [form.watch, fetchCourses]);

  const onSubmit = (data: FilterFormValues) => {
    setFilterPayload(data);
    if (onFilterChange) onFilterChange(data);
  };

  const { data: _studentRoasterData } = useFetchStudentRoaster(
    filterPayload || undefined
  );

  const handleReset = () => {
    form.reset();
    setFilterPayload(null);
    if (onFilterChange) onFilterChange({});
  };

  const agentList = useFetchData({
    path: "business-development-management",
    method: "GET",
    queryKey: "fetch-all-agents-list",
  });

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="Registry Filters"
      className="mt-2 w-full rounded-xl border border-[#E2E8F0]"
    >
      <AccordionItem value="Registry Filters">
        <AccordionTrigger className="flex justify-between items-center p-5">
          <p className="text-xl font-medium text-[#272E35]">Registry Filters</p>
        </AccordionTrigger>
        <AccordionContent className="p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onFormError)}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
                <CustomField.SelectField
                  name="agentId"
                  labelName="Agent"
                  placeholder="Select Agent"
                  options={
                    agentList?.data?.data?.agents?.map((agent: any) => ({
                      label: `${agent?.firstName ?? ""} ${
                        agent?.lastName ?? ""
                      }`,
                      value: agent?.roasterId ?? "",
                    })) || []
                  }
                  form={form}
                />
                <CustomField.SelectField
                  form={form}
                  name="sessionId"
                  placeholder="Select Academic Session"
                  labelName="Academic Session"
                  options={sessionOptions}
                />
                <CustomField.SelectField
                  form={form}
                  name="courseType"
                  labelName="Course Type"
                  placeholder="Course Type"
                  options={[
                    { label: "Degree", value: "DEGREE_COURSE" },
                    { label: "Diploma", value: "DIPLOMA_COURSE" },
                  ]}
                />
                <CustomField.SelectField
                  name="awardingBodyId"
                  labelName="Awarding Body"
                  placeholder="Select Awarding Body"
                  options={awardingBodyOptions}
                  form={form}
                />

                {/* Tooltip wrapper for disabled state */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <CustomField.SelectField
                          form={form}
                          name="courseId"
                          placeholder="Select Admitted Course"
                          labelName="Admitted Course"
                          options={courseOptions}
                          disabled={!awardingBodySelected}
                        />
                        <div className="my-2">
                        <p className="text-[12px] text-gray-500">Hint: Select an awarding body first</p>
                      </div>
                      </div>
                    </TooltipTrigger>
                    {!awardingBodySelected && (
                      <TooltipContent className="bg-gray-500">
                        <p className="text-[10px]">
                          Select an awarding body first
                        </p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>

                {/* <CustomField.SelectField
                  form={form}
                  name="statusId"
                  placeholder="Select Student Status"
                  labelName="Student Status"
                  options={[
                    { label: "Active", value: "active" },
                    { label: "Inactive", value: "inactive" },
                    { label: "Graduated", value: "graduated" },
                    { label: "Transferred", value: "transferred" },
                    { label: "Dropped Out", value: "dropped_out" },
                  ]}
                /> */}
              </div>
              

              <div className="flex justify-end gap-4 pt-4">
                <ActionButton
                  handleOpen={() => handleReset()}
                  type="button"
                  variant="icon"
                  tooltipContent="Reset"
                  icon={<RefreshCw />}
                />
                <Button type="submit" variant="primary">
                  Apply
                </Button>
              </div>
            </form>
          </Form>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
