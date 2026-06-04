/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { terminateAgentSchema } from "@/app/admin/business-development-management/create-new-agent/_assets/interface/CreateAgentSchema";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import ActionButton from "@/components/common/button/actionButton";
import CusPagination from "@/components/common/pagination/paginations";
import { StatusWithIcon } from "@/utils/status_point";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import z from "zod";

const AgreementModal = ({
  isOpen,
  setIsOpen,
  awardingBodies,
  token,
  buttonOption,
  id,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  awardingBodies: any[];
  token: string;
  buttonOption?: "terminate" | "download" | undefined;
  id: string;
}) => {
  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [awardingBodyId, setAwardingBodyId] = useState<string | null>(null);
  const [confirmTerminateId, setConfirmTerminateId] = useState<string | null>(
    null
  );
  const pageSize = 5;
  const queryClient = useQueryClient();

  const pagination = useMemo(() => {
    const totalItems = awardingBodies?.length || 0;
    const totalPages = Math.ceil(totalItems / pageSize);
    return { page: currentPage, total: totalItems, pageSize, totalPages };
  }, [awardingBodies, currentPage]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return awardingBodies?.slice(start, end) || [];
  }, [awardingBodies, currentPage]);

  // Download API
  const downloadAgreementMutation = useMutation({
    mutationFn: async (templateId: string) => {
      setDownloadingId(templateId);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/business-development-management/agent/agreement/${templateId}/pdf`,
        {
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return { data: response.data, templateId };
    },
    onSuccess: ({ data, templateId }) => {
      toast.success("Agreement downloaded successfully!");
      const blob = new Blob([data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.download = `Agreement-${templateId}.pdf`;
      link.click();
    },
    onError: () => {
      toast.error("Failed to download agreement");
    },
    onSettled: () => {
      setDownloadingId(null);
    },
  });

  // Terminate API
  const terminateAgreement = useApiMutation({
    method: "POST",
    path: `business-development-management/agreement-update`,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fetch-list-of-agents"] });
      queryClient.invalidateQueries({ queryKey: ["fetch-single-agent"] });
      queryClient.invalidateQueries({
        queryKey: ["fetch-single-agent-details"],
      });
      toast.success("Successfully terminated agreement!");
      setIsOpen(false);
    },
    onError: (error: any) => {
      if (error) showToast("error", error);
    },
  });

  const handleTerminateAgreement = (
    values: z.infer<typeof terminateAgentSchema>
  ) => {
    if (!id) {
      toast.error("Agent ID is missing.");
      return;
    }
    const updatedValues = { ...values };
    terminateAgreement.mutate(updatedValues);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            Awarding Body Agreements{" "}
            {buttonOption === "download" ? "" : "Termination"}
          </DialogTitle>
        </DialogHeader>

        {/* Accordion wraps all awarding bodies */}
        <Accordion type="single" collapsible className="w-full space-y-3">
          {paginatedData?.map((row) => (
            <AccordionItem
              key={row.awardingBodyId}
              value={row.awardingBodyId}
              className="border rounded-md p-3"
            >
              {/* Header row with awarding body + action + arrow */}
              <div className="flex justify-between items-center gap-3">
                <span className="font-medium">{row.awardingBodyName}</span>

                <div className="flex items-center gap-2">
                  {/* Action buttons */}
                  {buttonOption === "download" ? (
                    <div className="flex items-center justify-center gap-3">
                      <StatusWithIcon status={row.status} />
                      <ActionButton
                        disabled={downloadingId === row.commissionTemplateId}
                        handleOpen={() =>
                          downloadAgreementMutation.mutate(
                            row.commissionTemplateId
                          )
                        }
                        loadingContent="Downloading..."
                        isPending={
                          downloadAgreementMutation.isPending &&
                          downloadingId === row.commissionTemplateId
                        }
                        buttonContent="Download"
                        btnSize="sm"
                      />
                    </div>
                  ) : confirmTerminateId === row.awardingBodyId ? (
                    <>
                      <ActionButton
                        btnSize="sm"
                        handleOpen={() => {
                          handleTerminateAgreement(
                            terminateAgentSchema.parse({
                              userId: id,
                              agreementId: row.commissionTemplateId,
                              status: "INACTIVE",
                            })
                          );
                          setConfirmTerminateId(null);
                        }}
                        buttonContent="Yes"
                        variant="destructive"
                        loadingContent="Terminating..."
                        isPending={terminateAgreement.isPending}
                      />

                      <ActionButton
                        btnSize="sm"
                        buttonContent="No"
                        handleOpen={() => setConfirmTerminateId(null)}
                      />
                    </>
                  ) : row.status === "INACTIVE" ? (
                    <ActionButton
                      variant="outline"
                      btnSize="sm"
                      disabled={true}
                      buttonContent="Inactive"
                    />
                  ) : (
                    <ActionButton
                      variant="destructive"
                      btnSize="sm"
                      disabled={awardingBodyId === row.awardingBodyId}
                      handleOpen={() =>
                        setConfirmTerminateId(row.awardingBodyId)
                      }
                      buttonContent="Terminate"
                    />
                  )}

                  {/* Accordion arrow beside buttons */}
                  <AccordionTrigger className="!p-0 !h-auto">
                    <span className="sr-only">Toggle</span>
                  </AccordionTrigger>
                </div>
              </div>

              {/* Expanded content (details table) */}
              <AccordionContent>
                <Table className="border rounded-md mt-3">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Range</TableHead>
                      <TableHead>1st Year</TableHead>
                      <TableHead>2nd Year</TableHead>
                      <TableHead>3rd Year</TableHead>
                      <TableHead>4th Year</TableHead>
                      <TableHead>Template</TableHead>
                      <TableHead>Current Rate</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    <TableRow>
                      <TableCell>
                        {row.commissionRange?.studentRangeLower} -{" "}
                        {row.commissionRange?.studentRangeUpper}
                      </TableCell>
                      <TableCell>{row.commissionRange?.firstRate}%</TableCell>
                      <TableCell>{row.commissionRange?.secondRate}%</TableCell>
                      <TableCell>{row.commissionRange?.thirdRate}%</TableCell>
                      <TableCell>{row.commissionRange?.fourthRate}%</TableCell>
                      <TableCell>{row.commissionTemplateName}</TableCell>
                      <TableCell>{row.currentCommissionRate ?? "-"}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        {pagination?.totalPages > 0 && (
          <CusPagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={pagination?.totalPages}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AgreementModal;
