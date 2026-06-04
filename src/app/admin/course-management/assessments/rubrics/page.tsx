/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import { CustomField } from "@/components/common/fields/cusInputField";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { RubricsTable } from "./_assets/components/RubricsTable";
import { RubricTemplate } from "./_assets/utils/types";
import CreateRubricTemplateDialog from "./_assets/components/createRubricTemplateDialog";

const RubricsPage = () => {
  const [searchText, setSearchText] = useState("");
  const [limit, setLimit] = useState("10");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { data, isLoading, refetch } = useFetchData({
    path: `assessments/rubric-templates`,
    method: "GET",
    queryKey: "fetch-list-of-rubric-templates",
    filterData: {
      page: currentPage,
      pageSize: limit,
      searchTerm: searchText,
    },
  });

  const rubricTemplates: RubricTemplate[] =
    data?.data?.rubricTemplates || [];

  // Sort by updatedAt (newest first)
  const sortedRubrics = [...rubricTemplates].sort((a, b) => {
    const dateA = new Date(a.updatedAt).getTime();
    const dateB = new Date(b.updatedAt).getTime();
    return dateB - dateA; // Descending order (newest first)
  });

  // Filter rubrics by search text if needed (client-side filtering)
  const filteredRubrics = searchText
    ? sortedRubrics.filter(
      (rubric) =>
        rubric.name.toLowerCase().includes(searchText.toLowerCase())
    )
    : sortedRubrics;

  // Calculate pagination
  const totalPages = Math.ceil(filteredRubrics.length / parseInt(limit));
  const startIndex = (currentPage - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedRubrics = filteredRubrics.slice(startIndex, endIndex);
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <PageWithBreadcrumb
      items={[
        { title: "Home", href: "/admin" },
        {
          title: "Course Management",
          href: "/admin/course-management/",
        },
        {
          title: "Rubrics",
        },
      ]}
    >
      <div>
        <div className="rounded-md border shadow-md border-1 border-[#EAEDF0]">
          <div className="flex flex-wrap justify-between items-center p-6 gap-2">
            <div className="flex gap-2 justify-start items-center basis-1/4">
              <h1 className="text-lg font-bold leading-6 text-black">
                Rubrics List
              </h1>
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <CustomField.CommonSearch
                searchText={searchText}
                setSearchText={setSearchText}
              />
              <CustomField.LimitField
                totalItems={filteredRubrics.length}
                setLimit={setLimit}
                setCurrentPage={setCurrentPage}
              />
              <Button
                className="bg-primary text-white hover:bg-primary/90"
                onClick={() => setOpenDialog(true)}
              >
                Create New Rubrics Template
              </Button>
            </div>
          </div>
          <RubricsTable
            data={paginatedRubrics}
            isLoading={isLoading}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages || 1}
            onRefresh={refetch}


          />
        </div>
      </div>
      <CreateRubricTemplateDialog open={openDialog} setOpen={setOpenDialog} />
    </PageWithBreadcrumb>
  );
};

export default RubricsPage;
