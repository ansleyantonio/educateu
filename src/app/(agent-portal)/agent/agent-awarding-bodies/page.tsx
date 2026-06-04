/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import DynamicTableWithPagination from "@/components/common/DynamicTable/DynamicTable";
import { CustomField } from "@/components/common/fields/cusInputField";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { useAuths } from "@/hooks/userContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Eye } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { CommissionViewModal } from "./_assets/components/commissionViewModal";
import { TemplateViewModal } from "./_assets/components/templateViewModal";
import ActionButton from "@/components/common/button/actionButton";

type CommissionRange = {
  studentRangeLower: number;
  studentRangeUpper: number;
  firstRate: number;
  secondRate: number;
  thirdRate: number;
  fourthRate: number;
};

type AwardingBodyProps = {
  awardingBodyId: string;
  awardingBodyName: string;
  commissionTemplateId: string;
  commissionTemplateName: string;
  commissionTemplateVersion: number;
  matchId: string;
  currentCommissionRate: string;
  status: string;
  totalApplications: number;
  versionAvailable: boolean;
  commissionRange: CommissionRange;
  bonus?: string;
};

type VersionHistory = {
  version: string;
  timestamp: string;
  agreement: string;
  commissionRates?: CommissionRange[];
};

const AwardingBodyPage = () => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const { user } = useAuths();
  const [searchText, setSearchText] = useState("");
  const token = user?.token;
  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [awardingBodyInfo, setAwardingBodyInfo] = useState<AwardingBodyProps[]>(
    []
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [limit, setLimit] = useState("10");
  const queryClient = useQueryClient();

  // Modal states
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);
  const [selectedBody, setSelectedBody] = useState<AwardingBodyProps | null>(
    null
  );

  const { data, isLoading } = useFetchData({
    queryKey: "awardingBody-lists-of-agents",
    path: `agent/awarding-body-templates/${user?.userId}`,
    method: "GET",
    filterData: {
      page: currentPage,
      searchTerm: searchText,
      pageSize: limit,
      ...filters,
    },
  });

  // Fetch version history when modal opens
  const { data: versionHistory, isLoading: isLoadingVersions } = useFetchData({
    path: `agent/agent/agreement/history/${selectedBody?.matchId}`,
    queryKey: `fetch-template-version-history-${selectedBody?.matchId}`,
    method: "GET",
    enabled: !!selectedBody?.matchId || !!isAgreementModalOpen,
  });

  const downloadMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/business-development-management/agent/agreement/${id}/pdf`,
        {
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
  });

  const acceptAgreement = useApiMutation({
    method: "POST",
    path: "agent/update-version",
    onSuccess: (data) => {
      showToast("success", data);

      // Invalidate and refetch version history
      queryClient.invalidateQueries({
        queryKey: [`fetch-template-version-history-${selectedBody?.matchId}`],
      });

      // Invalidate and refetch main list to update currentAgreement
      queryClient.invalidateQueries({
        queryKey: ["awardingBody-lists-of-agents"],
      });

      // Update the selected body with new version
      if (selectedBody && versionHistory?.data) {
        const latestVersion = Math.max(
          ...versionHistory.data.map((v: any) => v.versions)
        );
        setSelectedBody({
          ...selectedBody,
          commissionTemplateVersion: latestVersion,
        });
      }
    },
    onError: (error) => {
      showToast("error", error);
    },
  });

  const handleAcceptAgreement = async () => {
    acceptAgreement.mutate({
      userId: user?.userId,
      matchId: selectedBody?.matchId,
    });
  };

  const handleDownload = async (id: string) => {
    setDownloadingId(id);
    return new Promise<void>((resolve, reject) => {
      downloadMutation.mutate(id, {
        onSuccess: (data) => {
          toast.success("Agreement fetched successfully!");
          const blob = new Blob([data], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.target = "_blank";
          link.download = "Agreement.pdf";
          link.click();
          resolve();
          setDownloadingId(null);
        },
        onError: (error) => {
          console.error(error);
          toast.error("Failed to fetch agreement");
          reject(error);
          setDownloadingId(null);
        },
      });
    });
  };

  const handleViewCommission = (body: AwardingBodyProps) => {
    setSelectedBody(body);
    setIsCommissionModalOpen(true);
  };

  const handleViewAgreement = (body: AwardingBodyProps) => {
    setSelectedBody(body);
    setIsAgreementModalOpen(true);
  };

  const handleReview = async (versionId: string) => {
    if (versionId) {
      await handleDownload(versionId);
      setIsAgreementModalOpen(false);
    }
  };

  const handleCloseAgreementModal = () => {
    setIsAgreementModalOpen(false);
    setTimeout(() => setSelectedBody(null), 300);
  };

  const handleCloseCommissionModal = () => {
    setIsCommissionModalOpen(false);
    setTimeout(() => setSelectedBody(null), 300);
  };

  console.log(selectedBody, "Selected....");

  return (
    <PageWithBreadcrumb
      items={[{ title: "Home", href: "/agent" }, { title: "Awarding Body" }]}
    >
      {/* search plus filter */}
      <div className=" gap-x-2 justify-between items-center mx-auto space-y-2 w-full 2xl:flex pt-3 px-5">
        <div className="flex gap-2 justify-start items-center basis-1/4">
          <h1 className="text-lg font-bold tracking-wide leading-5 text-[#192128]">
            Awarding Body
          </h1>
        </div>
        <div className=" lg:flex items-center gap-x-2  justify-end">
          <div className="flex gap-x-2 my-3 lg:my-0">
            <CustomField.CommonSearch
              searchText={searchText}
              setSearchText={setSearchText}
            />
            <CustomField.LimitField setLimit={setLimit} />
          </div>
        </div>
      </div>
      <div className="mt-4">
        <DynamicTableWithPagination
          isCheckBox={false}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          setSelectObject={setAwardingBodyInfo}
          data={data?.data}
          isLoading={isLoading}
          pagination={data?.pagination}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          config={{
            columns: [
              {
                key: "awardingBodyName",
                header: "Awarding Body",
                render: (body: AwardingBodyProps) => (
                  <div className="font-medium text-gray-900">
                    {body.awardingBodyName}
                  </div>
                ),
              },
              {
                key: "commissionRate",
                header: "Commission Rate",
                render: (body: AwardingBodyProps) => (
                  <div className="space-y-1">
                    <div className="grid grid-cols-5 gap-2 text-xs text-gray-500">
                      <div className="text-center">
                        <div className="font-medium">Tier</div>
                        <div>
                          {body.commissionRange?.studentRangeLower}-
                          {body.commissionRange?.studentRangeUpper}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">1st Year</div>
                        <div>{body.commissionRange?.firstRate}%</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">2nd Year</div>
                        <div>{body.commissionRange?.secondRate}%</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">3rd Year</div>
                        <div>{body.commissionRange?.thirdRate}%</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">4th Year</div>
                        <div>{body.commissionRange?.fourthRate}%</div>
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                key: "bonus",
                header: "Bonus",
                render: (body: AwardingBodyProps) => (
                  <div className="text-gray-500 max-w-xs">
                    {body.bonus || "-"}
                  </div>
                ),
              },
              {
                key: "viewAgreement",
                header: "View Agreement",
                render: (body: AwardingBodyProps) => (
                  <ActionButton
                    handleOpen={() => handleViewAgreement(body)}
                    btnStyle="inline-flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900 border-none bg-transparent p-0 shadow-none hover:bg-transparent"
                    buttonContent="View"
                    variant="icon"
                    icon={<Eye className="w-4 h-4" />}
                  />
                ),
              },
              {
                key: "viewCommission",
                header: "View Commission",
                render: (body: AwardingBodyProps) => (
                  <ActionButton
                    handleOpen={() => handleViewCommission(body)}
                    btnStyle="inline-flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900 border-none bg-transparent p-0 shadow-none hover:bg-transparent"
                    buttonContent="View"
                    variant="icon"
                    icon={<Eye className="w-4 h-4" />}
                  />
                ),
              },
            ],
          }}
        />
      </div>

      {/* Commission Rate Modal */}
      <CommissionViewModal
        isOpen={isCommissionModalOpen}
        onClose={handleCloseCommissionModal}
        commissionGroup={selectedBody}
      />

      {/* Agreement Version History Modal */}
      <TemplateViewModal
        versionHistory={versionHistory?.data}
        isOpen={isAgreementModalOpen}
        isLoading={isLoadingVersions}
        onClose={handleCloseAgreementModal}
        templateName={selectedBody?.commissionTemplateName ?? ""}
        handleDownload={handleDownload}
        handleAcceptAgreement={handleAcceptAgreement}
        currentAgreement={selectedBody?.commissionTemplateVersion}
        matchId={selectedBody?.matchId}
        isPending={acceptAgreement?.isPending}
      />
    </PageWithBreadcrumb>
  );
};

export default AwardingBodyPage;
