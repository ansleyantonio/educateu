/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/custom_ui/button";
import { CalendarIcon, RefreshCw } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import dateFormat from "@/utils/DateFormatter";
import { CustomField } from "@/components/common/fields/cusInputField";
import DataFetcher from "@/hooks/fetchDataCollection/hooksExport";
import ActionButton from "@/components/common/button/actionButton";
import {
  organisationOptions,
  interviewTypeOptions,
  timeSlotOptions,
  preScreeningOutcomeOptions,
  interviewOutcomeOptions,
} from "./field_options";

// Validation schema
const FormSchema = z
  .object({
    courseId: z.string().optional(),
    sessionId: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    agentId: z.string().optional(),
    subAgentId: z.string().optional(),
    organisation: z.string().optional(),
    interviewType: z.string().optional(),
    timeSlot: z.string().optional(),
    preScreeningOutcome: z.string().optional(),
    interviewOutcome: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.dateFrom || !data.dateTo) return true;
      return new Date(data.dateFrom) <= new Date(data.dateTo);
    },
    {
      message: "Start date cannot be after end date",
      path: ["dateTo"],
    }
  );

interface AgentOption {
  label: string;
  value: string;
  id: string;
}

export type ApplicationFormValues = z.infer<typeof FormSchema>;

export function ApplicationForm({
  onSubmitFilters,
}: {
  onSubmitFilters: (values: ApplicationFormValues) => void;
}) {
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();

  const form = useForm<any>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      courseId: "",
      sessionId: "",
      dateFrom: "",
      dateTo: "",
      agentId: "",
      subAgentId: "",
      organisation: "",
      interviewType: "",
      timeSlot: "",
      preScreeningOutcome: "",
      interviewOutcome: "",
    },
  });

  const { options: courseOptions } = DataFetcher.fetchCourses();
  const { options: academicSessions } = DataFetcher.fetchAcademicSessions();
  const { options: agentList } = DataFetcher.fetchAgentList() as {
    options: AgentOption[];
  };

  const selectedRoasterId = form.watch("agentId");
  const selectedAgent = agentList.find((a) => a.value === selectedRoasterId);
  const agentIdForSubAgents = selectedAgent?.id;

  const { options: subAgentList } = DataFetcher.fetchSubAgentList({
    agentId: agentIdForSubAgents,
  });

  const handleReset = () => {
    form.reset();
    setFromDate(undefined);
    setToDate(undefined);
    onSubmitFilters({});
  };

  const handleDateChange = (
    key: "dateFrom" | "dateTo",
    date: Date | undefined
  ) => {
    if (key === "dateFrom") {
      setFromDate(date);
      if (toDate && date && date > toDate) {
        setToDate(undefined);
        form.setValue("dateTo", "");
      }
    } else {
      setToDate(date);
      if (fromDate && date && date < fromDate) {
        setFromDate(undefined);
        form.setValue("dateFrom", "");
      }
    }
    form.setValue(key, date ? dateFormat.localDateToISOWithZ(date) : "");
  };

  const onSubmit = (values: any) => {
    // console.log("Submitted Filters:", values);
    onSubmitFilters(values);
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* First Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 content-center">
          <CustomField.SelectField
            form={form}
            name="courseId"
            labelName="Select Course"
            options={courseOptions}
            placeholder="Select Course"
          />

          <CustomField.SelectField
            form={form}
            name="sessionId"
            labelName="Select Academic Session"
            options={academicSessions}
            placeholder="Select Academic Session"
          />

          {/* Start Date */}
          <FormField
            control={form.control}
            name="dateFrom"
            render={() => (
              <FormItem>
                <FormLabel className="font-semibold">Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !fromDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fromDate ? format(fromDate, "PPP") : "Pick a start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start">
                    <Calendar
                      mode="single"
                      selected={fromDate}
                      onSelect={(date) => handleDateChange("dateFrom", date)}
                      disabled={(date) => (toDate ? date > toDate : false)}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* End Date */}
          <FormField
            control={form.control}
            name="dateTo"
            render={() => {
              const fromDateVal = form.getValues("dateFrom")
                ? new Date(form.getValues("dateFrom"))
                : undefined;

              return (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !toDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {toDate ? format(toDate, "PPP") : "Pick an end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start">
                      <Calendar
                        mode="single"
                        selected={toDate}
                        onSelect={(date) => handleDateChange("dateTo", date)}
                        disabled={(date) =>
                          fromDateVal ? date < fromDateVal : false
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          <CustomField.SelectField
            form={form}
            name="agentId"
            labelName="Select Agent"
            options={agentList}
            placeholder="Select Agent"
          />

          <CustomField.SelectField
            form={form}
            name="subAgentId"
            labelName="Select Sub Agent"
            options={subAgentList}
            placeholder="Select Sub Agent"
          />

          <CustomField.SelectField
            form={form}
            name="preScreeningOutcome"
            labelName="Pre-Screening Outcome"
            options={preScreeningOutcomeOptions}
            placeholder="Select Pre-Screening Outcome"
          />

          {/* <CustomField.SelectField
            form={form}
            name="organisation"
            labelName="Select Organisation"
            options={organisationOptions}
            placeholder="Select Organisation"
          /> */}
        </div>

        {/* Third Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {/* <CustomField.SelectField
            form={form}
            name="interviewType"
            labelName="Select Interview Type"
            options={interviewTypeOptions}
            placeholder="Select Interview Type"
          /> */}

          {/* <CustomField.SelectField
            form={form}
            name="timeSlot"
            labelName="Select Time Slot"
            options={timeSlotOptions}
            placeholder="Select Time Slot"
          /> */}

          <CustomField.SelectField
            form={form}
            name="interviewOutcome"
            labelName="Interview Outcome"
            options={interviewOutcomeOptions}
            placeholder="Select Interview Outcome"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <ActionButton
            handleOpen={handleReset}
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
    </FormProvider>
  );
}
