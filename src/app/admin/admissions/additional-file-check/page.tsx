"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import { Card } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ApplicantTable } from "./_assets/components/page_component/applicant_table/applicant_table";
import { IFilterLists } from "./_assets/components/page_component/applicant_table/data_type";

const AdditionalApplicationFileCheck = () => {
  // const user = useAuths();
  // const token = user?.user?.token;

  // const [category, setCategory] = useState("");
  // const [search, setSearch] = useState("");
  const [searchText, setSearchText] = useState("");
  const [filterLists, setFilterLists] = useState<
    Partial<IFilterLists> | undefined
  >(undefined);
  const [limit, setLimit] = useState("10");

  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);

  const { data, isLoading } = useFetchData({
    queryKey: "list-of-additional-applications-data",
    path: `additional-file-check/applications`,
    method: "POST",
    filterData: {
      page: currentPage,
      searchTerm: searchText,
      pageSize: limit,
      ...filterLists,
    },
  });

  const cardDate = [
    {
      title: "Duplicated Name",
      count: 500,
    },
    {
      title: "Duplicated Date of Birth",
      count: 80,
    },
    {
      title: "Duplicated Address",
      count: 70,
    },
  ];

  return (
    <PageWithBreadcrumb
      items={[
        { title: "Home" },
        // { title: "Admisison", href: "/admin/admissions/admission" },
        {
          title: "Additional-File-Check",
        },
      ]}
    >
      <div className="relative my-5">
        <section className="">
          {/* Applicants summary cards*/}
          <div className="grid grid-cols-1 gap-2 xl:gap-9 mb-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? cardDate.map((card, index) => (
                  <div key={index}>
                    <Card className="p-4 h-[96px] text-[#666666] animate-pulse">
                      {/* Title skeleton */}
                      <div className="h-4 w-24 rounded bg-gray-200" />

                      {/* Count skeleton */}
                      <div className="mt-3 h-6 w-16 rounded bg-gray-200" />
                    </Card>
                  </div>
                ))
              : cardDate.map((card, index) => (
                  <div key={index}>
                    <Card className="p-4 text-[#666666]">
                      <h1 className="xl:text-lg font-bold text-red-600">
                        {card?.title}
                      </h1>
                      <h1 className="mt-3 text-xl font-bold text-[#151D48]">
                        {card?.count}
                      </h1>
                    </Card>
                  </div>
                ))}
          </div>

          {/* Applicants Table */}
          <div>
            <ApplicantTable
              applications={data} // for table data
              setCurrentPage={setCurrentPage} // for pagination
              currentPage={currentPage} // for pagination
              isLoading={isLoading} // for loading
              // for search
              search={searchText}
              setSearch={setSearchText}
              // for limit
              limit={limit}
              setLimit={setLimit}
              filterLists={filterLists}
              setFilterLists={setFilterLists}
            />
          </div>
        </section>
      </div>
    </PageWithBreadcrumb>
  );
};

export default AdditionalApplicationFileCheck;
