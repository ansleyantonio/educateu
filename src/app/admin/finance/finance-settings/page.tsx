/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import { CustomField } from "@/components/common/fields/cusInputField";
import CommonSearch from "@/components/common/search/commonSearch";
import { Button } from "@/components/ui/custom_ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { HiOutlineFilter } from "react-icons/hi";
import DiscountFeeList from "./_assets/components/DiscountFeeList";
import { FilterDiscountList } from "./_assets/components/filter/discountFilterList";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";

const DiscountSettings = () => {
  const [searchText, setSearchText] = useState("");
  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);
  const [limit, setLimit] = useState("10");
  const router = useRouter();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [discountType, setDiscountType] = useState<string | undefined>();
  const [paymentStatus, setPaymentStatus] = useState<string | undefined>();
  const [isFiltered, setIsFiltered] = useState(false);

  const { data, isLoading, refetch } = useFetchData({
    filterData: { 
      page: currentPage, 
      search: searchText, 
      limit: limit,
      discountType: discountType,
      paymentStatus: paymentStatus,
    },
    queryKey: "fetch-discount-course-fee-list",
    method: "GET",
    path: "finance-settings",
    enabled: !!currentPage || !!searchText || !!limit || !!discountType || !!paymentStatus,
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, discountType, paymentStatus]);

  console.log("Fetched Data:", data);

  // Transform API response to match component structure
  const transformedData = {
    data: {
      discounts: data?.data?.data?.map((item: any) => ({
        id: item.id,
        discountName: item.discountName,
        type: item.discountType === "PERCENTAGE" ? "Percentage" : "Flat",
        value: item.discountValue,
        status: item.paymentStatus === "PENDING" ? "Pending" : item.paymentStatus,
        ...item, // Keep original data for detailed view
      })) || [],
    },
    pagination: {
      total: data?.data?.pagination?.total || 0,
      totalPages: data?.data?.pagination?.totalPages || 1,
      currentPage: data?.data?.pagination?.page || 1,
      pageSize: data?.data?.pagination?.perPage || parseInt(limit),
      count: data?.data?.pagination?.count || 0,
    },
  };

  const handleClearFilters = () => {
    setDiscountType(undefined);
    setPaymentStatus(undefined);
    setSearchText("");
    setIsFiltered(false);
    setCurrentPage(1);
  };

  const handleApplyFilters = (filters: { discountType?: string; paymentStatus?: string }) => {
    setDiscountType(filters.discountType);
    setPaymentStatus(filters.paymentStatus);
    setIsFiltered(true);
    setCurrentPage(1);
  };

  return (
    <PageWithBreadcrumb
      items={[
        { title: "Finance Settings" },
        {
          title: "Discount Fee List",
        },
      ]}
    >
      <div>
        <div className="rounded-md border shadow-md border-1 border-[#EAEDF0]">
          <div className="flex justify-between items-center p-6">
            <h1 className="text-lg leading-6 text-[#000000]">Discount Fee</h1>
            <div className="flex gap-2 space-y-2 md:space-y-0">
              <CommonSearch
                searchText={searchText}
                setSearchText={setSearchText}
              />

              <CustomField.LimitField
                totalItems={transformedData?.pagination?.total}
                setLimit={setLimit}
                setCurrentPage={setCurrentPage}
              />
              <Link href="/admin/finance/finance-settings/create">
                <Button variant="primary">
                  <PlusIcon className="w-5 h-5" color="#fff" />
                  Create Discount Fee
                </Button>
              </Link>

              <Button
                onClick={() => setIsOpenModal(true)}
                variant="outline"
                size="sm"
                className="p-2 ml-auto h-10 font-semibold text-[#555F6D]"
              >
                <HiOutlineFilter size={25} color="#555F6D" />
                Filter
              </Button>
              <FilterDiscountList
                isOpenModal={isOpenModal}
                setIsOpenModal={setIsOpenModal}
                onApplyFilters={handleApplyFilters}
                onClearFilters={handleClearFilters}
                currentFilters={{
                  discountType,
                  paymentStatus,
                }}
              />
            </div>
          </div>
          <DiscountFeeList
            data={transformedData}
            setCurrentPage={setCurrentPage}
            currentPage={currentPage}
            isLoading={isLoading}
          />
        </div>
      </div>
    </PageWithBreadcrumb>
  );
};

export default DiscountSettings;