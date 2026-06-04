"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TreeSelect } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { toast } from "react-hot-toast";
import { countryList, nationality } from "@/components/json/CountriesJson";
import { useAuths } from "@/hooks/userContext";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, RefreshCw } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import ActionButton from "@/components/common/button/actionButton";
import DataFetcher from "@/hooks/fetchDataCollection/hooksExport";
import { CustomField } from "@/components/common/fields/cusInputField";
import { useAdmissionOfficers } from "@/hooks/fetchDataCollection/useDataHooks";

interface FilterComponentProps {
  onFilterChange?: (payload: Record<string, unknown>) => void;
}

interface AgentOption {
  label: string;
  value: string;
  id: string;
}

const formSchema = z
  .object({
    agentId: z.string().optional(),
    subAgentId: z.string().optional(),
    organization: z.string().optional(),
    admissionOfficerId: z.string().optional(),
    awardingBodyId: z.string().optional(),
    courseId: z.string().optional(),
    sessionId: z.string().optional(),
    year: z.string().optional(),
    applicationStatus: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    nationality: z.string().optional(),
    interviewOutcome: z.string().optional(),
    onlineAssessmentStatus: z.string().optional(),
    additionalFileCheck: z.string().optional(),
    additionalStages: z.array(z.string()).optional(),
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

const defaultValues = {
  agentId: "",
  subAgentId: "",
  organization: "",
  admissionOfficerId: "",
  awardingBodyId: "",
  courseId: "",
  sessionId: "",
  year: "",
  applicationStatus: "",
  dateFrom: "",
  dateTo: "",
  nationality: "",
  interviewOutcome: "",
  onlineAssessmentStatus: "",
  additionalFileCheck: "",
  additionalStages: [],
};

const stageTreeData = [
  { title: "All stages", value: "allStages", key: "allStages" },
  { title: "Unassigned", value: "unassigned", key: "unassigned" },
  {
    title: "Information Required",
    value: "informationRequired",
    key: "informationRequired",
    children: [
      {
        title: "Comprehensive View",
        value: "infoRequired-comprehensiveView",
        key: "infoRequired-comprehensiveView",
      },
      {
        title: "Incomplete Only",
        value: "infoRequired-incompleteOnly",
        key: "infoRequired-incompleteOnly",
      },
    ],
  },
  { title: "Ready to Submit", value: "readyToSubmit", key: "readyToSubmit" },
  {
    title: "Submitted",
    value: "submitted",
    key: "submitted",
    children: [
      {
        title: "Successful",
        value: "submitted-successful",
        key: "submitted-successful",
      },
      {
        title: "Unsuccessful",
        value: "submitted-unsuccessful",
        key: "submitted-unsuccessful",
      },
      {
        title: "Pending",
        value: "submitted-pending",
        key: "submitted-pending",
      },
      { title: "All", value: "submitted-all", key: "submitted-all" },
    ],
  },
];

export const FilterComponent = ({ onFilterChange }: FilterComponentProps) => {
  const auth = useAuths();
  const token = auth?.user?.token;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { options: AcademicSession } = DataFetcher.fetchAcademicSessions({
    filter: {
      pageSize: 100,
    },
  });

  const { options: AwardingBody } = DataFetcher.fetchAwardingBodies({
    filter: {
      pageSize: 100,
    },
  });

  const selectedSessionId = form.watch("sessionId");

  const { options: awardingBodybySessionOptions } =
    DataFetcher.fetchMatchAwardingBodiesBySessionId({
      sessionId: selectedSessionId || "",
      filter: { pageSize: 100 },
    });

  const selectedAwardingBodyId = form.watch("awardingBodyId");

  const { options: courses } = DataFetcher.fetchDiplomaDegreeCourses({
    filter: {
      pageSize: 100,
      awardingBodyId: selectedAwardingBodyId,
    },
  });

  const { options: courseOptions } =
    DataFetcher.fetchCursesBySessionIdWithAwardingBodies({
      sessionId: selectedSessionId || "",
      filter: {
        awardingBodyId: selectedAwardingBodyId,
        pageSize: 100,
      },
    });

  const { options: agentList } = DataFetcher.fetchAgentList({
    filter: {
      pageSize: 100,
    },
  }) as {
    options: AgentOption[];
  };

  const selectedRoasterId = form.watch("agentId");
  const selectedAgent = agentList.find((a) => a.value === selectedRoasterId);
  const agentIdForSubAgents = selectedAgent?.id;

  const { options: subAgentList } = DataFetcher.fetchSubAgentList({
    filter: {
      pageSize: 100,
    },
    agentId: agentIdForSubAgents,
  });

  const { data: admissionOfficers } = useAdmissionOfficers(token!);

  const years = Array.from({ length: 50 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return year.toString();
  });

  const awardingBodyOptions = selectedSessionId
    ? awardingBodybySessionOptions
    : AwardingBody;

  const courseOptionsforAwardingandSessionId =
    selectedSessionId && selectedAwardingBodyId ? courseOptions : courses;

  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();

  const handleDateChange = (
    key: "dateFrom" | "dateTo",
    date: Date | undefined
  ) => {
    form.setValue(key, date ? date.toISOString() : "");
    if (key === "dateFrom") setFromDate(date);
    if (key === "dateTo") setToDate(date);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onFilterChange?.(values);
  };

  const onError = (errors: FieldErrors<z.infer<typeof formSchema>>) => {
    if (errors.dateTo?.message) toast.error(errors.dateTo.message.toString());
  };

  const handleResetFilters = () => {
    form.reset(defaultValues);
    setFromDate(undefined);
    setToDate(undefined);
    onFilterChange?.({});
  };

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="Filter Application"
      className="mt-2 w-full rounded-xl border border-[#E2E8F0]"
    >
      <AccordionItem value="Filter Application">
        <AccordionTrigger className="flex justify-between items-center p-5">
          <p className="text-xl font-medium text-[#272E35]">
            Filter Applicants
          </p>
        </AccordionTrigger>
        <AccordionContent className="p-4">
          <FormProvider {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit, onError)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                {/* Custom Select Fields */}
                <CustomField.SelectField
                  form={form}
                  name="agentId"
                  labelName="Agent"
                  placeholder="Select Agent"
                  options={agentList}
                />

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <CustomField.SelectField
                          form={form}
                          name="subAgentId"
                          labelName="Select Sub Agent List"
                          options={subAgentList}
                          placeholder="Select Sub Agent List"
                          disabled={!selectedRoasterId}
                        />
                        <div className="my-2">
                          <p className="text-[12px] text-gray-500">
                            Hint: Select an Agent First
                          </p>
                        </div>
                      </div>
                    </TooltipTrigger>
                    {!selectedRoasterId && (
                      <TooltipContent className="bg-gray-500">
                        <p className="text-[10px]">Select an Agent First</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>

                {/* <CustomField.SelectField
                  form={form}
                  name="organization"
                  labelName="Organization"
                  placeholder="Select Organization"
                  options={[
                    { label: "Org 1", value: "Org 1" },
                    { label: "Org 2", value: "Org 2" },
                  ]}
                /> */}

                <CustomField.SelectField
                  form={form}
                  name="admissionOfficerId"
                  labelName="Admission Officer"
                  placeholder="Select Officer"
                  options={admissionOfficers}
                />

                <CustomField.SelectField
                  form={form}
                  name="sessionId"
                  labelName="Academic Session"
                  placeholder="Select Session"
                  options={AcademicSession}
                />

                <CustomField.SelectField
                  form={form}
                  name="awardingBodyId"
                  labelName="Awarding Body"
                  placeholder="Select Awarding Body"
                  options={awardingBodyOptions}
                />

                <CustomField.SelectField
                  form={form}
                  name="courseId"
                  labelName="Programme/Course"
                  placeholder="Select Course"
                  options={courseOptionsforAwardingandSessionId}
                />

                <CustomField.SelectField
                  form={form}
                  name="year"
                  labelName="Year"
                  placeholder="Select Year"
                  options={[
                    { value: "None", label: "None" },
                    ...years.map((year) => ({
                      value: String(year),
                      label: String(year),
                    })),
                  ]}
                />

                {/* Start Date */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Start Date</label>
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
                        {fromDate ? (
                          format(fromDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={fromDate}
                        onSelect={(date) => handleDateChange("dateFrom", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* End Date */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">End Date</label>
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
                        {toDate ? (
                          format(toDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={toDate}
                        onSelect={(date) => handleDateChange("dateTo", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* <CustomField.SelectField
                  form={form}
                  name="applicationStatus"
                  labelName="Application Status"
                  placeholder="Select Status"
                  options={[
                    { label: "Draft", value: "DRAFT" },
                    { label: "Submit", value: "SUBMIT" },
                    { label: "Approved", value: "APPROVED" },
                    { label: "Rejected", value: "REJECTED" },
                  ]}
                /> */}

                <CustomField.SelectField
                  form={form}
                  name="nationality"
                  labelName="Nationality"
                  placeholder="Select Nationality"
                  options={countryList}
                  isImageShow={true}
                />

                <CustomField.SelectField
                  form={form}
                  name="interviewOutcome"
                  labelName="Interview Status"
                  placeholder="Select Status"
                  options={[
                    { label: "Pass", value: "PASS" },
                    { label: "Fail", value: "FAIL" },
                    { label: "Pending", value: "PENDING" },
                  ]}
                />

                {/* <CustomField.SelectField
                  form={form}
                  name="onlineAssessmentStatus"
                  labelName="Online Assessment"
                  placeholder="Select Status"
                  options={[
                    { label: "Draft", value: "DRAFT" },
                    { label: "Pending", value: "PENDING" },
                    { label: "Approved", value: "APPROVED" },
                    { label: "Rejected", value: "REJECTED" },
                  ]}
                /> */}

                {/* <CustomField.SelectField
                  form={form}
                  name="additionalFileCheck"
                  labelName="Additional File Check"
                  placeholder="Select Status"
                  options={[
                    { label: "Pending", value: "pending" },
                    { label: "Successful", value: "successful" },
                  ]}
                /> */}

                {/* <FormField
                  control={form.control}
                  name="additionalStages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Stages</FormLabel>
                      <FormControl>
                        <TreeSelect
                          treeData={stageTreeData}
                          value={field.value}
                          onChange={(value) => field.onChange(value)}
                          multiple
                          maxTagCount={6} // you can change to your MAX_COUNT
                          style={{ width: "100%", height: "40px" }}
                          treeCheckable
                          showCheckedStrategy={TreeSelect.SHOW_PARENT}
                          placeholder="Select stage(s)"
                          suffixIcon={<DownOutlined />}
                          allowClear
                          treeDefaultExpandAll
                          getPopupContainer={(triggerNode) =>
                            triggerNode.parentElement
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
              </div>

              {/* Actions */}
              <div className="flex gap-4 justify-end items-center">
                <ActionButton
                  handleOpen={handleResetFilters}
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
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
