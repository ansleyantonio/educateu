"use client";
import DataLoader from "@/components/common/GlobalLoader/dataLoader";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import CourseTabsPortal from "../../_assets/components/CourseControlCenter/coursePortal";
import DataFetcher from "@/hooks/fetchDataCollection/hooksExport";

const CourseDetailsPage = ({
  params,
}: {
  params: {
    slug: string;
  };
}) => {
  const id = params.slug[params.slug.length - 1];

  const { data, isLoading } = DataFetcher.fetchSingleCourse({ courseId: id });

  if (isLoading) {
    return (
      <div>
        <DataLoader />
      </div>
    );
  }

  return (
    <PageWithBreadcrumb
      items={[
        { title: "Home", href: "/admin/course-management/" },
        {
          title: "Professional-Certificate-Course",
          href: "/admin/course-management/course/professional-certificate-course",
        },
        {
          title: `${data?.data?.course?.title}`,
        },
      ]}
    >
      <CourseTabsPortal isLoading={isLoading} data={data} id={id} />
    </PageWithBreadcrumb>
  );
};

export default CourseDetailsPage;
