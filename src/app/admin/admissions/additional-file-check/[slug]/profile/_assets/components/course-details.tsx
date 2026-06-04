/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { updateFormSchema } from "@/app/(agent-portal)/agent/application-management/[id]/_assets/interface/application/new_application";
import Academic_background_step_2 from "@/components/common/application/sections/academic_background_step_2";
import Course_selection_step_3 from "@/components/common/application/sections/course_selection_step_3";
import Criminal_background_step_9 from "@/components/common/application/sections/criminal_background_step_9";
import Disabilities_and_accessibility_step_5 from "@/components/common/application/sections/disabilities_and_accessibilities_step_5";
import Funds_step_7 from "@/components/common/application/sections/funds_step_7";
import Next_of_kin_step_6 from "@/components/common/application/sections/next_of_kin_step_6";
import Personal_information_step_1 from "@/components/common/application/sections/personal_information_step_1";
import Personal_statement_step_4 from "@/components/common/application/sections/personal_statement_step_4";
import References_step_8 from "@/components/common/application/sections/references_step_8";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { TextCaseFormat } from "@/utils/textFormate";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import type { z } from "zod";
import { default_values } from "../../utils/profileDefaultValue";

const demoData = [
  {
    id: "1",
    title: "Personal Information",
  },
  {
    id: "2",
    title: "Academic Background",
  },
  {
    id: "3",
    title: "Course Selection",
  },
  {
    id: "4",
    title: "Personal Statement",
  },
  {
    id: "5",
    title: "Disability And Accessibility",
  },
  {
    id: "6",
    title: "Next of Kin",
  },
  {
    id: "7",
    title: "Funds",
  },
  {
    id: "8",
    title: "References",
  },
  {
    id: "9",
    title: "Criminal Background",
  },
];

const steps = [
  "courseSelection",
  "personalInformation",
  "academicBackground",
  "personalStatement",
  "disabilityAndAccessibility",
  "nextOfKin",
  "fund",
  "references",
  "criminalBackground",
  "supportingDocument",
];

export function CourseDetails({ application }: any) {
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm<z.infer<typeof updateFormSchema>>({
    resolver: zodResolver(updateFormSchema),
    defaultValues: {
      [steps[currentStep]]: {
        ...default_values[steps[currentStep] as keyof typeof default_values],
      },
    },
    mode: "onChange",
  });

  // Set form values from application data
  useEffect(() => {
    if (application) {
      steps.forEach((step) => {
        const currentData = application?.[step];
        if (currentData !== null && currentData !== undefined) {
          const fieldsToRemove = [
            "id",
            "createdAt",
            "updatedAt",
            "applicationId",
          ];
          const cleanData = { ...currentData };

          fieldsToRemove.forEach((field) => delete cleanData?.[field]);

          // Convert dateOfBirth to Date object if it exists
          if (cleanData.dateOfBirth) {
            cleanData.dateOfBirth = new Date(cleanData.dateOfBirth);
          }

          form.setValue(step as any, cleanData);
        }
      });
    }
  }, [application, form]);

  const handleOpenStep = (index: number) => {
    setCurrentStep(index);
  };

  function splitCamelCase(str: string) {
    const result = str.replace(/([a-z])([A-Z])/g, "$1 $2");
    const splitString = result.charAt(0).toUpperCase() + result.slice(1);
    return TextCaseFormat(splitString);
  }

  return (
    <FormProvider {...form}>
      <div className="w-full">
        <Accordion
          type="single"
          collapsible
          className="mt-8 w-full"
          defaultValue={demoData[0].id}
        >
          {demoData.map((item, i) => (
            <Card className="mb-3" key={item.id}>
              <AccordionItem value={item.id}>
                <AccordionTrigger
                  onClick={() => handleOpenStep(i)}
                  className="p-4 font-semibold text-black"
                >
                  {splitCamelCase(steps[i])}
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-3 px-2">
                  <hr className="mb-2" />
                  {item.id === "1" && (
                    <Course_selection_step_3 viewOnly={true} form={form} />
                  )}
                  {item.id === "2" && (
                    <Personal_information_step_1 viewOnly={true} form={form} />
                  )}
                  {item.id === "3" && (
                    <Academic_background_step_2 viewOnly={true} form={form} />
                  )}
                  {item.id === "4" && (
                    <Personal_statement_step_4 viewOnly={true} form={form} />
                  )}
                  {item.id === "5" && (
                    <Disabilities_and_accessibility_step_5
                      viewOnly={true}
                      form={form}
                    />
                  )}
                  {item.id === "6" && (
                    <Next_of_kin_step_6 viewOnly={true} form={form} />
                  )}
                  {item.id === "7" && (
                    <Funds_step_7 viewOnly={true} form={form} />
                  )}
                  {item.id === "8" && (
                    <References_step_8 viewOnly={true} form={form} />
                  )}
                  {item.id === "9" && (
                    <Criminal_background_step_9 viewOnly={true} form={form} />
                  )}
                </AccordionContent>
              </AccordionItem>
            </Card>
          ))}
        </Accordion>
      </div>
    </FormProvider>
  );
}
