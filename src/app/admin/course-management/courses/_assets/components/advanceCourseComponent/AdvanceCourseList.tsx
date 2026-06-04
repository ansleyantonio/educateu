/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { StatusWithIcon } from "@/utils/status_point";
import Link from "next/link";
import { ArchiveCourseModal } from "./archived/archive_course";
import DuplicateAdvanceCourseModal from "./duplicate/DuplicateCourseModal";
import { PublishCourseModal } from "./publish/publish_course";
import { UnPublishCourseModal } from "./publish/unpublish_course";
import ViewAdvanceCourse from "./view-update/viewAdvanceCourseModal";
import { ResponsiveButtonGroup } from "@/components/common/button/responsiveButtons";
import DynamicTableWithPagination from "@/components/common/DynamicTable/DynamicTable";

interface AdvanceCourseListProps {
  data: any;
  setCurrentPage: (currentPage: any) => void;
  currentPage: number;
  isLoading: boolean;
  redirectUrlPath?: string;
}

const AdvanceCourseList = ({
  data,
  setCurrentPage,
  currentPage,
  isLoading,
  redirectUrlPath,
}: AdvanceCourseListProps) => {
  return (
    <DynamicTableWithPagination
      isLoading={isLoading}
      data={data?.data?.courses || []}
      pagination={{
        page: currentPage,
        total: data?.pagination?.total || 0,
        totalPages: data?.pagination?.totalPages || 0,
      }}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      config={{
        rowClassName: (course: any) =>
          course?.status === "ARCHIVED" ? "bg-[#cacaca]" : "",

        columns: [
          {
            key: "title",
            header: "Course Title",
            render: (course: any) => (
              <Link
                href={`${redirectUrlPath}/${course?.title}/${course?.id}`}
                className="text-blue-600 capitalize"
              >
                {course.title}
              </Link>
            ),
          },
          {
            key: "awardingBody",
            header: "Awarding Institute",
            render: (course: any) => course?.awardingBody?.name || "-",
          },
          {
            key: "totalCredits",
            header: "Credits",
            render: (course: any) => course?.totalCredits ?? "-",
          },
          {
            key: "status",
            header: "Status",
            render: (course: any) => <StatusWithIcon status={course?.status} />,
          },
          {
            key: "action",
            header: "Action",
            render: (course: any) => (
              <ResponsiveButtonGroup>
                {/* View & Update */}
                <ViewAdvanceCourse course={course} />

                {/* Duplicate */}
                <DuplicateAdvanceCourseModal existingCourse={course} />

                {/* Publish */}
                <PublishCourseModal data={course} />

                {/* Unpublish */}
                <UnPublishCourseModal data={course} />

                {/* Archive */}
                <ArchiveCourseModal data={course} />
              </ResponsiveButtonGroup>
            ),
          },
        ],
      }}
    />
  );
};

export default AdvanceCourseList;
