/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import ApplicantStage from "@/components/common/applicant_stage";
import { CourseDetails } from "./_assets/components/course_details";
import ProfileStatusCard from "./_assets/components/profile_status_card";

const ProfilePage = ({ params }: { params: { id: string } }) => {
  const { data, isLoading } = useFetchData({
    queryKey: "list-of-admission-applications-data",
    path: `application-management/${params.id}`,
    method: "GET",
  });

  return (
    <>
      {/* <title></title> */}
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
        <div className=" mt-4 mr-4 ">
          <ProfileStatusCard application={data?.data?.application} />
          <ApplicantStage stage={data?.data?.application?.stage} />

          <CourseDetails application={data?.data?.application} />
        </div>
      </PageWithBreadcrumb>
    </>
  );
};
export default ProfilePage;
