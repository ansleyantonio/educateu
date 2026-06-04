/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { nationality } from "@/components/json/CountriesJson";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/custom_ui/sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { CustomField } from "@/components/common/fields/cusInputField";
import { IFilterLists } from "./data_type";
import DataFetcher from "@/hooks/fetchDataCollection/hooksExport";
import { useAdmissionOfficers } from "@/hooks/fetchDataCollection/useDataHooks";
import { useAuths } from "@/hooks/userContext";

interface ApplicantTableFilterProps {
  filterLists?: Partial<IFilterLists>;
  setFilterLists: (filterLists: IFilterLists | undefined) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (isFilterOpen: boolean) => void;
}

interface AgentOption {
  label: string;
  value: string;
  id: string;
}

// Zod schema
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
    interviewStatus: z.string().optional(),
    onlineAssessmentStatus: z.string().optional(),
    additionalFileCheck: z.string().optional(),
    additionalStages: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.dateFrom || !data.dateTo) return true;
      return new Date(data.dateFrom) <= new Date(data.dateTo);
    },
    { message: "Start date cannot be after end date", path: ["dateTo"] }
  );

export const defaultValues: z.infer<typeof formSchema> = {
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
  interviewStatus: "",
  onlineAssessmentStatus: "",
  additionalFileCheck: "",
  additionalStages: "",
};

export function ApplicantTableFilter({
  setFilterLists,
  isFilterOpen,
  setIsFilterOpen,
  filterLists,
}: ApplicantTableFilterProps) {
  const auth = useAuths();
  const token = auth?.user?.token;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { options: AwardingBody } = DataFetcher.fetchAwardingBodies({
    filter: {
      pageSize: 100,
    },
  });
  const { options: courses } = DataFetcher.fetchCourses({
    filter: {
      pageSize: 100,
    },
  });
  const { options: AcademicSession } = DataFetcher.fetchAcademicSessions({
    filter: {
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

  const { data: admissionOfficers } = useAdmissionOfficers(token!);

  useEffect(() => {
    if (filterLists) {
      form.reset(filterLists);
    } else {
      form.reset(defaultValues);
      setFromDate(undefined);
      setToDate(undefined);
    }
  }, [filterLists, form]);

  const years = Array.from({ length: 50 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: String(year), label: String(year) };
  });

  const selectedRoasterId = form.watch("agentId");
  const selectedAgent = agentList.find((a) => a.value === selectedRoasterId);
  const agentIdForSubAgents = selectedAgent?.id;

  const { options: subAgentList } = DataFetcher.fetchSubAgentList({
    agentId: agentIdForSubAgents,
  });

  const applicationStatusOptions = [
    { value: "DRAFT", label: "Draft" },
    { value: "APPROVED", label: "Approved" },
    { value: "REJECTED", label: "Rejected" },
  ];

  const onlineAssessmentOptions = [
    { value: "DRAFT", label: "Draft" },
    { value: "PENDING", label: "Pending" },
    { value: "APPROVED", label: "Approved" },
    { value: "REJECTED", label: "Rejected" },
  ];

  const interviewStatusOptions = [
    { value: "PENDING", label: "Pending" },
    { value: "SUCCESSFUL", label: "Successful" },
  ];

  const additionalFileCheckOptions = [
    { value: "pending", label: "Pending" },
    { value: "successful", label: "Successful" },
  ];

  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();

  const handleDateChange = (
    key: "dateFrom" | "dateTo",
    date: Date | undefined
  ) => {
    if (key === "dateTo" && fromDate && date && date < fromDate) {
      // Prevent end date before start date
      return;
    }
    form.setValue(key, date ? date.toISOString() : "");
    if (key === "dateFrom") setFromDate(date);
    if (key === "dateTo") setToDate(date);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setFilterLists(values);
    setIsFilterOpen(false);
  };

  const handleResetFilters = () => {
    form.reset(defaultValues);
    setFromDate(undefined);
    setToDate(undefined);
    setFilterLists(undefined);
    setIsFilterOpen(false);
  };

  return (
    <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
      <SheetContent className="overflow-y-auto max-h-screen">
        <div className="pb-20 h-full">
          <SheetHeader>
            <SheetTitle>Filter Applicants</SheetTitle>
          </SheetHeader>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        labelName="Sub Agent"
                        placeholder="Select Sub Agent"
                        options={subAgentList}
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
              {/* <CustomField.SelectField form={form} name="organization" labelName="Organization" placeholder="Select Organization" options={[{ value: "Org 1", label: "Org 1" }, { value: "Org 2", label: "Org 2" }]} /> */}

              <CustomField.SelectField
                form={form}
                name="admissionOfficerId"
                labelName="Admission Officer"
                placeholder="Select Officer"
                options={admissionOfficers}
              />
              <CustomField.SelectField
                form={form}
                name="awardingBodyId"
                labelName="Awarding Body"
                placeholder="Select Awarding Body"
                options={AwardingBody}
              />
              <CustomField.SelectField
                form={form}
                name="courseId"
                labelName="Programme/Course"
                placeholder="Select Course"
                options={courses}
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
                name="year"
                labelName="Year"
                placeholder="Select Year"
                options={[{ value: "None", label: "None" }, ...years]}
              />
              <CustomField.SelectField
                form={form}
                name="applicationStatus"
                labelName="Application Status"
                placeholder="Select Status"
                options={applicationStatusOptions}
              />

              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="dateFrom"
                  render={() => (
                    <FormItem>
                      <label className="cusFormLabel">Start Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full justify-start text-left font-normal ${
                              !fromDate ? "text-muted-foreground" : ""
                            }`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {fromDate ? format(fromDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={fromDate}
                            onSelect={(date) =>
                              handleDateChange("dateFrom", date)
                            }
                            initialFocus
                            disabled={(date) => !!toDate && date > toDate}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateTo"
                  render={() => (
                    <FormItem>
                      <label className="cusFormLabel">End Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full justify-start text-left font-normal ${
                              !toDate ? "text-muted-foreground" : ""
                            }`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {toDate ? format(toDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={toDate}
                            onSelect={(date) =>
                              handleDateChange("dateTo", date)
                            }
                            initialFocus
                            disabled={(date) => !!toDate && date > toDate}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <CustomField.SelectField
                form={form}
                name="nationality"
                labelName="Nationality"
                placeholder="Select Nationality"
                options={nationality}
              />
              {/* <CustomField.SelectField form={form} name="interviewStatus" labelName="Interview Status" placeholder="Select Status" options={interviewStatusOptions} /> */}
              {/* <CustomField.SelectField form={form} name="onlineAssessmentStatus" labelName="Online Assessment" placeholder="Select Status" options={onlineAssessmentOptions} /> */}
              {/* <CustomField.SelectField form={form} name="additionalFileCheck" labelName="Additional File Check" placeholder="Select Status" options={additionalFileCheckOptions} /> */}
              {/* <CustomField.SelectField form={form} name="additionalStages" labelName="Additional Stages" placeholder="Select Stages" options={[]} /> */}

              {/* Actions */}
              <div className="flex justify-between items-center">
                <Button
                  type="button"
                  onClick={handleResetFilters}
                  variant="outline"
                  className="font-semibold"
                >
                  Reset
                </Button>
                <Button type="submit" className="font-semibold bg-blue-600">
                  Apply Filter
                </Button>
              </div>
            </form>
          </FormProvider>
          <div className="h-10" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
