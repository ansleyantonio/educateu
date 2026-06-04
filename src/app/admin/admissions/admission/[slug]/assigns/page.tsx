"use client";

import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import { ApplicantProps } from "@/components/common/dialog/assign/applicant_interface";
import DataLoader from "@/components/common/GlobalLoader/dataLoader";
import AdmissionOfficersCard from "./_assets/components/admission_officers_card";

interface LayoutProps {
  params: { slug: string };
}

const AssignsPage = ({ params }: LayoutProps) => {
  const { slug } = params;

  const { data, isLoading } = useFetchData({
    queryKey: "single-application-data",
    path: `admission/profile/application/${slug}`,
    method: "GET",
    filterData: {},
  });

  // const isWellbeing = data?.data?.application?.wellbeingCheckStatus === "PENDING";

  const applicationInfo: ApplicantProps[] = [
    {
      id: data?.data?.application?.id,
      outcome: data?.data?.application?.outcome,
      name: `${data?.data?.application?.personalInformation?.firstName} ${data?.data?.application?.personalInformation?.lastName}`,
      wellbeingStatus: data?.data?.application?.wellbeingCheckStatus,
    },
  ];

  return (
    <PageWithBreadcrumb
      items={[
        {
          title: "Admissions",
        },
        { title: "Applications", href: "/admin/admissions/admission" },
        { title: "Assigns" },
      ]}
    >
      <div>
        {isLoading ? (
          <div className="h-[220px] lg:h-[350px]">
            <DataLoader />
          </div>
        ) : (
          <AdmissionOfficersCard
            id={slug}
            applicationInfo={applicationInfo}
            //  isWellbeing={isWellbeing}
          />
        )}
      </div>
    </PageWithBreadcrumb>
  );
};

export default AssignsPage;
