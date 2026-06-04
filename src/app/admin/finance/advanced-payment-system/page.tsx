"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import CommonSearch from "@/components/common/search/commonSearch";
import { CustomField } from "@/components/common/fields/cusInputField";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { SectionHeader } from "@/components/SectionHeader/SectionHeader";
import ProgressInfoCard from "../_assets/components/progressInfoCard";
import ApplicantPaymentTable from "./_assets/components/applicantPaymentTable";
import { SendDiscountEmailModal } from "./_assets/components/modals/sendDiscountEmailModal";
import { SendPaymentReminderEmail } from "./_assets/components/modals/sendPaymentReminderEmail";
import { SendRollbacDiscountEmailModal } from "./_assets/components/modals/sendRollbackDiscountEmailModal";
import { SendEmailModalRichText } from "@/components/EmailModals/SendEmailModal";
import { HiOutlineFilter } from "react-icons/hi";
import { AdvancedPaymentSystemFilter } from "./_assets/components/filter/advanced_payment_system_filter";

export interface Applicant {
  id: number;
  applicantId: string;
  firstName: string;
  email: string;
  course: string;
  paymentPlan: string;
  paymentStatus: string;
  dueDate: string;
  lastReminder: string;
  totalFee: number;
  paidAmount: number;
  installmentsPaid: number;
  nextPayment: {
    date: string;
    amount: number;
  };
  paymentHistory: string[];
}

interface FormValues {
  admissionOfficerId: string;
  agentId: string;
  subAgentId: string;
  awardingBodyId: string;
  courseId: string;
  moduleId: string;
  paymentStatus: string;
  dueDate: string;
  lastReminderSent: string;
  discountStatus: string;
  financeDeclaration: string;
  sessionId: string;
}

const AdvancePaymentSystemPage = () => {
  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);
  const [searchTerm, setSearchText] = useState("");
  const [limit, setLimit] = useState("10");
  const [selectedCount, setSelectedCount] = useState(0);
  const [selectedApplicants, setSelectedApplicants] = useState<Applicant[]>([]);
  const [openEmailModal, setOpenEmailModal] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  // console.log("FILTERS", filters)

  const form = useForm<FormValues>({
    defaultValues: {
      admissionOfficerId: "",
      agentId: "",
      subAgentId: "",
      awardingBodyId: "",
      courseId: "",
      moduleId: "",
      paymentStatus: "",
      dueDate: "",
      lastReminderSent: "",
      discountStatus: "",
      financeDeclaration: "",
      sessionId: "",
    },
  });

  const handleSelectionChange = (count: number, applicants: Applicant[]) => {
    setSelectedCount(count);
    setSelectedApplicants(applicants);
  };

  const { data, isLoading } = useFetchData({
    queryKey: "advance-payment-system",
    path: "payments/applicant-payments",
    method: "GET",
    filterData: {
      page: currentPage,
      searchTerm: searchTerm,
      limit,
    },
  });

  // console.log("info", data?.data?.pagination?.totalItems);

  return (
    <PageWithBreadcrumb
      items={[
        { title: "Finance" },
        {
          title: "Advance Payment System",
        },
      ]}
    >
      {/* Cards */}
      <div className="grid grid-cols-2 gap-4 mb-10 lg:grid-cols-3">
        {demoData.map((item) => (
          <ProgressInfoCard key={item.id} data={item} />
        ))}
      </div>

      {/* Applicant list Table */}
      <div className="rounded-md border shadow-md border-1 border-[#EAEAEA]">
        <div className="flex justify-between items-center p-3">
          <div className="flex gap-2 items-center">
            <SectionHeader
              title="Applicant Payment List"
              total={data?.data?.pagination?.totalItems || 0}
              label="Applicant"
              labels="Applicants"
            />
          </div>

          <div className="flex gap-2 space-y-2 md:space-y-0">
            {/* {
              selectedApplicants.length > 1 && <SendDiscountEmailModal emails={[]} />
            } */}
            {selectedApplicants.length > 1 && (
              <>
                <SendDiscountEmailModal
                  emails={selectedApplicants.map(
                    (applicant) => applicant.email
                  )}
                />
                <button
                  onClick={() => setOpenEmailModal(true)}
                  className="inline-flex gap-2 items-center py-1.5 px-3 text-sm rounded-md border border-gray-300 transition hover:bg-gray-100 text-[#272E35]"
                >
                  Send Email
                </button>
                <SendPaymentReminderEmail
                  emails={selectedApplicants.map(
                    (applicant) => applicant.email
                  )}
                />
                <SendRollbacDiscountEmailModal
                  emails={selectedApplicants.map(
                    (applicant) => applicant.email
                  )}
                />
              </>
            )}
            <CustomField.LimitField
              totalItems={data?.data?.pagination?.totalItems}
              setLimit={setLimit}
              setCurrentPage={setCurrentPage}
            />
            <CommonSearch
              searchText={searchTerm}
              setSearchText={setSearchText}
            />
            <Button
              onClick={() => setIsFilterOpen(true)}
              variant="outline"
              size="sm"
              className="ml-auto h-10 text-sm font-semibold text-[#555F6D]"
            >
              <HiOutlineFilter size={28} color="#555F6D" />
              Filter
            </Button>
          </div>
        </div>

        {openEmailModal && (
          <SendEmailModalRichText
            email_to={selectedApplicants.map((applicant) => applicant.email)}
            open={openEmailModal}
            onClose={() => setOpenEmailModal(false)}
            viewOnly={true}
          />
        )}

        <ApplicantPaymentTable
          data={data}
          isLoading={isLoading}
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
          totalPages={data?.data?.pagination?.totalPages}
          onSelectionChange={handleSelectionChange}
        />
      </div>
      <AdvancedPaymentSystemFilter
        form={form}
        setFilter={setFilters}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
      />
    </PageWithBreadcrumb>
  );
};

export default AdvancePaymentSystemPage;

const demoData = [
  {
    id: 1,
    title: "Advance Payment System",
    amount: "250436789021345678902346890",
    progress: "84%",
    tag: "Paid",
  },
  {
    id: 2,
    title: "Advance Payment System",
    amount: "25044",
    progress: "84%",
    tag: "Installment",
  },
  {
    id: 3,
    title: "Advance Payment System",
    amount: "250",
    progress: "84%",
    tag: "Overdue",
  },
];
