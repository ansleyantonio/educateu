"use client";

import DynamicTableWithPagination from "@/components/common/DynamicTable/DynamicTable";
import dateFormat from "@/utils/DateFormatter";
import { Dispatch, SetStateAction } from "react";
import { RubricTemplate } from "../utils/types";
import RubricAction from "./RubricAction";
import Link from "next/link";

interface RubricsTableProps {
  data: RubricTemplate[];
  isLoading?: boolean;
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  totalPages: number;
  onRefresh?: () => void;

}

export function RubricsTable({
  data,
  isLoading = false,
  currentPage,
  setCurrentPage,
  totalPages,
  onRefresh,

}: RubricsTableProps) {
  // Calculate total points from rubric criteria
  const getTotalPoints = (rubric: RubricTemplate): number => {
    return rubric.rubricCriteria.reduce((sum, criteria) => sum + (criteria.weight || 0), 0);
  };

  return (
    <DynamicTableWithPagination
      isLoading={isLoading}
      data={data || []}
      pagination={{
        page: currentPage,
        total: data?.length || 0,
        totalPages: totalPages,
      }}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      config={{
        columns: [

          {
            key: "name",
            header: "Rubric Name",
            render: (rubric) => <Link href={`/admin/course-management/assessments/rubrics/${rubric.id}`}>{rubric.name}</Link>,
          },
          {
            key: "weight",
            header: "Total Weight",
            render: (rubric) => `${getTotalPoints(rubric)} Mark`,
          },
          {
            key: "rubricCriteria",
            header: "Rubric Criteria",
            render: (rubric) => rubric.rubricCriteria?.length
          },
          {
            key: "updatedAt",
            header: "Last Updated",
            render: (rubric) => dateFormat.fullDateTime(rubric.updatedAt, { showTime: true, local: true })
          },
          {
            key: "action",
            header: "Actions",
            render: (rubric) => (
              <RubricAction
                rubric={rubric}
                onRefresh={onRefresh}

              />
            ),
          },
        ],
      }}
    />
  );
}

