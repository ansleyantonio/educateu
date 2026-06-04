"use client";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import DataFetcher from "@/hooks/fetchDataCollection/hooksExport";
import CourseTabsPortal from "../../_assets/components/CourseControlCenter/coursePortal";

const SingleCourseDetails = ({ params }: { params: { slug: string[] } }) => {
  const id = params.slug[params.slug.length - 1];

  const { data, isLoading } = DataFetcher.fetchSingleCourse({ courseId: id });

  return (
    <PageWithBreadcrumb
      items={[
        { title: "Home", href: "/admin" },
        // {
        //   title: "Course Management",
        //   href: "/admin/course-management/course/degree-course",
        // },
        {
          title: "Degree",
          href: "/admin/course-management/course/degree-course",
        },

        {
          title: data?.data?.course?.title,
        },
      ]}
    >
      <CourseTabsPortal id={id} data={data} isLoading={isLoading} />
    </PageWithBreadcrumb>
  );
};

export default SingleCourseDetails;
