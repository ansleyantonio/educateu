/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import ApplicantStage from "@/components/common/applicant_stage";
import { CourseDetails } from "./_assets/components/course_details";
import ProfileStatusCard from "./_assets/components/profile_status_card";

const ProfilePage = ({ params }: { params: { slug: string } }) => {
  const { data, isLoading } = useFetchData({
    queryKey: "single-application-data",
    path: `admission/profile/application/${params.slug}`,
    method: "GET",
    filterData: {
      // assignmentFilter,
    },
  });
  return (
    <PageWithBreadcrumb
      items={[
        {
          title: "Admissions",
        },
        { title: "Applications", href: "/admin/admissions/admission" },
        { title: "Profile" },
      ]}
    >
      <>
        {/* <ScrollArea className="overflow-y-hidden h-[calc(100vh-145px)]"> */}
        <div className="">
          {isLoading ? (
            <>
              <div className="flex justify-center items-center my-8 w-full bg-gray-300 rounded-md animate-pulse h-[220px]"></div>

              <div className="flex justify-center items-center my-8 w-full bg-gray-300 rounded-md animate-pulse h-[160px]"></div>
            </>
          ) : (
            <div className="">
              <ProfileStatusCard application={data?.data?.application} />

              <ApplicantStage stage={data?.data?.application?.stage} />
              <CourseDetails application={data?.data?.application} />
            </div>
          )}
        </div>
        {/* </ScrollArea> */}
      </>
    </PageWithBreadcrumb>
  );
};
export default ProfilePage;
