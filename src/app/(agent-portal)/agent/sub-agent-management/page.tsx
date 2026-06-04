"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { CustomField } from "@/components/common/fields/cusInputField";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { CreateSubAgent } from "./_assets/component/pageComponents/create_sub_agent";
import { Sub_agent_list } from "./_assets/component/pageComponents/Sub_agent_list";

const AgentProfile = () => {
  const [searchText, setSearchText] = useState("");

  const searchParams = useSearchParams();
  const activePage = Number(searchParams.get("page")) || 1;
  const [currentPage, setCurrentPage] = useState(activePage);
  const [limit, setLimit] = useState("10");

  const { data, isLoading } = useFetchData({
    queryKey: "fetch-All-sub-agents",
    path: `sub-agent-management`,
    method: "GET",
    filterData: {
      page: currentPage,
      name: searchText,
    },
  });

  // fetch all subAgents data using tanstack query
  // const { data, isLoading } = useQuery({
  //   queryKey: [
  //     "fetch-All-sub-agents",
  //     { page: currentPage, searchText, token },
  //   ],
  //   queryFn: fetchAllSubAgents,
  // });

  console.log("sub agent list", data);
  return (
    <ScrollArea className=" overflow-y-auto h-[calc(100vh-100px)]">
      {/* <div className="sticky top-0 z-10 bg-white">
        <AgentManagementHeader />
        <hr />
      </div> */}
      <div className="mt-6 mr-6 rounded-md border border-1 border-[#EAEDF0]">
        <div className="space-y-4 lg:space-y-0 lg:flex justify-center lg:justify-between items-center py-4 px-6">
          <div className="flex gap-2 justify-start items-center">
            <h1 className="text-base font-bold leading-6 text-[#000000]">
              Sub Agents List
            </h1>
            <button className="flex gap-x-2 items-center py-1 px-2 rounded-full text-[#013E5B] bg-[#F0F9FF]">
              {data?.data?.users?.length || 0} Agents
            </button>
          </div>

          <div className="flex gap-x-3 justify-start">
            {/* <div className="flex gap-x-2 justify-start items-center py-2 px-4 rounded-lg border bg-[#FFFFFF] w-[300px] border-1 border-[#CFD6DD]"> */}
            <CustomField.CommonSearch
              searchText={searchText}
              setSearchText={setSearchText}
            />
            <CustomField.LimitField
              totalItems={data?.pagination?.total}
              setLimit={setLimit}
              setCurrentPage={setCurrentPage}
            />
            {/* </div> */}
            <CreateSubAgent />
          </div>
        </div>
        <hr />
        {/* sub agent lit */}
        <div>
          <Sub_agent_list
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            data={data?.data}
            isLoading={isLoading}
          />
        </div>
      </div>
    </ScrollArea>
  );
};

export default AgentProfile;
