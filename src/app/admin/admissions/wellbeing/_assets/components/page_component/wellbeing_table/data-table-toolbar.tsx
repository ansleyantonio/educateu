import ActionButton from "@/components/common/button/actionButton";
import { CustomField } from "@/components/common/fields/cusInputField";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { HiOutlineFilter } from "react-icons/hi";

interface FormValues {
  awardingBodyId: string;
  courseId: string;
  sessionId: string;
  agentId: string;
  subAgentId: string;
  nationality: string;
  applicationStatus: string;
  dateFrom: string;
  dateTo: string;
}
interface DataTableToolbarProps {
  dataLength: number;
  setLimit: (limit: string) => void;
  // search: string;
  // setSearch: (search: string) => void;
  // filterLists: IFilterLists | undefined;
  // setFilterLists: (filterLists: IFilterLists | undefined) => void;
  isFilterOpen?: boolean;
  setIsFilterOpen?: (isFilterOpen: boolean) => void;
  searchTerm?: string;
  setSearchTerm?: (search: string) => void;
  filters?: Record<string, unknown>;
  setFilters?: (filter: Record<string, unknown>) => void;
  form?: UseFormReturn<FormValues>;
  setCurrentPage?: (page: number) => void;
}

export function DataTableToolbar({
  dataLength,
  setLimit,
  isFilterOpen,
  setIsFilterOpen,
  searchTerm,
  filters,
  setSearchTerm,
  setFilters,
  form,
  setCurrentPage,
}: DataTableToolbarProps) {
  const isFilterActive = Boolean(
    searchTerm ||
      Object.values(filters ?? {}).some(
        (v) => v !== "" && v !== null && v !== undefined
      )
  );

  const handleResetForm = () => {
    setSearchTerm?.("");
    setFilters?.({});
    form?.reset({
      awardingBodyId: "",
      courseId: "",
      sessionId: "",
      agentId: "",
      subAgentId: "",
      nationality: "",
      applicationStatus: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  return (
    <div className="flex flex-wrap gap-4 justify-between items-center p-4 bg-white border-b">
      <div className="flex flex-wrap gap-2 items-center">
        <h1 className="text-lg font-semibold text-black">Total Applicants</h1>
        <span className="py-1 px-3 text-sm text-blue-600 bg-blue-50 rounded-full">
          {dataLength} Candidates
        </span>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <CustomField.CommonSearch
          searchText={searchTerm}
          setSearchText={setSearchTerm}
        />

        {isFilterActive && (
          <ActionButton
            handleOpen={handleResetForm}
            type="button"
            variant="outline"
            tooltipContent="Reset"
            icon={<RefreshCw />}
          />
        )}

        <CustomField.LimitField
          totalItems={dataLength}
          setLimit={setLimit}
          setCurrentPage={setCurrentPage}
        />

        <Button
          onClick={() => setIsFilterOpen?.(true)}
          variant="outline"
          size="lg"
          className="font-semibold text-[#555F6D]"
        >
          <HiOutlineFilter size={25} color="#555F6D" />
          Filter
        </Button>

        {/* Filter Dropdowm */}
      </div>
    </div>
  );
}
