"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ApplicantTableFilter } from "./application_filter";
import { HiOutlineFilter } from "react-icons/hi";
import { IFilterLists } from "./data_type";
import { useState } from "react";

interface DataTableToolbarProps {
  dataLength: number;
  search: string;
  setSearch: (search: string) => void;
  filterLists: IFilterLists | undefined;
  setFilterLists: (filterLists: IFilterLists | undefined) => void;
}

const filterFields = [
  {
    field: "awardingBody",
    label: "Awarding Body",
    options: [
      { value: "Body A", label: "Body A" },
      { value: "Body B", label: "Body B" },
    ],
  },
  {
    field: "emailVerificationStatus",
    label: "Email Verification Status",
    options: [
      { value: "Verified", label: "Verified" },
      { value: "Not Verified", label: "Not Verified" },
    ],
  },
  {
    field: "interviewBookingStatus",
    label: "Interview Booking Status",
    options: [
      { value: "Booked", label: "Booked" },
      { value: "Not Booked", label: "Not Booked" },
    ],
  },
  {
    field: "interviewOutcome",
    label: "Interview Outcome",
    options: [
      { value: "Passed", label: "Passed" },
      { value: "Failed", label: "Failed" },
    ],
  },
];

export function DataTableToolbar({
  dataLength,
  search,
  setSearch,
  filterLists,
  setFilterLists,
}: DataTableToolbarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleApplyFilter = (filters: Record<string, string>) => {
    setFilterLists(filters);
    console.log(filters);
  };

  const handleResetFilter = () => {
    setFilterLists(undefined);
  };

  return (
    <div className="flex flex-wrap gap-4 justify-between items-center p-4 bg-white border-b">
      {/* Left Section: Title and Total Count */}
      <div className="flex gap-2 items-center">
        <h1 className="text-lg font-semibold text-black">Applicants</h1>
        <span className="py-1 px-3 text-sm text-blue-600 bg-blue-50 rounded-full">
          {dataLength} Candidates
        </span>
      </div>

      {/* Right Section: Search and Filters */}
      <div className="flex gap-4 items-center">
        {/* Reset Filters Button */}
        {filterLists && (
          <Button
            variant="ghost"
            onClick={handleResetFilter}
            className="flex gap-1 items-center text-gray-600 hover:text-black"
          >
            Reset <X className="w-4 h-4" />
          </Button>
        )}

        {/* Search Input */}
        <div className="relative">
          <Input
            placeholder="Search applicants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-4 pl-10 h-10 rounded-md border focus:ring-2 focus:ring-blue-300 focus:outline-none w-[256px]"
          />
          <Search className="absolute left-3 top-1/2 w-5 h-5 text-gray-500 -translate-y-1/2" />
        </div>

        {/* Filter Button */}
        <Button
          onClick={() => setIsFilterOpen(true)}
          variant="outline"
          size="sm"
          className="ml-auto h-8 font-semibold text-[#555F6D]"
        >
          <HiOutlineFilter size={25} color="#555F6D" />
          Filter
        </Button>

        {/* Filter Dropdown */}
        <ApplicantTableFilter
          filterFields={filterFields}
          onApplyFilter={handleApplyFilter}
          onResetFilter={handleResetFilter}
          isFilterOpen={isFilterOpen}
          setIsFilterOpen={setIsFilterOpen}
        />
      </div>
    </div>
  );
}
