"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CustomInputField } from "@/components/common/fields/custom_input_field";
import { SelectField } from "@/components/common/fields/SelectField";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

type FilterFormValues = {
  applicationId: string;
  agent: string;
  studentStatus: string;
  awardingBody: string;
  academicSession: string;
  admittedCourse: string;
  registeredCourse: string;
  yearofEntry: string;
  module: string;
  cohort: string;
};

export const FilterComponent = () => {
  const form = useForm<FilterFormValues>({
    defaultValues: {
      applicationId: "",
      agent: "",
      studentStatus: "",
      awardingBody: "",
      academicSession: "",
      admittedCourse: "",
      registeredCourse: "",
      yearofEntry:"",
      module: "",
      cohort: ""
    },
  });

  const onSubmit = (data: FilterFormValues) => {
    console.log("Filter data:", data);
  };

  const handleReset = () => {
    form.reset();
  };

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
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
                <CustomInputField.Text
                  fControl={form.control}
                  name="applicationId"
                  labelName="Application ID"
                />
                <SelectField
                  control={form.control}
                  name="agent"
                  label="Agent"
                  options={[
                    { value: "agentA", label: "Agent A" },
                    { value: "agentB", label: "Agent B" },
                    { value: "agentC", label: "Agent C" },
                  ]}
                />
                <SelectField
                  control={form.control}
                  name="studentStatus"
                  label="Student Status"
                  options={[
                    { value: "active", label: "Active" },
                    { value: "inactive ", label: "Inactive " },
                  ]}
                />
                <CustomInputField.Text
                  fControl={form.control}
                  name="awardingBody"
                  labelName="Awarding Body"
                />
                <SelectField
                  control={form.control}
                  name="academicSession"
                  label="Academic Session"
                  options={[
                    { value: "summer", label: "Summer" },
                    { value: "spring", label: "Spring" },
                    { value: "fall", label: "Fall" },
                  ]}
                />
                <SelectField
                  control={form.control}
                  name="admittedCourse"
                  label="Admitted Course"
                  options={[
                    { value: "CSE", label: "Computer Science and Engineering" },
                    { value: "EEE", label: "Electrical & Electronics Engineering" },
                    { value: "BBA", label: "Bachelor of Business and Administration" },
                  ]}
                />
                <SelectField
                  control={form.control}
                  name="registeredCourse"
                  label="Registered Course"
                  options={[
                    { value: "CSE", label: "Computer Science and Engineering" },
                    { value: "EEE", label: "Electrical & Electronics Engineering" },
                    { value: "BBA", label: "Bachelor of Business and Administration" },
                  ]}
                />
                <SelectField
                  control={form.control}
                  name="yearofEntry"
                  label="Year of Entry"
                  options={[
                    { value: "2020", label: "2020" },
                    { value: "2021", label: "2021" },
                    { value: "2022", label: "2022" },
                  ]}
                />
                <SelectField
                  control={form.control}
                  name="module"
                  label="Module"
                  options={[
                    { value: "module1", label: "Module 1" },
                    { value: "module2", label: "Module 2" },
                  ]}
                />
                <SelectField
                  control={form.control}
                  name="cohort"
                  label="Cohort"
                  options={[
                    { value: "february2025", label: "February 2025" },
                    { value: "february2024", label: "February 2024" },
                  ]}
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="secondary" onClick={handleReset}>
                  Reset
                </Button>
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
