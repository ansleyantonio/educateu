"use client";

import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import ActionButton from "@/components/common/button/actionButton";
import { CustomField } from "@/components/common/fields/cusInputField";
import CusPagination from "@/components/common/pagination/paginations";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { RefreshCcw } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  ApplicationForm,
  ApplicationFormValues,
} from "./_assets/components/application_form";
import PreScreeningDetails from "./_assets/components/preScreening_details";

const DocumentPage = () => {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<ApplicationFormValues | null>(null);
  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);
  const [limit, setLimit] = useState("10");

  const { data, isLoading } = useFetchData({
    path: "pre-screening",
    queryKey: "list-of-pre-screening-applicants-data",
    method: "POST",
    filterData: {
      ...filters,
      searchTerm: search,
      pageSize: limit,
      page: currentPage,
    },
  });

  return (
    <PageWithBreadcrumb
      items={[
        { title: "Home" },
        {
          title: "Pre-Screening",
        },
      ]}
    >
      <div className="space-y-4">
        {/* Form Card */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="filter-application">
            <Card className="p-4">
              <AccordionTrigger className="flex justify-between items-center p-5">
                <p className="text-xl font-medium text-[#272E35]">
                  Filter Applications
                </p>
              </AccordionTrigger>

              <AccordionContent>
                <ApplicationForm onSubmitFilters={setFilters} />
              </AccordionContent>
            </Card>
          </AccordionItem>
        </Accordion>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 p-4 mb-4 rounded-lg border border-gray-200 justify-between">
          {/* Page Header */}
          <div className="mb-4">
            <h1 className="text-3xl font-semibold text-black">Pre-Screening</h1>
            {/* <p className="text-sm text-gray-600"> */}
            {/*   Add relevant details to filter applications effectively. */}
            {/* </p> */}
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <CustomField.CommonSearch
              searchText={search}
              setSearchText={setSearch}
            />
            <CustomField.LimitField
              setLimit={setLimit}
              totalItems={data?.pagination?.total}
              setCurrentPage={setCurrentPage}
            />

            {(currentPage > 1 || limit !== "10" || search) && (
              <ActionButton
                variant="icon"
                onClick={() => {
                  setCurrentPage(1);
                  setLimit("10");
                  setSearch("");
                }}
                icon={<RefreshCcw />}
              />
            )}
          </div>
        </div>

        {/* Pre-Screening Details */}
        <PreScreeningDetails isLoading={isLoading} data={data?.data} />

        <div className="my-6">
          {currentPage > 1 && (
            <CusPagination
              currentPage={currentPage || 1}
              totalPages={data?.pagination?.totalPages}
              setCurrentPage={setCurrentPage}
            />
          )}
        </div>
      </div>
    </PageWithBreadcrumb>
  );
};

export default DocumentPage;
