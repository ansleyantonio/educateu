/* eslint-disable no-unused-vars */
import ActionButton from "@/components/common/button/actionButton";
import { CustomField } from "@/components/common/fields/cusInputField";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { HiOutlineFilter } from "react-icons/hi";
import { ApplicantTableFilter, defaultValues } from "./application_filter";
import { IFilterLists } from "./data_type";

interface DataTableToolbarProps {
  dataLength: number;
  search: string;
  setSearch: (search: string) => void;
  // filterLists: IFilterLists | undefined;
  // setFilterLists: (filterLists: IFilterLists | undefined) => void;
  filterLists: Partial<IFilterLists> | undefined;
  setFilterLists: (filterLists: Partial<IFilterLists> | undefined) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (isFilterOpen: boolean) => void;
  setLimit: (limit: string) => void;
  total?: number;
  setCurrentPage: (page: number) => void;
}

export function DataTableToolbar({
  dataLength,
  search,
  setSearch,
  filterLists,
  setFilterLists,
  isFilterOpen,
  setIsFilterOpen,
  setLimit,
  total,
  setCurrentPage,
}: DataTableToolbarProps) {
  const handleResetFilters = () => {
    setSearch("");
    setFilterLists(defaultValues);
  };

  const hasActiveFilters = filterLists
    ? Object.values(filterLists).some(
        (value) => value !== "" && value !== undefined && value !== null
      )
    : false;

  return (
    <div className="flex flex-wrap gap-4 justify-between items-center p-4 bg-white border-b">
      {/* Left Section: Title and Total Count */}
      <div className="flex flex-wrap gap-2 items-center">
        <h1 className="text-lg font-semibold text-black">Total Applicants</h1>
        <span className="py-1 px-3 text-sm text-blue-600 bg-blue-50 rounded-full">
          {dataLength} Candidates
        </span>
      </div>

      {/* Right Section: Search and Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Reset Filters Button */}
        {/* Search Input */}
        <CustomField.CommonSearch
          searchText={search}
          setSearchText={setSearch}
        />{" "}
        {(search.trim() !== "" || hasActiveFilters) && (
          <ActionButton
            handleOpen={handleResetFilters}
            type="button"
            variant="icon"
            tooltipContent="Reset"
            icon={<RefreshCw />}
          />
        )}
        <CustomField.LimitField
          totalItems={total}
          setLimit={setLimit}
          setCurrentPage={setCurrentPage}
        />
        <Button
          onClick={() => setIsFilterOpen(true)}
          variant="outline"
          size="lg"
          className="ml-auto  font-semibold text-[#555F6D]"
        >
          <HiOutlineFilter size={25} color="#555F6D" />
          Filter
        </Button>
        {/* Filter Dropdown */}
        <ApplicantTableFilter
          filterLists={filterLists}
          setFilterLists={setFilterLists}
          isFilterOpen={isFilterOpen}
          setIsFilterOpen={setIsFilterOpen}
        />
      </div>
    </div>
  );
}
