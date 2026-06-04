/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/custom_ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { z } from "zod";
import { FormProvider, UseFormReturn } from "react-hook-form";
import DataFetcher from "@/hooks/fetchDataCollection/hooksExport";
import { Button } from "@/components/ui/custom_ui/button";
import { CustomField } from "@/components/common/fields/cusInputField";
import { useAdmissionOfficers } from "@/hooks/fetchDataCollection/useDataHooks";
import { useAuths } from "@/hooks/userContext";

interface AdvancedPaymentSystemFilterProps {
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

export function AdvancedPaymentSystemFilter({
  form,
  setFilter,
  isFilterOpen,
  setIsFilterOpen,
}: AdvancedPaymentSystemFilterProps) {
  const auth = useAuths();
  const token = auth?.user?.token;
  const onSubmit = (values: any) => {
    setFilter(values);
    setIsFilterOpen(false);
  };

  const { options: awardingBodyOptions } = DataFetcher.fetchAwardingBodies({
    filter: {
      pageSize: 100,
    },
  });

  const { options: courseOptions } = DataFetcher.fetchDiplomaDegreeCourses({
    filter: {
      pageSize: 100,
    },
  });

  const { data: admissionOfficers } = useAdmissionOfficers(token!);

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

  const agentSelectedId = !!form.watch("agentId");

  const { options: academicSessions } = DataFetcher.fetchAcademicSessions({
    filter: {
      pageSize: 100,
    },
  });

  return (
    <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
      <SheetContent className="overflow-y-auto max-h-screen">
        <div className="pb-20 h-full">
          <SheetHeader>
            <SheetTitle>Filter Advanced Payment System</SheetTitle>
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
                name="admissionOfficerId"
                labelName="Admission Officer"
                placeholder="Select Officer"
                options={admissionOfficers}
              />
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
                name="sessionId"
                labelName="Select Academic Sessions"
                options={academicSessions}
                placeholder="Select Academic Sessions"
              />
              <CustomField.SelectField
                form={form}
                name="paymentStatus"
                labelName="Payment Status"
                placeholder="Select Application Status"
                options={[
                  {
                    label: "Unpaid",
                    value: "UNPAID",
                  },
                  {
                    label: "Installment",
                    value: "INSTALLMENT",
                  },
                  {
                    label: "Paid",
                    value: "PAID",
                  },
                  {
                    label: "Overdue",
                    value: "OVERDUE",
                  },
                ]}
              />
              <div className="flex gap-2 justify-end items-center mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    form.reset();
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
