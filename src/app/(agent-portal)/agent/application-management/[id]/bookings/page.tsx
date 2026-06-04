/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import DynamicTableWithPagination from "@/components/common/DynamicTable/DynamicTable";
import { CustomField } from "@/components/common/fields/cusInputField";
import { Card } from "@/components/ui/card";
import dateFormat from "@/utils/DateFormatter";
import { getUserAccess } from "@/utils/permissions/permissions";
import { StatusWithIcon } from "@/utils/status_point";
import { useMatchedModule } from "@/utils/useMatchedModule/useMatchedModule";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export interface IInterview {
  id: string;
  title: string;
  interviewDate: string;
  startTime: string;
  endTime: string;
  platform: string;
  guests: string[];
  color: string;
  createdAt: string;
  updatedAt: string;
  interviewerId: string;
  bookedById: string;
  applicationId: string;

  application: {
    id: string;
    status: string;
    stage: string;
    wellbeingCheckStatus: string;
    generalFileCheckStatus: string;
    additionalFileCheckStatus: string;
    interviewOutcome: string;
    outcome: string;
    createdAt: string;
    updatedAt: string;

    personalInformation: {
      id: string;
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      email: string;
      countryOfBirth: string;
      currentNationality: string;
      sex: string;
      ethnicity: string;
      mobileNumber: string;
      countryOfResidence: string;
      currentAddress: string;
      currentPostCode: string;
      permanentAddress: string;
      nationalIdentityType: string;
      nationalIdentityNumber: string;
      applicationId: string;
      createdAt: string;
      updatedAt: string;
    };
  };

  bookedBy: {
    userPortalCategory: {
      user: {
        firstName: string;
        lastName: string;
      };
    };
  };

  interviewer: {
    userPortalCategory: {
      user: {
        firstName: string;
        lastName: string;
      };
    };
  };
}

const BookingsPage = ({ params }: { params: { id: string } }) => {
  const applicationId = params.id;
  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);
  const [search, setSearch] = useState("");

  const matchedModule = useMatchedModule();
  const permissions = matchedModule?.modulePermission ?? [];

  const accessLevel = getUserAccess(permissions);
  const hasPostAndDeletePermission = accessLevel === "full-access";

  const { data, isLoading } = useFetchData({
    queryKey: "applicant-interview",
    path: `application-management/${applicationId}/interviews`,
    method: "GET",
    filterData: {
      page: currentPage,
      searchText: search,
    },
  });

  const interviews = data?.data?.interviews || [];

  return (
    <PageWithBreadcrumb
      items={[
        {
          title: "Admissions",
        },
        { title: "Applications", href: "/admin/admissions/admission" },
        { title: "Bookings" },
      ]}
    >
      <>
        {/* Add Booking Button Positioned Outside */}
        {/* <div className="flex justify-end mb-4">
          {hasPostAndDeletePermission ? (
            <Link href="bookings/calendar">
              <Button variant="primary">
                <Plus /> Add Booking
              </Button>
            </Link>
          ) : (
            <Button variant="primary" disabled>
              <Plus /> Add Booking
            </Button>
          )}
        </div> */}

        <Card>
          <div className="flex justify-between py-3 items-center px-4">
            <div className="min-w-[120px]">
              <h2 className="text-lg font-semibold">Booking</h2>
            </div>
            <div className="flex-1 w-full">
              <CustomField.CommonSearch
                width="100%"
                searchText={search}
                setSearchText={setSearch}
              />
            </div>
          </div>

          {/* Table */}
          <DynamicTableWithPagination
            data={interviews}
            isLoading={isLoading}
            pagination={data?.data?.pagination}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            config={{
              columns: [
                {
                  key: "interviewDate",
                  header: "Interview Date",
                  render: (interview: any) =>
                    dateFormat.fullDateTime(interview?.interviewDate, {
                      showTime: false,
                    }),
                },
                {
                  key: "startTime",
                  header: "Interview Time",
                  render: (interview: any) => (
                    <span>
                      {" "}
                      {dateFormat.time12h(interview?.startTime, {
                        local: true,
                      })}{" "}
                      -{" "}
                      {dateFormat.time12h(interview?.endTime, {
                        local: true,
                      })}{" "}
                    </span>
                  ),
                },
                { key: "applicant", header: "Applicant Name" },
                { key: "applicantId", header: "Application ID" },
                {
                  key: "status",
                  header: "Interview Status",
                  render: (interview: any) => (
                    <StatusWithIcon status={interview?.status} />
                  ),
                },
                { key: "interviewer", header: "Interviewer Name" },
              ],
            }}
          />
        </Card>
      </>
    </PageWithBreadcrumb>
  );
};

export default BookingsPage;
