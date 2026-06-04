"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Indicator from "./_assets/components/page_component/buttons/indicators";
import { WellBeingFilter } from "./_assets/components/page_component/wellbeing_filter/wellbeing_filter";
import { DataTableToolbar } from "./_assets/components/page_component/wellbeing_table/data-table-toolbar";
import { WellBeingTable } from "./_assets/components/page_component/wellbeing_table/wellbeing_table";
import sandClock from "/public/assets/icons/sandClock.svg";
import tick from "/public/assets/icons/tick.svg";

interface FormValues {
  awardingBodyId: string;
  courseId: string;
  sessionId: string;
  agentId: string;
  subAgentId: string;
  nationality: string;
  applicationStatus: string;
  dateFrom: string;
  dateTo: string;
}

const WellbeingOfficer = () => {
  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);
  const [limit, setLimit] = useState("10");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  // eslint-disable @typescript-eslint/no-explicit-any
  const [filters, setFilters] = useState<Record<string, unknown>>({
    //    wellbeingCheckStatus: "PENDING",
    //applicationStatus: "PENDING",
  });

  const form = useForm<FormValues>({
    defaultValues: {
      awardingBodyId: "",
      courseId: "",
      sessionId: "",
      agentId: "",
      subAgentId: "",
      nationality: "",
      applicationStatus: "",
      dateFrom: "",
      dateTo: "",
    },
  });

  const { data, isLoading } = useFetchData({
    method: "POST",
    path: `wellbeing`,
    queryKey: "list-of-well-being-applications-data",
    filterData: {
      ...filters,
      searchTerm,
      page: currentPage,
      pageSize: limit,
    },
  });

  const CardData = [
    {
      title: "First Time File Check Pending",
      icon: sandClock,
      color: "#272E35",
      bgColor: "#F9DBAF",
      NApplication: 125,
      status: "#1 Pending",
    },
    {
      title: "Second Time File Check Pending",
      icon: tick,
      color: "#272E35",
      bgColor: "#B9E6FE",
      NApplication: 55,
      status: "#1 Checked",
    },
    {
      title: "Third Time File Check Pending",
      icon: sandClock,
      color: "#272E35",
      bgColor: "#F9DBAF",
      NApplication: 120,
      status: "#2 Pending",
    },
    {
      title: "Fourth Time File Check Pending",
      icon: tick,
      color: "#272E35",
      bgColor: "#B9E6FE",
      NApplication: 99,
      status: "#2 Checked",
    },
  ];

  return (
    <PageWithBreadcrumb
      items={[
        { title: "Home", href: "/" },
        {
          title: "Wellbeing",
          href: "/admin/admissions/wellbeing",
        },
      ]}
    >
      <div className="py-2">
        {/* <h1 className="text-2xl font-bold text-[#151D48]">Title Will be here</h1>
      <p className="font-normal text-[16px] leading-[20px] tracking-[0] text-[#555F6D]">
        Subtitle will be here write subtitle.
      </p> */}
        <section className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6 ">
            {isLoading
              ? CardData?.map((item, index) => (
                  <Card
                    key={index}
                    className="overflow-hidden p-3 w-full rounded-xl border shadow animate-pulse sm:p-4 bg-card text-[#666666] md:h-[160px]"
                  >
                    <div className="flex flex-col gap-2 h-full md:gap-3">
                      {/* Avatar + Status */}
                      <div className="grid grid-cols-12 items-center">
                        <div className="col-span-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-full border border-[#CFD6DD]" />
                        </div>
                        <div className="col-span-8">
                          <div className="w-20 h-4 bg-gray-200 rounded" />
                        </div>
                      </div>

                      {/* Subtitle line */}
                      <div className="w-3/4 h-3 bg-gray-200 rounded" />

                      {/* Title line */}
                      <div className="w-1/2 h-5 bg-gray-200 rounded" />
                    </div>
                  </Card>
                ))
              : CardData?.map((item, index) => (
                  <Card
                    key={index}
                    className="overflow-hidden p-3 w-full rounded-xl border shadow sm:p-4 bg-card text-[#666666] md:h-[160px]"
                  >
                    <div className="flex flex-col gap-2 h-full md:gap-3">
                      <div className="grid grid-cols-12 items-center">
                        <div className="col-span-4">
                          <Image
                            src={item?.icon}
                            className="p-2 w-10 h-10 rounded-full border sm:p-3 sm:w-12 sm:h-12 border-[#CFD6DD]"
                            width={100}
                            height={100}
                            alt="sand clock"
                          />
                        </div>
                        <div className="col-span-8">
                          <Indicator
                            text={item?.status}
                            color={item?.color}
                            background={item?.bgColor}
                          />
                        </div>
                      </div>
                      <p className="text-xs font-normal tracking-normal leading-5 sm:text-sm sm:leading-5 text-[#555F6D]">
                        {item?.title}
                      </p>
                      <h1 className="text-xl font-bold sm:text-2xl text-[#151D48]">
                        {item?.NApplication || 0}
                      </h1>
                    </div>
                  </Card>
                ))}

            {/*
            <FirstTimeFileCheckCardPending />
            <FirstTimeFileCheckedCard />
            <SecondTimeFileCheckCardPending />
            <SecondTimeFileCheckedCard /> */}
          </div>

          <Card>
            <DataTableToolbar
              dataLength={data?.pagination?.total || 0}
              setLimit={setLimit}
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filters={filters}
              setFilters={setFilters}
              form={form}
              setCurrentPage={setCurrentPage}
            />

            <WellBeingTable
              setCurrentPage={setCurrentPage}
              applications={data}
              isLoading={isLoading}
              currentPage={currentPage}
            />
          </Card>
          <WellBeingFilter
            form={form}
            setFilter={setFilters}
            isFilterOpen={isFilterOpen}
            setIsFilterOpen={setIsFilterOpen}
          />
        </section>
      </div>
    </PageWithBreadcrumb>
  );
};

export default WellbeingOfficer;
