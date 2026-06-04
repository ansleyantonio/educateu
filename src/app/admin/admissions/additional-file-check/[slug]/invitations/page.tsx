"use client";
import { Card } from "@/components/ui/card";

import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import { useState } from "react";
import AssessmentInvitations from "./_assets/components/AssessmentInvitations/assessmentInvitations";

const InvitationsPage = ({ params }: { params: { slug: string } }) => {
  const id = params.slug;

  const [assessmentPage, setAssessmentPage] = useState(1);

  const { data, isLoading } = useFetchData({
    queryKey: "list-of-notes-data",
    path: `admission/notes/application`,
    method: "GET",
    filterData: {
      page: assessmentPage,
      applicationId: id,
    },
  });

  return (
    <PageWithBreadcrumb
      items={[
        {
          title: "Admissions",
        },
        { title: "Applications", href: "/admin/admissions/admission" },
        { title: "Invitations" },
      ]}
    >
      <Card>
        {/*       <Tabs defaultValue="interviewer_reminder"> */}
        {/* Header */}
        <div className="flex gap-2 items-center p-4 mb-2 font-semibold">
          <h3>Invitations</h3>
          <p className="flex justify-center items-center px-2 text-xs rounded-full border bg-[#F0F9FF]">
            {data?.pagination?.total}
          </p>
        </div>

        {/* <TabsList> */}
        {/*   <TabButton */}
        {/*     value="interviewer_reminder" */}
        {/*     label="Interviewer Reminder" */}
        {/*     count={interviewData?.pagination?.total} */}
        {/*     isActive={isValue === "interviewer_reminder"} */}
        {/*     onClick={setIsValue} */}
        {/*   /> */}
        {/*   <TabButton */}
        {/*     value="assessment_invitations" */}
        {/*     label="Assessment Invitations" */}
        {/*     count={assessmentData?.pagination?.total} */}
        {/*     isActive={isValue === "assessment_invitations"} */}
        {/*     onClick={setIsValue} */}
        {/*   /> */}
        {/* </TabsList> */}

        <hr />
        <div className="-mt-2">
          {/* content */}
          {/* <TabsContent value="interviewer_reminder"> */}
          {/*   <InvitationTable data={interviewDatas} /> */}
          {/* </TabsContent> */}
          {/* <TabsContent value="assessment_invitations"> */}
          <AssessmentInvitations
            isLoading={isLoading}
            data={data}
            setCurrentPage={setAssessmentPage}
            currentPage={assessmentPage}
          />
          {/*     </TabsContent> */}
        </div>
        {/* </Tabs> */}
      </Card>
    </PageWithBreadcrumb>
  );
};

export default InvitationsPage;
