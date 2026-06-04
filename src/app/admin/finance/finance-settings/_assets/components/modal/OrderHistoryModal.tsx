/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import ActionButton from "@/components/common/button/actionButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { useState } from "react";
import historyIcon from "/public/assets/logo/agent/admin/transaction-history.svg";
import { Timeline } from "@/components/ui/custom_ui/timeline";
import { useSearchParams } from "next/navigation";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuditLogFilterFormSchema } from "@/app/admin/finance/certificate-course-fee/_assets/schemas/auditLogFilter";
import { Button } from "@/components/ui/custom_ui/button";
import { HiOutlineFilter } from "react-icons/hi";
import { useAuths } from "@/hooks/userContext";
import CusPagination from "@/components/common/pagination/paginations";
import { AuditLogFilter } from "@/app/admin/finance/certificate-course-fee/_assets/components/audit_log_filter";
import { AuditDownloadModal } from "@/app/admin/finance/certificate-course-fee/_assets/components/audit_download_modal";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";

type PaymentLog = {
  id: string;
  action: string;
  createdAt: string;
  updatedAt: string;
};

type PaymentAuditLogsResponse = {
  auditLogs: PaymentLog[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
};

const mockData: PaymentAuditLogsResponse = {
  auditLogs: [
    {
      id: "1",
      action: "1st Installment Complete $2500",
      createdAt: "2024-07-12T14:32:00Z",
      updatedAt: "2024-07-12T14:32:00Z",
    },
    {
      id: "2",
      action: "2nd Installment Complete $2500",
      createdAt: "2024-07-12T15:00:00Z",
      updatedAt: "2024-07-12T15:00:00Z",
    },
    {
      id: "3",
      action: "3rd Installment Due $2500",
      createdAt: "2024-07-12T15:00:00Z",
      updatedAt: "2024-07-12T15:00:00Z",
    },
    {
      id: "4",
      action: "4th Installment Pending $2500",
      createdAt: "2024-07-12T15:00:00Z",
      updatedAt: "2024-07-12T15:00:00Z",
    },
  ],
  totalRecords: 3,
  totalPages: 1,
  currentPage: 1,
}

interface IFilter {
  startDate: string | undefined;
  endDate: string | undefined;
  name: string;
  actionTypes: string[];
}

export function CourseFeeHistoryModal({id}:{id:string}) {
  const [open, setOpen] = useState(false);
    const searchParams = useSearchParams();
    const activePage = Number(searchParams.get("page")) || 1;
    const {editAccess} = useAuths()
    const [currentPage, setCurrentPage] = useState(activePage);
  
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [openDialog, setDialog] = useState(false);
    const [isValue, setIsValue] = useState("all");
    const [filter, setFilter] = useState<IFilter | null>(null);

    const form = useForm<z.infer<typeof AuditLogFilterFormSchema>>({
        resolver: zodResolver(AuditLogFilterFormSchema),
        defaultValues: {
          startDate: undefined,
          endDate: undefined,
          name: "",
          actionTypes: [],
        },
      });

      const { data, isLoading } = useFetchData({
    queryKey: "course-fee-history",
    path: `courses/audit-logs/${id}`,
    method: "GET",
    enabled: !!id,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ActionButton
          variant="icon"
          tooltipContent="Finance Settings History"
          imageSrc={historyIcon}
          handleOpen={() => setOpen(true)}
        ></ActionButton>
      </DialogTrigger>

      <DialogContent className="w-full md:min-w-[65%] h-[85%] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-bold text-base text-black">
            Finance Settings History
          </DialogTitle>
          <DialogDescription>
            <div className="flex items-center space-x-2 mx-3">
            {filter && (
              <Button
                variant="outline"
                onClick={() => {
                  setFilter(null);
                  form.reset();
                }}
              >
                Reset
              </Button>
            )}

            {/* Filter Button */}
            <Button
              onClick={() => setIsFilterOpen(true)}
              variant="outline"
              size="sm"
              className="ml-auto h-10 text-sm font-semibold text-[#555F6D]"
            >
              <HiOutlineFilter size={28} color="#555F6D" />
              Filter
            </Button>

            {/* Download Button */}
            <Button
              onClick={() => {
                if (editAccess) setDialog(true);
              }}
              variant="outline"
              size="sm"
              disabled={!editAccess}
              className={`ml-auto h-10 font-semibold text-[#555F6D] text-sm ${
                !editAccess
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              Download
            </Button>
          </div>
          </DialogDescription>
        </DialogHeader>

       <Timeline items={data?.data} isLoading={isLoading} />
       <div className="my-6 mx-3">
          <CusPagination
            totalPages={data?.totalPages || 1}
            setCurrentPage={setCurrentPage}
            currentPage={currentPage}
          />
        </div>
        <AuditLogFilter
          form={form}
          setFilter={setFilter}
          isFilterOpen={isFilterOpen}
          setIsFilterOpen={setIsFilterOpen}
        />
        <AuditDownloadModal open={openDialog} setOpen={setDialog} />
      </DialogContent>
    </Dialog>
  );
}
