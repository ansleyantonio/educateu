"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import { CustomField } from "@/components/common/fields/cusInputField";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { CreateFacultyModal } from "./_assets/components/modal/CreateFacultyModal";
import FacultyList from "./_assets/components/view/FacultyList";

const AllFaculty = () => {
  const [searchText, setSearchText] = useState("");
  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);
  const [filterData, setFilterData] = useState({});
  const [limit, setLimit] = useState("10");

  const { data, isLoading } = useFetchData({
    filterData: { ...filterData, name: searchText },
    path: "faculty-management",
    method: "GET",
    queryKey: "fetch-list-of-faculties",
  });

  return (
    <PageWithBreadcrumb
      items={[
        { title: "Home", href: "/admin" },
        // { title: "External Portal Users", href: "/admin/external-portal-users/all-faculty" },
        {
          title: "All Faculty",
          href: "/admin/external-portal-users/all-faculty",
        },
      ]}
    >
      <div className="rounded-md border shadow-md border-1 border-[#EAEDF0]">
        <div className="flex flex-wrap justify-between items-center p-6 gap-2">
          <div className="flex gap-2 items-center">
          <h1 className="text-lg font-bold leading-6 text-black">
            Faculty List
          </h1>
          <span className="py-1 px-3 text-xs text-blue-600 bg-blue-50 rounded-full">
            {data?.pagination?.total} Faculties
          </span>
        </div>
          <div className="flex gap-2 items-center flex-wrap">
            <CustomField.CommonSearch
              searchText={searchText}
              setSearchText={setSearchText}
            />
            <CustomField.LimitField setLimit={setLimit} />
            <CreateFacultyModal />
          </div>
        </div>
        <FacultyList
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          FacultyData={data?.data}
          isLoading={isLoading}
          pagination={data?.pagination}
        />
      </div>
    </PageWithBreadcrumb>
  );
};

export default AllFaculty;
