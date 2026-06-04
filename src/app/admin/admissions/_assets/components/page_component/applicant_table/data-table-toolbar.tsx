/* eslint-disable no-unused-vars */
import { ApplicantProps } from "@/components/common/dialog/assign/applicant_interface";
import { AssignDialog } from "@/components/common/dialog/assign/assign_dialog";
import { CustomField } from "@/components/common/fields/cusInputField";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { IFilterLists } from "./data_type";

interface DataTableToolbarProps {
  applicationInfo: ApplicantProps[];
  dataLength: number;
  search: string;
  setAssignmentFilter: (assigmentFilter: string) => void;
  setSearch: (search: string) => void;
  filterLists: IFilterLists | undefined;
  setFilterLists: (filterLists: IFilterLists | undefined) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (isFilterOpen: boolean) => void;
  setLimit: (limit: string) => void;
  total?: number;
  setCurrentPage: (page: number) => void;
}

export function DataTableToolbar({
  applicationInfo,
  dataLength,
  search,
  setSearch,
  filterLists,
  setFilterLists,
  isFilterOpen,
  setIsFilterOpen,
  setLimit,
  setAssignmentFilter,
  total,
  setCurrentPage,
}: DataTableToolbarProps) {
  // const { control } = useForm();
  const frontendToBackendMap: Record<string, string> = {
    ALL: "ALL",
    UNASSIGNED: "ALL",
    OWN: "OWN",
  };

  const { control } = useForm({
    defaultValues: {
      assignmentFilter: "ALL",
      limit: "10",
    },
  });

  return (
    <div className="flex flex-wrap gap-4 justify-between items-center p-4 bg-white border-b">
      {/* Left Section: Title and Total Count */}
      <div className="flex flex-wrap gap-2 items-center">
        <h1 className="text-lg font-semibold text-black">Applicants</h1>
        <span className="py-1 px-3 text-xs text-blue-600 bg-blue-50 rounded-full">
          {total} Candidates
        </span>
      </div>

      {/* Right Section: Search and Filters */}
      <div className="flex gap-2 lg:gap-4 items-center">
        {/* Reset Filters Button */}
        {filterLists && (
          <Button
            variant="ghost"
            onClick={() => setFilterLists(undefined)}
            className="flex gap-1 items-center text-gray-600 hover:text-black"
          >
            Reset <X className="w-4 h-4" />
          </Button>
        )}

        {/* <div className="relative flex gap-2">
          <Input
            placeholder="Search applicants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-4 pl-10 h-10 rounded-md border focus:ring-2 focus:ring-blue-300 focus:outline-none w-[256px]"
          />
          <Search className="absolute left-3 top-1/2 w-5 h-5 text-gray-500 -translate-y-1/2" />
        </div> */}

        <CustomField.CommonSearch
          searchText={search}
          setSearchText={setSearch}
        />

        <CustomField.LimitField
          totalItems={total}
          setLimit={setLimit}
          setCurrentPage={setCurrentPage}
        />

        <Controller
          control={control}
          name="assignmentFilter"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(e) => {
                field.onChange(e);
                setAssignmentFilter(frontendToBackendMap[e]);
              }}
            >
              <SelectTrigger className="max-w-[100px]">
                <SelectValue placeholder="Select Option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                <SelectItem value="OWN">Assigned to Me</SelectItem>
              </SelectContent>
            </Select>
          )}
        />

        {/* Bulk Assign Button */}
        <AssignDialog applicationInfo={applicationInfo} assignment={false} />

        {/* Filter Button */}
        {/* <Button */}
        {/*   onClick={() => setIsFilterOpen(true)} */}
        {/*   variant="outline" */}
        {/*   size="sm" */}
        {/*   className="ml-auto h-8 font-semibold text-[#555F6D]" */}
        {/* > */}
        {/*   <HiOutlineFilter size={25} color="#555F6D" /> */}
        {/*   Filter */}
        {/* </Button> */}

        {/* Filter Dropdown */}
        {/* <ApplicantTableFilter */}
        {/*   setFilterLists={setFilterLists} */}
        {/*   isFilterOpen={isFilterOpen} */}
        {/*   setIsFilterOpen={setIsFilterOpen} */}
        {/* /> */}
      </div>
    </div>
  );
}
