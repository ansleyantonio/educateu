/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import DataLoader from "@/components/common/GlobalLoader/dataLoader";
import NoDataComponent from "@/components/common/GlobalLoader/empty";
import CusPagination from "@/components/common/pagination/paginations";
import { ViewCPDCourse } from "./view_update/viewCPDCourseModal";
import Link from "next/link";
import { DuplicateCPDCourseModal } from "./duplicate/duplicateCPDCourseModal";
import { ArchiveCourseModal } from "./archived/archive_course";
import { PublishCourseModal } from "./publish_unPublish/publish_course";
import { UnPublishCourseModal } from "./publish_unPublish/unpublish_course";
import { ResponsiveButtonGroup } from "@/components/common/button/responsiveButtons";

interface PaginationProps {
  count: number;
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

interface ModuleProps {
  currentPage: number;
  setCurrentPage: (data: number) => void;
  data: any;
  isLoading: boolean;
  pagination: PaginationProps;
}

const CPDCourseList = ({
  data,
  isLoading,
  pagination,
  currentPage,
  setCurrentPage,
}: ModuleProps) => {
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Course Title</TableHead>
            <TableHead>Accreditation</TableHead>
            <TableHead>Course Duration</TableHead>
            <TableHead className="pr-4 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="relative">
          {isLoading ? (
            <div className="min-h-[250px]">
              <DataLoader />
            </div>
          ) : data?.length === 0 ? (
            <div className="min-h-[250px]">
              <NoDataComponent />
            </div>
          ) : (
            data?.map((course: any) => (
              <TableRow
                key={course.id}
                className={`${course?.status == "ARCHIVED" && "bg-[#cacaca]"}`}
              >
                <TableCell className="pl-4 capitalize">
                  <Link
                    className="text-blue-600"
                    href={`cpd-course/${course?.title}/${course?.id}`}
                  >
                    {course.title}
                  </Link>
                </TableCell>
                <TableCell className="capitalize">
                  {course.professionalAccreditation}
                </TableCell>

                <TableCell>{course?.durationLength} Min</TableCell>
                <TableCell className="">
                  <ResponsiveButtonGroup>
                    {/* View & Update */}
                    <ViewCPDCourse data={course} />

                    {/*  Download Certificate */}
                    {/* <Button variant="icon"> */}
                    {/*   <Image */}
                    {/*     src={fileDownload} */}
                    {/*     alt="eye" */}
                    {/*     width={17} */}
                    {/*     height={17} */}
                    {/*   /> */}
                    {/* </Button> */}

                    {/*  Duplicate Course */}
                    <DuplicateCPDCourseModal existingCourse={course} />

                    {/* Publish */}
                    <PublishCourseModal data={course} />

                    {/* Unpublish */}
                    <UnPublishCourseModal data={course} />

                    {/* Archive */}
                    <ArchiveCourseModal data={course} />

                    {/* Delete */}
                    {/* <DeleteCourseModal data={course} /> */}
                  </ResponsiveButtonGroup>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>

        {isLoading === false && data?.length > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                <CusPagination
                  totalPages={pagination?.totalPages || 1}
                  setCurrentPage={setCurrentPage}
                  currentPage={currentPage}
                />
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </>
  );
};

export default CPDCourseList;
