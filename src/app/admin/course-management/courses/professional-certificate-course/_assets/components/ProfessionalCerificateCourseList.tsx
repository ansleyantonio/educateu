/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import DataLoader from "@/components/common/GlobalLoader/dataLoader";
import NoDataComponent from "@/components/common/GlobalLoader/empty";
import CusPagination from "@/components/common/pagination/paginations";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { DuplicateProfessionalCourseModal } from "./duplicate/duplicateProfessionalCourseModal";
import { ViewProfessionalCourse } from "./view-update/viewProfessionalCourseModal";
//import { DeleteCourseModal } from "./delete/delete_course";
import { ArchiveCourseModal } from "./archived/archive_course";
import { PublishCourseModal } from "./publish-unPublish/publish_course";
import { UnPublishCourseModal } from "./publish-unPublish/unpublish_course";
import { ResponsiveButtonGroup } from "@/components/common/button/responsiveButtons";

interface ProfessionalCertificateCourseListProps {
  data: any;
  setCurrentPage: (currentPage: any) => void;
  currentPage: number;
  isLoading: boolean;
}

const ProfessionalCertificateCourseList = ({
  data,
  setCurrentPage,
  currentPage,
  isLoading,
}: ProfessionalCertificateCourseListProps) => {
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Course Title</TableHead>
            <TableHead>Accreditation</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead className="pr-4 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <div className="min-h-[250px]">
              <DataLoader />
            </div>
          ) : data?.pagination?.total === 0 ? (
            <div className="min-h-[250px]">
              <NoDataComponent />
            </div>
          ) : (
            data?.data?.courses?.map((course: any) => (
              <TableRow
                key={course?.id}
                className={`${course?.status == "ARCHIVED" && "bg-[#cacaca]"}`}
              >
                <TableCell className="pl-4 capitalize" title={course?.title}>
                  {/* <p className="overflow-hidden whitespace-nowrap truncate text-ellipsis max-w-[100px] lg:max-w-[250px] xl:max-w-[350px]"> */}

                  <Link
                    className="text-blue-600"
                    href={`professional-certificate-course/${course?.title}/${course?.id}`}
                  >
                    {course?.title}
                  </Link>
                </TableCell>
                <TableCell title={course?.professionalAccreditation ?? "_"}>
                  <p className="overflow-hidden whitespace-nowrap truncate text-ellipsis max-w-[100px] lg:max-w-[250px] xl:max-w-[350px]">
                    {course?.professionalAccreditation ?? "_"}
                  </p>
                </TableCell>
                <TableCell>{course?.durationLength} Min</TableCell>
                <TableCell className="pr-4">
                  <ResponsiveButtonGroup>
                    {/* View & Update */}
                    <ViewProfessionalCourse course={course} />
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
                    <DuplicateProfessionalCourseModal existingModule={course} />

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
        {data?.pagination?.totalPages > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                <CusPagination
                  totalPages={data?.pagination?.totalPages || 1}
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

export default ProfessionalCertificateCourseList;
