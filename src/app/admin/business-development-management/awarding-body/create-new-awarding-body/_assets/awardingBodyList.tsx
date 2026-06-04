/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import ActionButton from "@/components/common/button/actionButton";
import DynamicTableWithPagination from "@/components/common/DynamicTable/DynamicTable";
import { capitalCase } from "@/utils/capitalCase/capitalCase";
import { capitalizeMonthName } from "@/utils/capitalizeMonthName/capitalizeMonthName";
import { StatusWithIcon } from "@/utils/status_point";
import { useState } from "react";
import AwardingBodyDeleteModal from "./awardingBodyDeleteModal";
import { AwardingBodyEditModal } from "./awardingBodyEditModal";
import fileEdit from "/public/assets/logo/agent/admin/edit-2.svg";

type AccessLevel = "full-access" | "read-only" | "no-access" | "delete-access";

const AwardingBodyList = ({
  isLoading,
  data,
  accessLevel,
  setCurrentPage,
  currentPage,
}: {
  data: any;
  isLoading: boolean;
  accessLevel?: AccessLevel;
  refetchData?: () => void;
  setCurrentPage: (data: number) => void;
  currentPage: number;
}) => {
  const canEdit = accessLevel === "full-access";
  const [isOpen, setOpen] = useState(false);
  const [awardingBodyId, setAwardingBodyId] = useState<string | null>(null);
  const [isDisabled, setisDisabled] = useState(true);

  const handleAwardingEdit = (id: string) => {
    setisDisabled(false);
    setOpen(true);
    setAwardingBodyId(id);
  };

  const handleRowClick = (id: string) => {
    setisDisabled(true);
    setOpen(true);
    setAwardingBodyId(id);
  };

  // Prepare pagination data
  const paginationData = {
    page: currentPage,
    total: data?.pagination?.total || 0,
    totalPages: data?.pagination?.totalPages || 1,
  };

  return (
    <div>
      <AwardingBodyEditModal
        awardingBodyId={awardingBodyId}
        data={data?.data?.awardingBodies}
        isOpen={isOpen}
        isDisabled={isDisabled}
        setOpen={setOpen}
        setisDisabled={setisDisabled}
      />

      <DynamicTableWithPagination
        data={data?.data?.awardingBodies || []}
        isLoading={isLoading}
        pagination={paginationData}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        config={{
          columns: [
            {
              key: "name",
              header: "Name",
              className: "p-3 hover:cursor-pointer",
              render: (award: any) => (
                <div onClick={() => handleRowClick(award.id)}>
                  {award.name}
                </div>
              ),
            },
            {
              key: "abbreviation",
              header: "Abbreviation",
              className: "p-5 hover:cursor-pointer",
              render: (award: any) => (
                <div onClick={() => handleRowClick(award.id.toString())}>
                  {capitalCase(award.abbreviation)}
                </div>
              ),
            },
            {
              key: "intakePeriod",
              header: "Intake Period",
              className: "p-5 hover:cursor-pointer",
              render: (award: any) => (
                <div onClick={() => handleRowClick(award.id.toString())}>
                  {Array.isArray(award.intakePeriods ?? award.intakePeriod) &&
                  (award.intakePeriods ?? award.intakePeriod).length > 0
                    ? capitalizeMonthName(
                        (award.intakePeriods ?? award.intakePeriod)?.join(", ")
                      )
                    : "-"}
                </div>
              ),
            },
            {
              key: "status",
              header: "Status",
              className: "p-3 hover:cursor-pointer",
              render: (award: any) => (
                <div onClick={() => handleRowClick(award.id.toString())}>
                  {award.status ? (
                    <StatusWithIcon status={award.status} />
                  ) : (
                    <p className="ml-5">-</p>
                  )}
                </div>
              ),
            },
            {
              key: "actions",
              header: "Action",
              className: "text-center",
              render: (award: any) => (
                <div className="flex gap-2 justify-end">
                  <ActionButton
                    variant="icon"
                    btnStyle="hover:border-blue-700"
                    tooltipContent="Update Awarding Body"
                    imageSrc={fileEdit}
                    disabled={!canEdit}
                    handleOpen={() => handleAwardingEdit(award.id.toString())}
                  />
                  <AwardingBodyDeleteModal
                    id={award.id}
                    name={award.name}
                    disabled={!canEdit}
                  />
                </div>
              ),
            },
          ],
          rowClassName: () => "hover:bg-gray-100",
        }}
      />
    </div>
  );
};

export default AwardingBodyList;