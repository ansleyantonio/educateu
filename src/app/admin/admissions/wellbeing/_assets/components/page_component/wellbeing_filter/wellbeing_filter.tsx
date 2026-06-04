/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/custom_ui/sheet";
import {
  FormLabel,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import dateFormat from "@/utils/DateFormatter";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FormProvider, UseFormReturn } from "react-hook-form";
import DataFetcher from "@/hooks/fetchDataCollection/hooksExport";
import { CustomField } from "@/components/common/fields/cusInputField";
import { Button } from "@/components/ui/custom_ui/button";
import { nationality } from "@/components/json/CountriesJson";

interface WellBeingFilterProps {
  form: UseFormReturn<any, any>;
  setFilter: (filter: any) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (isFilterOpen: boolean) => void;
}

interface AgentOption {
  label: string;
  value: string;
  id: string;
}

export function WellBeingFilter({
  form,
  setFilter,
  isFilterOpen,
  setIsFilterOpen,
}: WellBeingFilterProps) {
  const { options: awardingBodyOptions } = DataFetcher.fetchAwardingBodies({
    filter:{
      pageSize: 100,
    }
  });
  const { options: courseOptions } = DataFetcher.fetchDiplomaDegreeCourses({
    filter:{
      pageSize: 100,
    }
  });
  const { options: academicSessions } = DataFetcher.fetchAcademicSessions({
    filter:{
      pageSize: 100,
    }
  });
  const { options: agentList } = DataFetcher.fetchAgentList({
    filter:{
      pageSize: 100,
    }
  }) as {
    options: AgentOption[];
  };
  const selectedRoasterId = form.watch("agentId");
  const selectedAgent = agentList.find((a) => a.value === selectedRoasterId);
  const agentIdForSubAgents = selectedAgent?.id;

  const { options: subAgentList } = DataFetcher.fetchSubAgentList({
    filter:{
      pageSize: 100,
    },
    agentId: agentIdForSubAgents,
  });

  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();

  const agentSelectedId = !!form.watch("agentId");

  const onSubmit = (values: any) => {
    setFilter(values);
    setIsFilterOpen(false);
  };

  // const handleDateChange = (
  //   key: "dateFrom" | "dateTo",
  //   date: Date | undefined,
  // ) => {
  //   if (key === "dateFrom") {
  //     setFromDate(date);
  //     if (toDate && date && date > toDate) {
  //       setToDate(undefined);
  //       form.setValue("dateTo", "");
  //     }
  //   } else {
  //     setToDate(date);
  //     if (fromDate && date && date < fromDate) {
  //       setFromDate(undefined);
  //       form.setValue("dateFrom", "");
  //     }
  //   }
  //   form.setValue(key, date ? dateFormat.localDateToISOWithZ(date) : "");
  // };

  return (
    <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
      <SheetContent className="overflow-y-auto max-h-screen">
        <div className="pb-20 h-full">
          <SheetHeader>
            <SheetTitle>Filter Wellbeing Applicants</SheetTitle>
          </SheetHeader>

          <FormProvider {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-9 space-y-4"
            >
              <CustomField.SelectField
                form={form}
                name="awardingBodyId"
                labelName="Select Awarding Body"
                options={awardingBodyOptions}
                placeholder="Select Awarding Body"
              />
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
                labelName="Select Academic Sessions"
                options={academicSessions}
                placeholder="Select Academic Sessions"
              />
              {/* <FormField
                control={form.control}
                name="dateFrom"
                render={({ field }) => {
                  const fromDate = field.value
                    ? new Date(field.value)
                    : undefined;
                  return (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !fromDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 w-4 h-4" />
                            {fromDate
                              ? format(fromDate, "PPP")
                              : "Pick a start date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start">
                          <Calendar
                            mode="single"
                            selected={fromDate}
                            onSelect={(date) =>
                              handleDateChange("dateFrom", date)
                            }
                            disabled={(date) =>
                              toDate ? date > toDate : false
                            }
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="dateTo"
                render={({ field }) => {
                  const toDate = field.value
                    ? new Date(field.value)
                    : undefined;
                  const fromDate = form.getValues("dateFrom")
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
                              !toDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 w-4 h-4" />
                            {toDate
                              ? format(toDate, "PPP")
                              : "Pick an end date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start">
                          <Calendar
                            mode="single"
                            selected={toDate}
                            onSelect={(date) =>
                              handleDateChange("dateTo", date)
                            }
                            disabled={(date) =>
                              fromDate ? date < fromDate : false
                            }
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              /> */}
              <CustomField.SelectField
                form={form}
                name="agentId"
                labelName="Select Agent List"
                options={agentList}
                placeholder="Select Agent List"
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
                        disabled={!agentSelectedId}
                      />
                      <div className="my-2">
                        <p className="text-[12px] text-gray-500">
                          Hint: Select an Agent First
                        </p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  {!agentSelectedId && (
                    <TooltipContent className="bg-gray-500">
                      <p className="text-[10px]">Select an Agent First</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>

              <CustomField.SelectField
                form={form}
                name="nationality"
                labelName="Select Nationality"
                options={nationality}
                placeholder="Select Nationality"
                isImageShow={true}
              />
              <CustomField.SelectField
                form={form}
                name="applicationStatus"
                labelName="Well Being Status"
                placeholder="Select Application Status"
                options={[
                  {
                    label: "Pending",
                    value: "PENDING",
                  },
                  {
                    label: "Approved",
                    value: "APPROVED",
                  },
                  {
                    label: "Rejected",
                    value: "REJECTED",
                  },
                ]}
              />
              <div className="flex gap-2 justify-end items-center mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    form.reset();
                    form.setValue("applicationStatus", "");
                  }}
                >
                  Clear
                </Button>

                <Button type="submit" variant="primary">
                  Apply
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </SheetContent>
    </Sheet>
  );
}
