/* eslint-disable no-unused-vars */
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import ActionButton from "@/components/common/button/actionButton";
import { CustomField } from "@/components/common/fields/cusInputField";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import onFormError from "@/utils/formError";
import { RefreshCw } from "lucide-react";
import { useForm } from "react-hook-form";

type FilterFormValues = {
  applicationStatus: string;
  applicationStage: string;
  subAgent: string;
  intakePeriod: string;
  awardingBody: string;
  emailStatus: string;
  interviewStatus: string;
  interviewOutcome: string;
  offerResponse: string;
};

interface Props {
  onFilterChange?: (filters: FilterFormValues) => void;
}

export function ApplicationManagementFilter({ onFilterChange }: Props) {
  const form = useForm<FilterFormValues>({
    defaultValues: {
      applicationStatus: "",
      applicationStage: "",
      subAgent: "",
      intakePeriod: "",
      awardingBody: "",
      emailStatus: "",
      interviewStatus: "",
      interviewOutcome: "",
      offerResponse: "",
    },
  });

  const handleReset = () => {
    form.reset();
    if (onFilterChange) onFilterChange({} as FilterFormValues);
  };

  const onSubmit = (data: FilterFormValues) => {
    if (onFilterChange) onFilterChange(data);
  };

  const { data: subAgentsData } = useFetchData({
    queryKey: "fetch-All-sub-agents",
    path: `sub-agent-management`,
    method: "GET",
  });

  const { data: awardingBodiesData } = useFetchData({
    queryKey: "fetch-list-of-awarding-bodies",
    method: "GET",
    path: `application-management/awarding-bodies`,
  });

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="Application Management Filter"
      className="mt-2 w-full rounded-xl border border-[#E2E8F0]"
    >
      <AccordionItem value="Application Management Filter">
        <AccordionTrigger className="flex justify-between items-center p-5">
          <p className="text-xl font-medium text-[#272E35]">
            Application Management Filter
          </p>
        </AccordionTrigger>
        <AccordionContent className="p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onFormError)}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-5">
                <CustomField.SelectField
                  form={form}
                  name="applicationStatus"
                  labelName="Application Status"
                  placeholder="Select Status"
                  options={[
                    { label: "Draft", value: "DRAFT" },
                    { label: "Pending", value: "PENDING" },
                    { label: "Approved", value: "APPROVED" },
                    { label: "Rejected", value: "REJECTED" },
                  ]}
                />
                <CustomField.SelectField
                  form={form}
                  name="applicationStage"
                  labelName="Application Stage"
                  placeholder="Select Stage"
                  options={[
                    { label: "New", value: "NEW" },
                    { label: "Assign", value: "ASSIGN" },
                    { label: "Check", value: "CHECK" },
                    { label: "Submit", value: "SUBMIT" },
                    { label: "Outcome", value: "OUTCOME" },
                  ]}
                />

                <CustomField.SelectField
                  form={form}
                  name="awardingBody"
                  labelName="Awarding Body"
                  placeholder="Select Awarding Body"
                  options={
                    awardingBodiesData?.data?.awardingBodies.map(
                      (body: any) => ({
                        label: body.name,
                        value: body.id,
                      })
                    ) || []
                  }
                />

                <CustomField.SelectField
                  form={form}
                  name="subAgent"
                  labelName="Sub Agent"
                  placeholder="Select Sub Agent"
                  options={
                    subAgentsData?.data?.users?.map((agent: any) => ({
                      label: `${agent.firstName} ${agent.lastName}`,
                      value: agent.id,
                    })) || []
                  }
                />
                {/* Needs to be discussed */}
                <CustomField.SelectField
                  form={form}
                  name="intakePeriod"
                  labelName="Intake Period"
                  placeholder="Select Intake"
                  options={[
                    { value: "january-april", label: "January-April" },
                    { value: "may-august", label: "May-August" },
                    {
                      value: "september-december",
                      label: "September-December",
                    },
                  ]}
                />

                <CustomField.SelectField
                  form={form}
                  name="emailStatus"
                  labelName="Email Verification Status"
                  placeholder="Select Email Status"
                  options={[
                    { label: "Verified", value: "VERIFIED" },
                    { label: "Unverified", value: "UNVERIFIED" },
                  ]}
                />

                <CustomField.SelectField
                  form={form}
                  name="interviewStatus"
                  labelName="Interview Booking Status"
                  placeholder="Select Interview Status"
                  options={[
                    { label: "Booked", value: "BOOKED" },
                    { label: "Pending", value: "PENDING" },
                  ]}
                />

                <CustomField.SelectField
                  form={form}
                  name="interviewOutcome"
                  labelName="Interview Outcome"
                  placeholder="Select Outcome"
                  options={[
                    { label: "Pending", value: "PENDING" },
                    { label: "Pass", value: "PASS" },
                    { label: "Fail", value: "FAIL" },
                  ]}
                />

                <CustomField.SelectField
                  form={form}
                  name="offerResponse"
                  labelName="Offer Response"
                  placeholder="Select Response"
                  options={[
                    // { label: "Unconditional Offer", value: "APPROVED" },
                    {
                      label: "APPROVED CONDITIONAL",
                      value: "APPROVED_CONDITIONAL",
                    },
                    { label: "REJECTED", value: "REJECTED" },
                    {
                      label: "APPROVED UNCONDITIONAL",
                      value: "APPROVED_UNCONDITIONAL",
                    },
                  ]}
                />
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
}
