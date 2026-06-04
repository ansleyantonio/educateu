/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import DataLoader from "@/components/common/GlobalLoader/dataLoader";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/custom_ui/button";
import { getUserAccess } from "@/utils/permissions/permissions";
import { StatusWithIcon } from "@/utils/status_point";
import { useMatchedModule } from "@/utils/useMatchedModule/useMatchedModule";
import { useQueryClient } from "@tanstack/react-query";
import { Info, Loader2 } from "lucide-react";
import OutCome from "./_assets/component/dialog/out_come";
import FileCheckComponent from "./_assets/component/fileCheckComponent";

const SubmissionPage = ({ params }: { params: { slug: string } }) => {
  const matchedModule = useMatchedModule();
  const permissions = matchedModule?.modulePermission ?? [];

  const hasPostAndDeletePermission =
    getUserAccess(permissions) === "full-access";

  const queryClient = useQueryClient();

  const { data, isLoading } = useFetchData({
    method: "GET",
    path: `admission/profile/application/${params.slug}`,
    queryKey: "single-application-data",
  });

  const application = data?.data?.application;

  const Submit = {
    id: params.slug,
  };

  const mutation = useApiMutation({
    method: "POST",
    path: `admission/submissions/submit/${params.slug}`,
    onSuccess: (data) => {
      showToast("success", data);
      queryClient.invalidateQueries({ queryKey: ["single-application-data"] });
    },
    onError: (error) => {
      showToast("error", error);
    },
  });

  const interviewCheck = application?.interviewOutcome === "PASS";

  const isApproved = application?.stage === "OUTCOME";

  const wellbeingCheck =
    application?.wellbeingCheckStatus === "APPROVED"
      ? true
      : application?.wellbeingCheckStatus === "REJECTED"
      ? false
      : application?.disabilityAndAccessibility?.disabilityAndAccessibility?.[0]?.toLowerCase() !==
          "no known disability" ||
        (application?.criminalBackground?.policeClearance === "YES" &&
          application?.criminalBackground?.offenseOrPenalty === "NO" &&
          application?.criminalBackground?.disqualificationOrSanction === "NO");

  console.log(application, "application");
  // console.log(
  //   wellbeingCheck,
  //   "wellbeingCheck",
  //   application?.disabilityAndAccessibility?.disabilityAndAccessibility?.[0]?.toLowerCase() !==
  //     "no known disability" ||
  //     (application?.criminalBackground?.policeClearance === "YES" &&
  //       application?.criminalBackground?.offenseOrPenalty === "NO" &&
  //       application?.criminalBackground?.disqualificationOrSanction === "NO"),
  // );

  const generalCheck = application?.generalFileCheckStatus === "APPROVED";
  const additionalCheck = application?.additionalFileCheckStatus === "APPROVED";
  const allChecked =
    interviewCheck && wellbeingCheck && generalCheck && additionalCheck;

  const onSubmit = (submit: any) => {
    if (!allChecked) {
      // collect unapproved items
      const unapproved: string[] = [];
      if (!interviewCheck) unapproved.push("Interview");
      if (!wellbeingCheck) unapproved.push("Wellbeing");
      if (!generalCheck) unapproved.push("General File");
      if (!additionalCheck) unapproved.push("Additional File");

      showToast(
        "error",
        `Please check all conditions before submitting. Missing: ${unapproved.join(
          ", "
        )}`
      );
      return;
    }

    mutation.mutate(submit);
  };

  const updateApplicationMutation = useApiMutation({
    safe: false,
    path: `admission/resend-outcome/${params.slug}`,
    method: "POST",
    onSuccess: (data) => {
      showToast("success", data);
      // setIsDialogOpen(false);
      // saveOrUpdateDataById(ApplicationId, completeStepList);
      // queryClient.invalidateQueries({
      //   queryKey: ["list-of-admission-applications-data"],
      // });
    },
  });

  return (
    <PageWithBreadcrumb
      items={[
        {
          title: "Admissions",
        },
        { title: "Applications", href: "/admin/admissions/admission" },
        { title: "Submissions" },
      ]}
    >
      <Card>
        <div>
          {/* Header */}
          <div className="flex flex-col p-4 lg:flex-row lg:justify-between lg:items-center">
            <h1 className="text-xl font-bold">Submissions</h1>

            {data?.data?.application?.outcome != "APPROVED" && (
              <div className="flex flex-wrap gap-2 items-center">
                <Info color="#4A545E" size={20} />
                <p>Submit if all Conditions Met:</p>
                {data?.data?.application?.stage == "SUBMIT" && (
                  <OutCome id={params?.slug} />
                )}
                {/* <OutCome /> */}

                {data?.data?.application?.stage !== "SUBMIT" &&
                  data?.data?.application?.stage !== "REJECT" && (
                    <>
                      <Button
                        onClick={() =>
                          updateApplicationMutation.mutate({
                            outcome: application?.outcome,
                          })
                        }
                        size="sm"
                        variant="primary"
                        disabled={!isApproved}
                      >
                        Resend Mail
                        {/*  loading show */}
                        {updateApplicationMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                      </Button>

                      <Button
                        onClick={() => onSubmit(Submit)}
                        size="sm"
                        variant="primary"
                        disabled={!hasPostAndDeletePermission || isApproved}
                      >
                        Submit
                      </Button>
                    </>
                  )}
              </div>
            )}
          </div>
          <hr />

          <div className="p-4">
            <h1 className="text-lg">Acceptance Criteria *</h1>
            <h3>Applicants address is valid and not duplicated</h3>
            {isLoading ? (
              <div className="flex mt-9">
                <DataLoader />
              </div>
            ) : (
              <div className="flex flex-col gap-5 mt-9">
                {/* Interview */}
                <div className="flex gap-3 items-center">
                  <p>Interview:</p>
                  <StatusWithIcon
                    status={application?.interviewOutcome ?? "N/A"}
                  />
                </div>

                <div className="flex gap-3 items-center">
                  <p>Wellbeing:</p>
                  <StatusWithIcon
                    status={
                      wellbeingCheck &&
                      application?.wellbeingCheckStatus !== "PENDING"
                        ? "Passed"
                        : application?.wellbeingCheckStatus === "PENDING"
                        ? "N/A"
                        : "Failed"
                    }
                    // : (application?.wellbeingCheckStatus ?? "N/A")
                  />
                </div>

                {/* File Check */}
                <FileCheckComponent
                  generalCheck={generalCheck}
                  additionalCheck={additionalCheck}
                />
              </div>
            )}
          </div>
        </div>

        <p className="p-3 m-4 rounded-md bg-[#D8F8E7] text-[#1D7C4D]">
          No Pending Document submission Outcome
        </p>
      </Card>
    </PageWithBreadcrumb>
  );
};
export default SubmissionPage;
