"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import { CustomField } from "@/components/common/fields/cusInputField";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SectionHeader } from "@/components/SectionHeader/SectionHeader";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import CourseFeeList from "../_assets/components/view/courseList";

const DegreeCourseFee = () => {
  const [searchText, setSearchText] = useState("");
  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);
  // const [filterData, setFilterData] = useState<IFilterAdvanceModuleForm>({});
  const [limit, setLimit] = useState("10");

  const { data, isLoading } = useFetchData({
    method: "GET",
    path: "advanced-course-fee/course-fees/advance-degree",
    filterData: {
      // ...filterData,
      // courseType: "DEGREE_COURSE",
      // moduleType: "DEGREE",
      page: currentPage,
      limit,
      search: searchText,
    },
    queryKey: "fetch-degree-module-list",
  });

  return (
    <PageWithBreadcrumb
      items={[
        { title: "Home", href: "/" },
        { title: "Finance", href: "/admin/finance/certificate-course-fee/cpd" },
        {
          title: "Advanced Course Fee",
          href: "/admin/finance/advanced-course-fee/degree",
        },
        {
          title: "Degree Course Fee",
        },
      ]}
    >
      <div className="rounded-md border shadow-md border-1 border-[#EAEDF0]">
        <div className="flex justify-between items-center p-6 -pl-4">
          <SectionHeader
            title="Degree Course Fee"
            total={data?.data?.pagination?.total || 0}
            label="Course"
            labels="Courses"
          />
          <div className="gap-2 space-y-2 lg:flex lg:space-y-0">
            <CustomField.CommonSearch
              searchText={searchText}
              setSearchText={setSearchText}
            />
            <CustomField.LimitField
              totalItems={data?.data?.pagination?.total}
              setLimit={setLimit}
              setCurrentPage={setCurrentPage}
            />
            <Link href="/admin/finance/advanced-course-fee/degree/create">
              <Button size={"lg"} variant={"primary"}>
                Create Degree Course Fee
              </Button>
            </Link>
          </div>
        </div>
        <CourseFeeList
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          courseDataFinance={data?.data?.courseList}
          isLoading={isLoading}
          totalPages={data?.data?.pagination?.totalPages || 1}
          moduleType="degree"
        />
      </div>
    </PageWithBreadcrumb>
  );
};

export default DegreeCourseFee;