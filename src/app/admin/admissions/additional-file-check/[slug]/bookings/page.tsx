"use client";

import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { CustomField } from "@/components/common/fields/cusInputField";
import DataLoader from "@/components/common/GlobalLoader/dataLoader";
import NoDataComponent from "@/components/common/GlobalLoader/empty";
import CusPagination from "@/components/common/pagination/paginations";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/custom_ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/custom_ui/table";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { HiOutlineFilter } from "react-icons/hi";

interface IInterview {
  id: string;
  title: string;
  interviewDate: string;
  startTime: string;
  endTime: string;
  platform: string;
  guests: string[];
  color: string;
  application: {
    id: string;
    personalInformation: {
      firstName: string;
      lastName: string;
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
  createdAt: string;
}

const BookingsPage = () => {
  // const auth = useAuths();
  // const token = auth?.user?.token;
  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);
  const [search, setSearch] = useState("");

  // const handleAddBooking = () => {
  //   // Get current path and replace 'bookings' with 'calendar'
  //   const newPath = window.location.pathname.replace("bookings", "calendar");
  //   router.push(newPath);
  // };

  const { data, isLoading } = useFetchData({
    queryKey: "interviews",
    path: `interview`,
    method: "GET",
    filterData: {
      page: currentPage,
      search: search,
      // pageSize: limit,
    },
  });

  // const { data, isLoading, isError } = useQuery<{
  //   data: { formattedInterviews: IInterview[] };
  // }>({
  //   queryKey: ["interviews", { page: currentPage, searchText: search, token }],
  //   queryFn: fetchInterviews,
  // });

  const interviews = data?.data?.formattedInterviews || [];

  return (
    <>
      <Card>
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center p-4 border-b gap-2">
          <h2 className="text-lg font-semibold">Booking</h2>
          <div className="flex justify-start lg:items-center lg:justify-center space-x-2">
            <CustomField.CommonSearch
              searchText={search}
              setSearchText={setSearch}
            />
            <Button
              // onClick={() => setIsFilterOpen(true)}
              variant="outline"
              size="sm"
              className="ml-auto flex justify-center items-center gap-2 h-10 text-sm font-semibold text-[#555F6D]"
            >
              <HiOutlineFilter size={28} color="#555F6D" />
              Filter
            </Button>
          </div>
        </div>

        <Table>
          <TableCaption className="p-4">
            <CusPagination
              currentPage={currentPage}
              totalPages={1} // Replace with actual value from API
              setCurrentPage={setCurrentPage}
            />
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Interview Date</TableHead>
              <TableHead className="text-center">Interview Time</TableHead>
              <TableHead className="text-center">Applicant Name</TableHead>
              <TableHead className="text-center">Application ID</TableHead>
              <TableHead className="text-center">Booked By</TableHead>
              <TableHead className="text-center">Interviewer Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <div className="min-h-[250px]">
                <DataLoader />
              </div>
            ) : interviews?.length == 0 ? (
              <div className="min-h-[250px]">
                <NoDataComponent />
              </div>
            ) : (
              interviews.map((interview: IInterview) => (
                <TableRow key={interview.id}>
                  <TableCell className="text-center">
                    {new Date(interview.interviewDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-center">
                    {new Date(interview.startTime).toLocaleTimeString()} -{" "}
                    {new Date(interview.endTime).toLocaleTimeString()}
                  </TableCell>
                  <TableCell className="text-center">
                    {interview.application.personalInformation.firstName}{" "}
                    {interview.application.personalInformation.lastName}
                  </TableCell>
                  <TableCell className="text-center">
                    {interview.application.id}
                  </TableCell>
                  <TableCell className="text-center">
                    {interview.bookedBy.userPortalCategory.user.firstName}{" "}
                    {interview.bookedBy.userPortalCategory.user.lastName}
                  </TableCell>
                  <TableCell className="text-center">
                    {interview.interviewer.userPortalCategory.user.firstName}{" "}
                    {interview.interviewer.userPortalCategory.user.lastName}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
};

export default BookingsPage;
