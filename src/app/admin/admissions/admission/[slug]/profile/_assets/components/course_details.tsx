/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
// AccordionDemo.tsx
import { getStepDefaultValues } from "@/app/(agent-portal)/agent/application-management/create/[id]/_assets/utils/get_step_default_value";
import { applicationSchema } from "@/app/Schema/Application/new_application";
import Academic_background_step_2 from "@/components/common/application/sections/academic_background_step_2";
import Criminal_background_step_9 from "@/components/common/application/sections/criminal_background_step_9";
import Disabilities_and_accessibility_step_5 from "@/components/common/application/sections/disabilities_and_accessibilities_step_5";
import Funds_step_7 from "@/components/common/application/sections/funds_step_7";
import Next_of_kin_step_6 from "@/components/common/application/sections/next_of_kin_step_6";
import Personal_information_step_1 from "@/components/common/application/sections/personal_information_step_1";
import Personal_statement_step_4 from "@/components/common/application/sections/personal_statement_step_4";
import References_step_8 from "@/components/common/application/sections/references_step_8";
import ActionButton from "@/components/common/button/actionButton";
import UpdateRequestDialog from "@/components/common/dialog/updateRequest/UpdateRequestDialog";
import { applicationSections } from "@/components/json/applicant_profile";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { useAuths } from "@/hooks/userContext";
import { TextCaseFormat } from "@/utils/textFormate";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FiInfo } from "react-icons/fi";
import { GrPowerReset } from "react-icons/gr";
import { z } from "zod";
import { UpdateProfileModal } from "./confirmationModal";
import Course_selection_step_3 from "./defaultStep/course_selection_step_3";

export function CourseDetails({ application }: any) {
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

  // console.log("application single application=", application);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [updateData, setUpdateData] = useState({});

  const { user, editAccess } = useAuths();
  const token = user?.token;
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);

  const disabled = !["ASSIGN", "CHECK"].includes(application?.stage ?? "");

  // const isDisabled = disabled || !editAccess;
  let currentData = application?.[steps[currentStep]];

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
    // TODO: --- start (courseId)
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

  type FormValues = z.infer<typeof applicationSchema.WithoutSupportingDoc>;
  type FieldName = keyof z.infer<typeof applicationSchema.WithoutSupportingDoc>;

  const updateApplicationMutation = useMutation({
    mutationFn: (newApplication: any) => {
      return axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/application-management/${application.id}`,
        newApplication,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    },
    onSuccess: () => {
      toast.success("Successfully updated user!");
      // saveOrUpdateDataById(ApplicationId, completeStepList);
      queryClient.invalidateQueries({ queryKey: ["single-application-data"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to updated user!");
    },
  });

  const handelUpdate = async () => {
    const isValid = await form.trigger([
      steps[currentStep] as keyof FormValues,
    ]);

    function removeEmptyValues(obj: any) {
      return Object.fromEntries(
        Object.entries(obj).filter(
          ([, value]) => value !== null && value !== "" && value !== undefined
        )
      );
    }

    if (isValid) {
      const updateValue = form.getValues([
        steps[currentStep],
      ] as FieldName[])[0];

      const value = { [steps[currentStep]]: removeEmptyValues(updateValue) };

      console.log("value", value);

      setIsDialogOpen(true);
      setUpdateData(value);

      // updateApplicationMutation.mutate(value);
    }
  };

  const handelOpenStep = (id: number) => {
    setCurrentStep(id);
    queryClient.invalidateQueries({ queryKey: ["single-application-data"] });
  };

  // file upload by drag and drop
  const onSubmit = (values: FormValues) => {
    console.log("Form values", values);
    // updateApplicationMutation.mutate(values);
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
        <div className="flex flex-col-reverse">
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
                    <AccordionContent className="py-1 px-2">
                      <hr className="mb-2" />
                      {item.id === "1" && (
                        <Course_selection_step_3 viewOnly={true} form={form} />
                      )}
                      {item.id === "2" && (
                        <Personal_information_step_1
                          viewOnly={disabled}
                          form={form}
                        />
                      )}
                      {item.id === "3" && (
                        <Academic_background_step_2
                          form={form}
                          viewOnly={disabled}
                        />
                      )}

                      {item.id === "4" && (
                        <Personal_statement_step_4
                          viewOnly={disabled}
                          form={form}
                        />
                      )}

                      {item.id === "5" && (
                        <div className="min-h-[270px]">
                          <Disabilities_and_accessibility_step_5
                            viewOnly={disabled}
                            form={form}
                          />
                        </div>
                      )}
                      {item.id === "6" && (
                        <Next_of_kin_step_6 viewOnly={disabled} form={form} />
                      )}
                      {item.id === "7" && (
                        <Funds_step_7 viewOnly={disabled} form={form} />
                      )}
                      {item.id === "8" && (
                        <References_step_8 viewOnly={disabled} form={form} />
                      )}
                      {item.id === "9" && (
                        <Criminal_background_step_9
                          viewOnly={disabled}
                          form={form}
                        />
                      )}

                      <div className="flex flex-wrap gap-2 justify-between items-center lg:p-4 mt-6">
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

                        <div className="flex gap-2 items-center ml-auto">
                          <UpdateRequestDialog
                            disabled={
                              currentStep === 0 ||
                              currentStep === 4 ||
                              currentStep === 8 ||
                              disabled ||
                              !editAccess
                            }
                            value={steps[currentStep]}
                          />
                          <ActionButton
                            disabled={
                              currentStep === 0 ||
                              currentStep === 4 ||
                              currentStep === 8 ||
                              disabled
                            }
                            variant="confirm"
                            btnStyle="font-semibold text-[#555F6D]"
                            handleOpen={() => {
                              setCurrentStep(i);
                              handelUpdate();
                            }}
                            buttonContent="Update"
                            icon={
                              <GrPowerReset
                                strokeWidth={6}
                                size={7}
                                color="#0C456E"
                              />
                            }
                          />
                        </div>
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
