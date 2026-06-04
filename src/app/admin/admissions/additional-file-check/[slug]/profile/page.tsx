/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import ApplicantStage from "@/components/common/applicant_stage";
import { CourseDetails } from "./_assets/components/course-details";
import ProfileStatusCard from "./_assets/components/profile_status_card";

const ProfilePage = ({ params }: { params: { slug: string } }) => {
  // console.log("params profile", params.slug);

  const { data, isLoading } = useFetchData({
    queryKey: "single-application-data",
    path: `admission/profile/application/${params.slug}`,
    method: "GET",
    filterData: {
      // applicationId: id,
    },
  });

  // const { data, isLoading } = useQuery({
  //   queryKey: ["single-application-data", { token, id: params.slug }],
  //   queryFn: fetchSingleApplications,
  // });
  // console.log("data", data);

  return (
    <div className="overscroll-y-auto mt-4 min-h-screen">
      {isLoading ? (
        <>
          <div className="flex justify-center items-center my-8 w-full bg-gray-300 rounded-md animate-pulse h-[220px]"></div>

          <div className="flex justify-center items-center my-8 w-full bg-gray-300 rounded-md animate-pulse h-[160px]"></div>
        </>
      ) : (
        <>
          <ProfileStatusCard application={data?.data?.application} />
          <ApplicantStage stage={data?.data?.application?.stage} />
        </>
      )}
      <CourseDetails application={data?.data?.application} />
    </div>
  );
};
export default ProfilePage;
