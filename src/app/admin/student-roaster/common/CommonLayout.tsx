"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ApplicantTable } from "../common/page_component/ApplicantTable";
import { FilterComponent } from "../common/page_component/filter_component";

type CommonLayoutProps = {
  mode?: "registry" | "support";
};

const CommonLayout = ({ mode }: CommonLayoutProps) => {
  const [filterPayload, setFilterPayload] = useState<
    Record<string, unknown> | undefined
  >();
  const [limit, setLimit] = useState("10");

  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);

  const { data, isLoading } = useFetchData({
    path: `${mode}`,
    method: "POST",
    queryKey: "fetch-student-roaster",
    filterData: {
      ...filterPayload,
      pageSize: limit,
      page: currentPage,
    },
  });

  return (
    <div className="relative my-5">
      <section className="px-4">
        <FilterComponent mode={mode} onFilterChange={setFilterPayload} />
        <div className="mt-4">
          <ApplicantTable
            mode={mode}
            data={data}
            setCurrentPage={setCurrentPage}
            currentPage={currentPage}
            isLoading={isLoading}
            setLimit={setLimit}
          />
        </div>
      </section>
    </div>
  );
};

export default CommonLayout;
