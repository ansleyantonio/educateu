/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import { CustomField } from "@/components/common/fields/cusInputField";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { Button } from "@/components/ui/custom_ui/button";
import { useAuths } from "@/hooks/userContext";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
// import { ApplicationFilter } from "./_assets/components/page_components/application_filter";
import { ApplicationManagementFilter } from "./_assets/components/page_components/application_management_filter";
import ListOfApplication from "./_assets/components/page_components/list_of_application";
import { fetchAllListOfApplications } from "./_assets/query_controller/list_of_application";

export type FilterFormValues = {
  applicationStatus: string;
  applicationStage: string;
  subAgent: string;
  intakePeriod: string;
  awardingBody: string;
  emailStatus: string;
  interviewStatus: string;
  interviewOutcome: string;
  offerResponse: string;
};

const Application = () => {
  // application filter
  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);
  const [searchTerm, setSearchText] = useState("");
  // const [filterData, setFilterData] = useState<IFilterAdvanceModuleForm>({});
  const [limit, setLimit] = useState("10");

  // const [filterLists, setFilterLists] = useState([]);
  const [filterLists, setFilterLists] = useState<FilterFormValues | null>(null);
  const router = useRouter(); // Initialize useRouter
  const [applicationLoading, setApplicationLoading] = useState(false);

  const auth = useAuths();
  const token = auth?.user?.token;
  const role = auth?.permission?.roleName;
  const activityStatus = auth?.user?.activityStatus;
  const applicationCreateStatus = auth?.user?.applicationCreateStatus;

  const { data, isLoading } = useQuery({
    queryKey: [
      "fetch-list-of-applications",
      { page: currentPage, filterLists, search: searchTerm, token, limit },
    ],
    queryFn: fetchAllListOfApplications,
  });

  // Handle creation of a new application and redirection

  // create new application mutation
  const createApplicationMutation = useApiMutation({
    path: `application-management`,
    method: "POST",
    onSuccess: (data) => {
      setApplicationLoading(true);
      const newApplicationId =
        data?.data?.["application"].id || data?.data.application.id;

      // console.log("button newApplicationId -------------", newApplicationId);
      if (newApplicationId) {
        router.push(`/agent/application-management/create/${newApplicationId}`); // Redirect to the new application page
      } else {
        console.error("Application created but ID is missing.");
      }
    },
    onError: (error) => {
      setApplicationLoading(false);
      showToast("error", error || "Failed to create application");
    },
  });

  const disabled = role === "agent" && activityStatus != "ACTIVE";

  const applications = data?.data?.applications || [];

  // const filterableValues = {
  //   status: [...new Set(applications.map((app: any) => app.status))],
  //   stage: [...new Set(applications.map((app: any) => app.stage))],
  //   intake: [
  //     ...new Set(
  //       applications
  //         .map((app: any) => app.courseSelection?.intake)
  //         .filter(Boolean)
  //     ),
  //   ],
  // };

  return (
    <PageWithBreadcrumb
      items={[
        { title: "Home", href: "/agent/course-management/" },
        { title: "Application Management" },
      ]}
    >
      <div>
        {/* <div className="sticky top-0 z-10 bg-white">
        <AgentManagementHeader />
        <hr />
      </div> */}
        <ApplicationManagementFilter onFilterChange={setFilterLists} />
        <div className="bg-[#F8F8F8]">
          <div className="flex flex-col justify-center items-center mx-auto space-y-4 sm:p-4 md:flex md:flex-row md:justify-between md:items-center md:space-y-0 bg-[#F8F8F8]">
            <div className="flex gap-2 justify-start items-center">
              <h1 className="text-sm font-semibold tracking-wide leading-5 text-[#192128]">
                List of Applicants
              </h1>{" "}
              <span className="flex gap-x-2 items-center py-1 px-2 rounded-full text-[#013E5B] bg-[#F0F9FF]">
                {data?.pagination?.total} Applicants
              </span>
            </div>
            <div className="gap-4 space-y-2 text-sm font-semibold tracking-wide leading-6 lg:flex lg:space-y-0">
              <div className="flex gap-4">
                <CustomField.CommonSearch
                  searchText={searchTerm}
                  setSearchText={setSearchText}
                />
                <CustomField.LimitField
                  totalItems={data?.pagination?.total}
                  setLimit={setLimit}
                  setCurrentPage={setCurrentPage}
                />
                {/* <ApplicationFilter setFilterLists={setFilterLists} filterableValues={filterableValues}/> */}
              </div>
              <div>
                <Button
                  size="lg"
                  onClick={() => createApplicationMutation.mutate({})}
                  variant="primary"
                  disabled={
                    createApplicationMutation.isPending ||
                    applicationLoading ||
                    disabled ||
                    applicationCreateStatus === "disable"
                  }
                >
                  <Plus className="w-4 h-4" />
                  Create New Application
                  {createApplicationMutation.isPending ||
                    (applicationLoading && (
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    ))}
                </Button>
              </div>
            </div>
          </div>
          {/* list of application */}
          <ListOfApplication
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            isLoading={isLoading}
            data={data}
          />
        </div>
      </div>
    </PageWithBreadcrumb>
  );
};

export default Application;
