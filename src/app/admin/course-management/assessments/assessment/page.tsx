/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import { CustomField } from "@/components/common/fields/cusInputField";
import { useState } from "react";
import { AssessmentsTable } from "./_assets/components/AssessmentsTable";
import { CreateAssessmentDialog } from "./_assets/components/CreateAssessmentDialog";
import FilterData from "./_assets/components/FilterData";
import { Assessment } from "./_assets/utils/types";

const AssessmentsPage = () => {
  const [searchText, setSearchText] = useState("");
  const [filterData, setFilterData] = useState<any>({});
  const [limit, setLimit] = useState("10");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [editMode, setEditMode] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | (Omit<Assessment, 'id'> & { id?: string }) | undefined>(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading, refetch } = useFetchData({
    path: `assessments`,
    method: "GET",
    queryKey: "fetch-list-of-assessments",
    filterData: {
      page: currentPage,
      ...filterData,
      pageSize: limit,
      searchTerm: searchText,
    },
  });

  const handleEditDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      // Clear state when dialog closes
      setEditMode(false);
      setEditingAssessment(undefined);
    }
  };


  return (
    <PageWithBreadcrumb
      items={[
        { title: "Home", href: "/admin" },

        {
          title: "Assessments",
        },
      ]}
    >
      <div>
        <FilterData
          isLoading={isLoading}
          setFilterData={setFilterData}
          setCurrentPage={setCurrentPage}
        />
        <div className="rounded-md border shadow-md border-1 border-[#EAEDF0]">
          <div className="flex flex-wrap justify-between items-center p-6 gap-2">
            <div className="flex gap-2 justify-start items-center basis-1/4">
              <h1 className="text-lg font-bold leading-6 text-black">
                Assessment List
              </h1>

            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <CustomField.CommonSearch
                searchText={searchText}
                setSearchText={setSearchText}
              />
              <CustomField.LimitField
                totalItems={data?.data?.pagination?.total}
                setLimit={setLimit}
                setCurrentPage={setCurrentPage}
              />
              <CreateAssessmentDialog
                onSave={() => {
                  refetch();
                  setEditMode(false);
                  setEditingAssessment(undefined);
                  setDialogOpen(false);
                }}
                onRefresh={refetch}
                assessment={editingAssessment}
                isEditMode={editMode}
                open={dialogOpen}
                onOpenChange={handleEditDialogClose}
              />
            </div>
          </div>
          <AssessmentsTable
            data={data?.data?.assessments || []}
            isLoading={isLoading}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={data?.data?.pagination?.totalPages || data?.pagination?.totalPages || 1}
            onRefresh={refetch}
            onEditingAssessment={(assessment) => {
              setEditingAssessment(assessment);
              setEditMode(true);
              setDialogOpen(true);
            }}
            onDuplicateAssessment={(assessment) => {
              setEditingAssessment(assessment);
              setEditMode(false);
              setDialogOpen(true);
            }}
          />
        </div>
      </div>
    </PageWithBreadcrumb>
  );
};

export default AssessmentsPage;
