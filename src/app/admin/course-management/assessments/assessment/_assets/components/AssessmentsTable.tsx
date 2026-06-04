"use client";

import DynamicTableWithPagination from "@/components/common/DynamicTable/DynamicTable";
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";
import { Assessment } from "../utils/types";
import AssessmentAction from "./AssessmentAction";

interface AssessmentsTableProps {
    data: Assessment[];
    isLoading?: boolean;
    currentPage: number;
    setCurrentPage: Dispatch<SetStateAction<number>>;
    totalPages: number;
    onRefresh?: () => void;
    onEditingAssessment?: Dispatch<SetStateAction<Assessment | (Omit<Assessment, 'id'> & { id?: string }) | undefined>>;
    onDuplicateAssessment?: Dispatch<SetStateAction<Assessment | (Omit<Assessment, 'id'> & { id?: string }) | undefined>>;
}

export function AssessmentsTable({
    data,
    isLoading = false,
    currentPage,
    setCurrentPage,
    totalPages,
    onRefresh,
    onEditingAssessment,
    onDuplicateAssessment,
}: AssessmentsTableProps) {



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
                        key: "nameOrTitle",
                        header: "Assessment Title",
                        render: (assessment) => (
                            <Link
                                href={`/admin/course-management/assessments/assessment/${assessment?.id}?assessmentCategory=${assessment?.assessmentCategory}&status=${assessment.status || "DRAFT"}`}
                                className=" transition cursor-pointer hover:opacity-80"
                            >
                                {assessment.nameOrTitle}
                            </Link>
                        ),
                    },
                    {
                        key: "assessmentCode",
                        header: "Assessment Code",
                        render: (assessment) => assessment.assessmentCode,
                    },
                    {
                        key: "assessmentType",
                        header: "Assessment Type",
                        render: (assessment) => assessment.assessmentType,
                    },
                    {
                        key: "totalPointsOrWeight",
                        header: "Points",
                        render: (assessment) => `${assessment.totalPointsOrWeight} Mark`,
                    },
                    {
                        key: "action",
                        header: "Action",
                        render: (assessment) => (
                            <AssessmentAction
                                assessment={assessment}
                                onEditingAssessment={onEditingAssessment}
                                onRefresh={onRefresh}
                                onDuplicateAssessment={onDuplicateAssessment}
                            />
                        ),
                    },
                ],
            }}
        />
    );
}
