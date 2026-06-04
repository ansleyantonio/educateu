/* eslint-disable @typescript-eslint/no-explicit-any */
import CommonSearch from "@/components/common/search/commonSearch";
/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { CustomField } from "@/components/common/fields/cusInputField";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { HiOutlineFilter } from "react-icons/hi";
import { FilterRole } from "../../../_assets/components/page_components/filterRole";

interface RolemanagementToolbarProps {
  searchText: string;
  setSearchText: (text: string) => void;
  total: string;
  isFilterOpen: boolean;
  setIsFilterOpen: (isFilterOpen: boolean) => void;
  setCurrentPage: (page: any) => void;
  setRoleFilterData: (data: any) => void;
  setLimit: (limit: string) => void;
}

export function RolemanagementToolbar({
  searchText,
  total,
  setSearchText,
  isFilterOpen,
  setIsFilterOpen,
  setRoleFilterData,
  setCurrentPage,
  setLimit,
}: RolemanagementToolbarProps) {
  return (
    <div className="flex flex-wrap gap-4 justify-between items-center p-4 pl-6 bg-white border-b">
      {/* Left Section: Title and Total Count */}
      <div className="flex gap-2 items-center">
        <h1 className="text-base font-bold leading-6 text-black">
          Role List
        </h1>
        <span className="flex gap-x-2 items-center py-1 px-2 text-xs rounded-full text-[#013E5B] bg-[#F0F9FF]">
          {total || "0"} roles
        </span>
      </div>

      {/* Right Section: Search and Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div
          className="cursor-pointer active:rotate-90 px-3 py-2 "
          onClick={() => {
            setRoleFilterData(null);
            setIsFilterOpen(false);
            setCurrentPage(1);
            setSearchText("");
          }}
        >
          <RefreshCcw />
        </div>

        {/* Search Input */}
        <CommonSearch searchText={searchText} setSearchText={setSearchText} />

        {/* Limit */}

        <CustomField.LimitField setLimit={setLimit} />

        <Button
          onClick={() => setIsFilterOpen(true)}
          variant="outline"
          size="sm"
          className="h-10 font-semibold text-[#555F6D]"
        >
          <HiOutlineFilter size={25} color="#555F6D" />
          Filter
        </Button>
        {/* Filter Dropdown */}
        <FilterRole
          isOpenModal={isFilterOpen}
          setIsOpenModal={setIsFilterOpen}
          setRoleFilterData={setRoleFilterData}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
}
