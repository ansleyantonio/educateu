/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { applicationSchema } from "@/app/Schema/Application/new_application";
import { applicationSections } from "@/components/json/applicant_profile";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextCaseFormat } from "@/utils/textFormate";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { FiInfo } from "react-icons/fi";
import { GrPowerReset } from "react-icons/gr";
import { z } from "zod";
import Academic_background_step_2 from "../../../../_assets/components/application/sections/academic_background_step_2";
import Course_selection_step_3 from "../../../../_assets/components/application/sections/course_selection_step_3";
import Criminal_background_step_9 from "../../../../_assets/components/application/sections/criminal_background_step_9";
import Disabilities_and_accessibility_step_5 from "../../../../_assets/components/application/sections/disabilities_and_accessibilities_step_5";
import Funds_step_7 from "../../../../_assets/components/application/sections/funds_step_7";
import Next_of_kin_step_6 from "../../../../_assets/components/application/sections/next_of_kin_step_6";
import Personal_information_step_1 from "../../../../_assets/components/application/sections/personal_information_step_1";
import Personal_statement_step_4 from "../../../../_assets/components/application/sections/personal_statement_step_4";
import References_step_8 from "../../../../_assets/components/application/sections/references_step_8";
import { getStepDefaultValues } from "../../../../create/[id]/_assets/utils/get_step_default_value";
import { new_application } from "../../../_assets/interface/application/new_application";
import { UpdateProfileModal } from "./confirmationModal";

export function CourseDetails({ application }: any) {
  // console.log("application single application=", application);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [updateData, setUpdateData] = useState({});

  const steps = [
    "courseSelection",
    "personalInformation",
    "academicBackground",
    "personalStatement",
    "disabilityAndAccessibility",
    "nextOfKin",
    "fund",
    "reference",
    "criminalBackground",
  ];

  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  // default step open

  // console.log("application", application);
  type FieldNameStepNumber = keyof z.infer<
    typeof new_application.CreateFromSchema
  >;

  const searchParams = useSearchParams();
  let currentData = application?.[steps[currentStep]];

  // Example: getting a query key called "id"
  const open = searchParams.get("open");
  // console.log("open", open);
  // console.log("applicationSections?.[0]?.id", applicationSections?.[0]?.id);
  // const stepNumber = open
  //   ? findOutStepNumberByFieldName(open as FieldNameStepNumber)
  //   : 1;

  // const dd = open ? stepNumber : `1`;
  // const [openStep, setOpenStep] = useState(0);

  const form = useForm<z.infer<typeof applicationSchema.WithoutSupportingDoc>>({
    resolver: zodResolver(applicationSchema.WithoutSupportingDoc),
    defaultValues: {
      [steps[currentStep]]: getStepDefaultValues(
        steps[currentStep],
        currentData
      ),
    },
    mode: "onChange",
  });

  // Now you can access the form object
  useEffect(() => {
    // TODO --- start (courseId)
    if (currentData?.courseId && currentStep == 0) {
      const { courseId, ...rest } = currentData;
      currentData = { ...rest, course: courseId };
    }

    if (currentData !== null && currentData !== undefined) {
      form.reset({
        [steps[currentStep]]: getStepDefaultValues(
          steps[currentStep],
          currentData
        ),
        // [steps[currentStep]]: currentData,
      });
    }
  }, [application, currentStep, form]);
  // console.log("sss", application);

  type FormValues = z.infer<typeof applicationSchema.WithoutSupportingDoc>;
  type FieldName = keyof z.infer<typeof applicationSchema.WithoutSupportingDoc>;

  const handelUpdate = async () => {
    const isValid = await form.trigger([
      steps[currentStep] as keyof FormValues,
    ]);

    function removeEmptyValues(obj: any) {
      return Object.fromEntries(
        Object.entries(obj).filter(
          ([_, value]) => value !== null && value !== "" && value !== undefined
        )
      );
    }

    if (isValid) {
      const updateValue = form.getValues([
        steps[currentStep],
      ] as FieldName[])[0];

      const value = { [steps[currentStep]]: removeEmptyValues(updateValue) };

      // console.log("value", value);

      setIsDialogOpen(true);
      setUpdateData(value);
      // updateApplicationMutation.mutate(value);
    }
  };

  const handelOpenStep = (id: number) => {
    setCurrentStep(id);
    queryClient.invalidateQueries({ queryKey: ["single-application-data"] });
  };

  // console.log("current", currentStep);

  // file upload by drag and drop

  const onSubmit = (values: FormValues) => {
    // console.log("Form values", values);
  };

  function splitCamelCase(str: string) {
    const result = str.replace(/([a-z])([A-Z])/g, "$1 $2");
    const splitString = result.charAt(0).toUpperCase() + result.slice(1);
    return TextCaseFormat(splitString);
  }

  return (
    <FormProvider {...form}>
      {/* update modal open */}
      <UpdateProfileModal
        updateData={updateData}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        applicationIid={application?.id}
      />
      <form onSubmit={form.handleSubmit(onSubmit)} className="">
        <div className="flex  flex-col-reverse ">
          <Accordion
            type="single"
            collapsible
            className="mt-8 w-full"
            defaultValue={`item-0`}
          >
            {applicationSections?.map((item, i) => (
              <>
                <Card className="mb-3" key={item.id}>
                  <AccordionItem value={`item-${i.toString()}`}>
                    <AccordionTrigger
                      onClick={() => handelOpenStep(i)}
                      className="p-4 font-semibold text-black"
                    >
                      {splitCamelCase(steps[i])}
                    </AccordionTrigger>
                    <AccordionContent className="px-2 py-1">
                      <hr className="mb-2" />
                      {item.id === "1" && (
                        <Course_selection_step_3 viewOnly={true} form={form} />
                      )}
                      {item.id === "2" && (
                        <Personal_information_step_1 form={form} />
                      )}
                      {item.id === "3" && (
                        <Academic_background_step_2 form={form} />
                      )}

                      {item.id === "4" && (
                        <Personal_statement_step_4 form={form} />
                      )}

                      {item.id === "5" && (
                        <div className="min-h-[270px]">
                          <Disabilities_and_accessibility_step_5 form={form} />
                        </div>
                      )}
                      {item.id === "6" && <Next_of_kin_step_6 form={form} />}
                      {item.id === "7" && <Funds_step_7 form={form} />}
                      {item.id === "8" && <References_step_8 form={form} />}
                      {item.id === "9" && (
                        <Criminal_background_step_9 form={form} />
                      )}

                      <div className="flex justify-between gap-2 items-center p-4 mt-6">
                        <div className="flex gap-2 items-center">
                          <FiInfo size={20} color="#555F6D" />
                          <p className="text-sm font-thin leading-5">
                            <span className="text-red-400">
                              {item.note.split(" ").slice(0, 2).join(" ")}
                            </span>
                            <span className="text-[#272E35]">
                              &nbsp;
                              {item.note.split(" ").slice(2).join(" ")}
                            </span>
                            <span className="text-[#555F6D]">
                              &nbsp;{item.note2}
                            </span>
                          </p>
                        </div>
                        <Button
                          disabled={currentStep === 0}
                          variant="secondary"
                          size={"sm"}
                          className="text-sm rounded-full  text-[#555F6D] bg-[#34C75959] "
                          onClick={() => {
                            setCurrentStep(i);
                            handelUpdate();
                          }}
                        >
                          <GrPowerReset size={7} color="#0C456E" />

                          <p className="text-sm">Update</p>
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Card>
              </>
            ))}
          </Accordion>
        </div>
      </form>
    </FormProvider>
  );
}
