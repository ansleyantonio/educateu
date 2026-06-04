/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { applicationSchema } from "@/app/Schema/Application/new_application";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import DataLoader from "@/components/common/GlobalLoader/dataLoader";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getCompleteStepList,
  saveOrUpdateDataById,
} from "@/utils/LocalStorageCRUD";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Loader2, Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { GoDotFill } from "react-icons/go";
import { z } from "zod";
import { FileItem } from "../../[id]/document/_assets/type/interface";
import ApplicationManagementRadialProgress from "../../_assets/components/application/application_management_radial_progress";
import Academic_background_step_2 from "../../_assets/components/application/sections/academic_background_step_2";
import Course_selection_step_3 from "../../_assets/components/application/sections/course_selection_step_3";
import Criminal_background_step_9 from "../../_assets/components/application/sections/criminal_background_step_9";
import Disabilities_and_accessibility_step_5 from "../../_assets/components/application/sections/disabilities_and_accessibilities_step_5";
import Funds_step_7 from "../../_assets/components/application/sections/funds_step_7";
import Next_of_kin_step_6 from "../../_assets/components/application/sections/next_of_kin_step_6";
import Personal_information_step_1 from "../../_assets/components/application/sections/personal_information_step_1";
import Personal_statement_step_4 from "../../_assets/components/application/sections/personal_statement_step_4";
import References_step_8 from "../../_assets/components/application/sections/references_step_8";
import Supporting_background_step_10 from "../../_assets/components/application/sections/supporting_background_step_10";
import { SubSidebarMenu } from "../../_assets/components/application/sub_side_bar_menu";
import { UploadState } from "./_assets/interface/application/fileUploadState";
import { getStepDefaultValues } from "./_assets/utils/get_step_default_value";

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
  "supportingDocument",
];

export default function MultiStepForm({ params }: { params: { id: string } }) {
  const ApplicationId = params.id;
  const [currentStep, setCurrentStep] = useState(0);
  const queryClient = useQueryClient();
  const route = useRouter();
  const [files, setFiles] = useState<FileItem[]>([]);

  // const [completeStepList, setCompleteStepList] = useState<Array<string>>([]);
  const [completeStepList, setCompleteStepList] = useState<string[]>(
    () => getCompleteStepList(ApplicationId) || []
  );
  // console.log("completeStepList", completeStepList);

  const { data, isLoading } = useFetchData({
    queryKey: "getNewApplication",
    path: `application-management/${ApplicationId}`,
    method: "GET",
  });

  // update single application by id (use mutation)
  const updateApplicationMutation = useApiMutation({
    safe: false,
    path: `application-management/${ApplicationId}`,
    method: "PATCH",
    onSuccess: () => {
      showToast("success", data);
      saveOrUpdateDataById(ApplicationId, completeStepList);
      queryClient.invalidateQueries({ queryKey: ["getNewApplication"] });

      // Move to next step here after success
      if (currentStep < steps.length - 1) {
        setCurrentStep((prev) => prev + 1);
      }
      // Ensure the step is only added when form is valid
      if (!completeStepList.includes(`${currentStep + 1}`)) {
        setCompleteStepList((prev) => [...prev, `${currentStep + 1}`]);
      }
    },
    onError: (error) => {
      showToast("error", error);
    },
  });

  // Infer the form values type from the schema
  type FormValues = z.infer<typeof applicationSchema.create>;
  // Validation Schema
  type FieldName = keyof z.infer<typeof applicationSchema.create>;

  const form = useForm<FormValues>({
    resolver: zodResolver(applicationSchema.create),
    defaultValues: {
      [steps[currentStep]]: getStepDefaultValues(steps[currentStep]),
      // [steps[currentStep]]: {
      //   ...default_values[steps[currentStep] as keyof typeof default_values],
      // },
    },
    mode: "onChange",
  });
  const awardingBodyId =
    data?.data?.application?.courseSelection?.awardingBodyId;
  const sessionId = form.getValues("courseSelection.sessionId");

  const { data: awardingBodiesData, isLoading: isLoadingAwardingBodies } =
    useFetchData({
      path: `application-management/awarding-bodies/${awardingBodyId}`,
      queryKey: "fetch-awarding-bodies-data",
      method: "GET",
    });

  const requiredDocs =
    awardingBodiesData?.data?.awardingBody?.requiredDocuments || [];
  // console.log("default value ", {
  //   ...default_values[steps[currentStep] as keyof typeof default_values],
  // });
  // console.log("steps[currentStep", steps[currentStep]);
  // console.log(" data?.data?.application?.application", data?.data?.application);

  // Now you can access the form object
  useEffect(() => {
    // Check if the default data exists
    let currentData = data?.data?.application?.[steps[currentStep]];

    // Filter only steps that exist in `applicationData`
    const completedSteps = steps.filter(
      (step) => data?.data?.application?.[step]
    );

    // Create serialized numbers according to their position in the original steps array
    const serializedSteps = completedSteps.map((step) => {
      const stepIndex = steps.indexOf(step); // Get index in original array
      return (stepIndex + 1).toString(); // Convert to 1-based index
    });
    setCompleteStepList(serializedSteps);

    // console.log("completedSteps", completedSteps, "currentData", currentData);

    //TODO:  --- start (courseId)
    if (currentData?.courseId && currentStep == 0) {
      const { courseId, ...rest } = currentData;
      currentData = { ...rest, course: courseId };
    }
    // TODO ---- end
    if (currentData !== null && currentData !== undefined) {
      // const fieldsToRemove = ["id", "createdAt", "updatedAt", "applicationId"];

      // const fieldsToRemove = ["id"];
      // fieldsToRemove.forEach((field) => delete currentData?.[field]);

      // Check if the current step contains `dateOfBirth`, then convert it to a date
      // if (currentData.dateOfBirth) {
      //   currentData.dateOfBirth = new Date(currentData.dateOfBirth);
      // }

      // form.reset({
      //   [steps[currentStep]]: currentData,
      // });

      form.reset({
        [steps[currentStep]]: getStepDefaultValues(
          steps[currentStep],
          currentData
        ),
      });
    }
  }, [data, currentStep, form]);

  // FIX 5: Add useEffect to clean up files when component unmounts or step changes

  // document file data formate
  function transformFilesToSupportingDocument(files: any): {
    supportingDocument: any;
  } {
    const result: { supportingDocument: any } = {
      supportingDocument: {},
    };

    files.forEach((file: any) => {
      const field = file.fieldName;
      if (!result.supportingDocument[field]) {
        result.supportingDocument[field] = [];
      }
      (result.supportingDocument[field] as string[]).push(file.path);
    });

    return result;
  }

  // FIX 2: Update handleBack to also clear unsaved uploads
  const handleBack = () => {
    queryClient.invalidateQueries({ queryKey: ["getNewApplication"] });

    if (currentStep === 9 && currentStep - 1 !== 9) {
      // Clear unsaved uploads when navigating back from step 9
      setFiles((prevFiles: FileItem[]) =>
        prevFiles.filter(
          (file: FileItem) => file.path && file.status === "complete"
        )
      );
    }

    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Handle form submission with data logging
  const onSubmit = (data: FormValues) => {};

  const handelNextSubSideMenu = async (Step: number) => {
    queryClient.invalidateQueries({ queryKey: ["getNewApplication"] });

    // FIX: Clear unsaved file uploads when navigating away from step 9
    if (currentStep === 9 && Step !== 9) {
      // Only keep files that have a path (saved files)
      setFiles((prevFiles: FileItem[]) =>
        prevFiles.filter(
          (file: FileItem) => file.path && file.status === "complete"
        )
      );
    }

    setCurrentStep(Step);
  };

  const [uploads, setUploads] = useState<UploadState>({
    cv: { files: [], previews: [] },
    englishCertificates: { files: [], previews: [] },
    essay: { files: [], previews: [] },
    passportId: { files: [], previews: [] },
    proofOfNameChange: { files: [], previews: [] },
    nationalIdentification: { files: [], previews: [] },
    policeClearance: { files: [], previews: [] },
    transcripts: { files: [], previews: [] },
    references: { files: [], previews: [] },
    qualification: { files: [], previews: [] },
    otherDocument: { files: [], previews: [] },
  });

  // final submit
  // const handelSubmit = () = {
  //         const value = { [steps[10]]: removeEmptyValues(updateValue) };
  // }

  function cleanStepData(stepData: any) {
    if (!stepData) return {};

    // Fields to remove from each step
    const fieldsToRemove = [
      "id",
      "createdAt",
      "updatedAt",
      "applicationId",
      // "supportingDocument",
      // "disabilityAndAccessibility",
    ];
    const cleaned = { ...stepData };

    fieldsToRemove.forEach((field) => delete cleaned[field]);

    // Special handling for dateOfBirth if it exists
    if (cleaned.dateOfBirth) {
      cleaned.dateOfBirth = new Date(cleaned.dateOfBirth).toISOString();
    }

    return cleaned;
  }

  function transformApplicationData(fullData: any) {
    const result: Record<string, any> = {};

    steps.forEach((step) => {
      if (fullData[step]) {
        result[step] = cleanStepData(fullData[step]);
      }
    });

    return result;
  }
  // Update the handleSubmitApplication function in your page component

  // FIX 4: Enhanced handleSubmitApplication with better error handling
  const handleSubmitApplication = async () => {
    try {
      const allData = transformApplicationData(data?.data?.application);

      // Delete verifiedEmail
      delete allData?.personalInformation?.verifiedEmail;

      // FIX: Don't delete supportingDocument from allData yet
      // We need it for validation
      const hasSavedDocuments =
        allData?.supportingDocument?.supportingDocumentAttachments?.length > 0;

      // Check if the current step contains `dateOfBirth`, then convert it to a date
      if (allData.personalInformation?.dateOfBirth) {
        allData.personalInformation.dateOfBirth = new Date(
          allData.personalInformation?.dateOfBirth
        );
      }

      // TODO: --- start (courseId)
      if (allData?.courseSelection?.courseId) {
        allData.courseSelection.course = allData.courseSelection.courseId;
        delete allData.courseSelection.courseId;
      }
      // TODO: --- end

      // FIX: Only validate form state if documents haven't been saved yet
      if (!hasSavedDocuments) {
        // Validate supporting documents with all errors shown
        const documentValidation = (form as any).validateSupportingDocuments?.(
          true
        );

        if (documentValidation && !documentValidation.success) {
          // Navigate to supporting documents step (step 9)
          handelNextSubSideMenu(9);

          // Show specific error message
          const errors = documentValidation.errors || {};
          const firstErrorField = Object.keys(errors)[0];
          const firstError = errors[firstErrorField];
          toast.error(firstError || "Please upload all required documents");
          return;
        }
      }

      // FIX: Now delete supportingDocument before validation as it's handled separately
      delete allData.supportingDocument;

      // Validate all other steps
      const isValid = applicationSchema.finalFormSchema.safeParse(allData);

      if (!isValid.success) {
        const message = isValid?.error?.issues?.[0]?.path[0];
        const stepNumber = steps.findIndex((step) => step === message);

        if (stepNumber !== -1) {
          handelNextSubSideMenu(stepNumber);
        }

        const fieldName =
          typeof message === "string"
            ? message.replace(/([A-Z])/g, " $1").toLowerCase()
            : "form";
        toast.error(`Please complete the ${fieldName} step correctly`);
        return;
      }

      // FIX: Only add current files if documents weren't already saved
      if (!hasSavedDocuments && files.length > 0) {
        const updateValue = transformFilesToSupportingDocument(files);
        allData.supportingDocument = updateValue.supportingDocument;
      }
      // If documents were already saved, they're already in the database
      // and don't need to be resubmitted

      // Submit if everything is valid
      if (isValid.success) {
        allData.status = "PENDING";
        await updateApplicationMutation.mutateAsync(allData);
        route.push("/agent/application-management");
      }
    } catch (error) {
      toast.error("Failed to submit application");
      console.error("Submission error:", error);
    }
  };

  // Also update the handleNext function to validate supporting documents on step 9
  // FIX 3: Enhanced handleNext with proper validation
  const handleNext = async () => {
    const isValid = await form.trigger([steps[currentStep]] as FieldName[]);

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

      // Special handling for supporting documents step (step 9)
      if (currentStep === 9) {
        // Validate supporting documents before saving
        const documentValidation = (form as any).validateSupportingDocuments?.(
          true
        );

        if (documentValidation && !documentValidation.success) {
          const firstError = Object.values(documentValidation.errors || {})[0];
          toast.error(
            (firstError as string) || "Please upload all required documents"
          );
          return;
        }

        const updateValue = transformFilesToSupportingDocument(files);
        await updateApplicationMutation.mutateAsync(updateValue);
      } else {
        await updateApplicationMutation.mutateAsync(value);
      }
    }
  };

  useEffect(() => {
    // Cleanup function to ensure unsaved files are removed when navigating away
    return () => {
      if (currentStep !== 9) {
        setFiles((prevFiles: FileItem[]) =>
          prevFiles.filter(
            (file: FileItem) => file.path && file.status === "complete"
          )
        );
      }
    };
  }, [currentStep]);

  return (
    <>
      {/* ApplicationSubsideMenuBar */}

      <div className="flex overflow-hidden w-full h-full">
        {/* sub-sidebar  */}
        <div className="flex-none border-r-2 w-[307px] border-[#EAEDF0]">
          <SubSidebarMenu
            completeStepList={completeStepList}
            step={currentStep + 1}
            handelNextSubSideMenu={handelNextSubSideMenu}
          />
        </div>
        <div className="flex-1">
          {/* <div className="sticky top-0 z-10 bg-white">
            <AgentManagementHeader />
            <hr />
          </div> */}
          {/* sub header */}
          <div className="overflow-hidden z-10 bg-[#F8F8F8]">
            {/* Breadcrumb */}

            <PageWithBreadcrumb
              items={[
                { title: "Home", href: "/agent/application-management" },
                {
                  title: "Application-Management",
                  href: "/agent/application-management",
                },
                { title: "Create" },
              ]}
            >
              <div className="justify-between items-center py-6 px-4 lg:flex">
                <div className="flex gap-x-3 items-center">
                  <h1 className="cusPrimaryTitle">New Applicants Onboarding</h1>
                  <button className="flex gap-x-1 items-center px-3 rounded-full border text-[#15803D] py-[6px] border-1 border-[#27AE60] bg-[#E7FFF5]">
                    <GoDotFill size={14} />
                    <span>Running</span>
                  </button>
                  <ApplicationManagementRadialProgress
                    percentage={currentStep + 1}
                    total={10}
                  />
                </div>
                <div className="flex gap-x-3 capitalize">
                  <Button
                    onClick={handleBack}
                    disabled={currentStep == 0}
                    className="flex justify-center items-center py-2 px-3 text-black bg-white rounded-md border hover:bg-gray-50 cusPrimaryButton border-[#E3E5E5]"
                    type="button"
                  >
                    <ChevronLeft />
                    <span>Previous</span>
                  </Button>
                  {currentStep == 9 ? (
                    <Button
                      className="flex justify-center items-center py-2 px-3 text-black bg-white rounded-md border hover:bg-gray-50 min-w-[100px] cusPrimaryButton border-[#E3E5E5]"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNext();
                        //success tost
                        // console.log("uploads", uploads);
                        // toast.success("Successfully created Application!");
                      }}
                      type="submit"
                    >
                      Save
                      {updateApplicationMutation.isPending && <Loader2Icon />}
                    </Button>
                  ) : (
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        handleNext();
                      }}
                      // onClick={handleNext}
                      disabled={
                        currentStep == 9 || updateApplicationMutation.isPending
                      }
                      className="flex justify-center items-center py-2 px-3 text-black bg-white rounded-md border hover:bg-gray-50 cusPrimaryButton border-[#E3E5E5]"
                      type="submit"
                    >
                      Save & Continue
                      {updateApplicationMutation.isPending ? (
                        <Loader2Icon />
                      ) : (
                        <ChevronRight />
                      )}
                    </Button>
                  )}
                </div>
              </div>
              <hr />
            </PageWithBreadcrumb>
          </div>
          {/* application form  */}
          <div className="w-full">
            <div className="z-0 shadow-lg">
              {isLoading ? (
                <div className="min-h-[300px] lg:min-h-[450px]">
                  <DataLoader />
                </div>
              ) : (
                <ScrollArea className="w-full h-[calc(100vh-280px)] lg:h-[calc(100vh-240px)]">
                  <FormProvider {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="p-6 w-full"
                    >
                      {steps[currentStep] === "courseSelection" && (
                        <Course_selection_step_3 form={form} />
                      )}
                      {steps[currentStep] === "personalInformation" && (
                        <Personal_information_step_1
                          emailVerifyStatus={
                            data?.data?.application?.personalInformation
                              ?.verifiedEmail
                          }
                          form={form}
                        />
                      )}
                      {steps[currentStep] === "academicBackground" && (
                        <Academic_background_step_2 form={form} />
                      )}
                      {steps[currentStep] === "personalStatement" && (
                        <Personal_statement_step_4 form={form} />
                      )}
                      {steps[currentStep] === "disabilityAndAccessibility" && (
                        <Disabilities_and_accessibility_step_5 form={form} />
                      )}
                      {steps[currentStep] === "nextOfKin" && (
                        <Next_of_kin_step_6 form={form} />
                      )}
                      {steps[currentStep] === "fund" && (
                        <Funds_step_7 form={form} />
                      )}
                      {steps[currentStep] === "reference" && (
                        <References_step_8 form={form} />
                      )}
                      {steps[currentStep] === "criminalBackground" && (
                        <Criminal_background_step_9 form={form} />
                      )}
                      {steps[currentStep] === "supportingDocument" && (
                        <Supporting_background_step_10
                          form={form}
                          uploads={uploads}
                          setUploads={setUploads}
                          data={data}
                          files={files}
                          setFiles={setFiles}
                          requiredDocs={requiredDocs}
                          // handleFileDrop={handleFileDrop}
                          // handleFileSelect={handleFileSelect}
                        />
                      )}{" "}
                      {currentStep == 9 && (
                        <div className="mt-8">
                          <div className="w-full">
                            <p className="tracking-wide text-[#7E7D82] text-[12px]">
                              Please review your information carefully before
                              submitting. Once submitted, you won’t be able to
                              make changes to Course Selection. Make sure all
                              details are accurate and complete.
                            </p>
                          </div>
                          <div className="flex justify-end pt-4 w-full">
                            <Button
                              className="py-2"
                              disabled={updateApplicationMutation.isPending}
                              onClick={async (e) => {
                                e.preventDefault();
                                await handleSubmitApplication();
                              }}
                              type="button" // Change to button to prevent form submission
                              // onClick={(e) => {
                              //   e.preventDefault();
                              //    handleNext();
                              // }}
                              // type="submit"
                            >
                              Submit Application
                              {updateApplicationMutation.isPending && (
                                <Loader2 className="ml-2 animate-spin" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </form>
                  </FormProvider>
                </ScrollArea>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
