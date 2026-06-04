"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import CommonSearch from "@/components/common/search/commonSearch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/custom_ui/customCard";
import {
  buildQueryParams,
  IFilter,
} from "@/utils/buildQueryParams/buildQueryParams";
import { getUserAccess } from "@/utils/permissions/permissions";
import { useMatchedModule } from "@/utils/useMatchedModule/useMatchedModule";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { HiOutlineFilter } from "react-icons/hi";
import z from "zod";
import AwardingBodyList from "./create-new-awarding-body/_assets/awardingBodyList";
import AwardingStatusBodyFilter from "./create-new-awarding-body/_assets/awardingStatusBodyFilter";
import { AwardingBodyFilter } from "./create-new-awarding-body/_assets/components/awarding_body_filter";
import { AwardingBodyFilterSchema } from "./create-new-awarding-body/interface/CreateAwardingBodySchema";

export type Grade = {
  classification: string;
  percentageRange: string;
  ukGpaEquivalent?: number;
};

export type AwardingBody = {
  id: number;
  name: string;
  abbreviation: string;
  intakePeriod: string[];
  grades: Grade[];
  selectRequiredDocuments: string[];
};

const AwardingBody = () => {
  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);
  const matchedModule = useMatchedModule();
  const permissions = matchedModule?.modulePermission ?? [];
  const hasPostAndDeletePermission =
    getUserAccess(permissions) === "full-access";

  const [searchText, setSearchText] = useState("");
  const [agentType, setAgentType] = useState("");
  const [status, setStatus] = useState("all");
  const [limit, setLimit] = useState("10");
  const [orgType, setOrgType] = useState("Internal Organization");

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filter, setFilter] = useState<IFilter | null>(null);

  const form = useForm<z.infer<typeof AwardingBodyFilterSchema>>({
    resolver: zodResolver(AwardingBodyFilterSchema),
    defaultValues: {
      selectRequiredDocuments: [],
      intakePeriod: [],
    },
  });

  const queryString = buildQueryParams(
    filter,
    currentPage,
    searchText,
    status,
    limit
  );

  const { data, isLoading} = useFetchData({
    filterData: {},
    queryKey: "fetch-list-of-awarding-bodies",
    method: "GET",
    path: `awarding-bodies?${queryString}`,
  });

  return (
    <PageWithBreadcrumb
      items={[
        { title: "Home", href: "/admin" },
        // {
        //   title: "Business Development Management",
        //   href: "/admin/business-development-management/awarding-body",
        // },
        { title: "Awarding Body" },
      ]}
    >
      <div>
        <div className="flex flex-wrap gap-2 justify-between items-center p-[15px] py-4 w-full">
          <h1 className="text-lg font-bold tracking-wide leading-5 text-[#192128]">
            Awarding Body
          </h1>
          <div
            className={`flex items-center py-2 px-4 rounded-md text-white ${
              hasPostAndDeletePermission
                ? "bg-[#013E5B] hover:bg-[#002d42] cursor-pointer"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            <Link
              href="/admin/business-development-management/awarding-body/create-new-awarding-body"
              className={`flex items-center gap-x-2 ${
                !hasPostAndDeletePermission ? "pointer-events-none" : ""
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Create New Awarding Body</span>
            </Link>
          </div>
        </div>

        {/* search plus filter */}
        <Card>
          <div className="flex flex-wrap items-center justify-between p-4 border-b gap-2">
            <div className="flex flex-wrap gap-2 items-center">
              <h1 className="text-lg font-bold tracking-wide leading-5 text-[#192128]">
                Awarding Body List
              </h1>
              <span className="py-1 px-3 text-sm text-blue-600 bg-blue-50 rounded-full">
                {data?.pagination?.total} Awarding{" "}
                {data?.pagination?.total === 1 ? "Body" : "Bodies"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <CommonSearch
                searchText={searchText}
                setSearchText={setSearchText}
              />
              <AwardingStatusBodyFilter
                status={status}
                limit={limit}
                setAgentType={setAgentType}
                setStatus={setStatus}
                setLimit={setLimit}
                setOrgType={setOrgType}
                setCurrentPage={setCurrentPage}
                total={data?.pagination?.total ?? 0}
              />
              <div className="flex flex-wrap gap-2">
                {(filter || status !== "all" || searchText !== "") && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilter(null);
                      form.reset();
                      setStatus("all");
                      setLimit("10");
                      setSearchText("");
                    }}
                  >
                    <RefreshCcw />
                  </Button>
                )}
                <Button
                  onClick={() => setIsFilterOpen(true)}
                  variant="outline"
                  size="sm"
                  className="ml-auto h-10 text-sm font-semibold text-[#555F6D]"
                >
                  <HiOutlineFilter size={28} color="#555F6D" />
                  Filter
                </Button>
              </div>
            </div>
          </div>

          <div>
            <AwardingBodyList
              data={data}
              isLoading={isLoading}
              accessLevel={getUserAccess(permissions)}
              setCurrentPage={setCurrentPage}
              currentPage={currentPage}
            />
            <AwardingBodyFilter
              form={form}
              setFilter={setFilter}
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
            />
          </div>
        </Card>
      </div>
    </PageWithBreadcrumb>
  );
};

export default AwardingBody;
