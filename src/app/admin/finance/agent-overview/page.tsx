/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import ProgressInfoCard from "../_assets/components/progressInfoCard";
import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabButton,
} from "@/components/ui/custom_ui/primary_tabs";
import AgentCommissionTable from "./_assets/components/agentCommissionTable";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";

const AgentOverViewPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sessionId, setSessionId] = useState("");

  const { data, isLoading } = useFetchData({
    filterData: {
      page: 1,
      limit: 10,
      searchTerm: searchTerm,
      sessionId
    },
    queryKey: "agent-commission-overview",
    path: "agent-overview",
    method: "GET",
  });

  const [isValue, setIsValue] = useState("1stYear");
  return (
    <PageWithBreadcrumb
      items={[
        { title: "Finance" },
        {
          title: "Agent Overview",
        },
      ]}
    >
      {/* Cards */}
      <div className="grid grid-cols-2 gap-4 mb-10 lg:grid-cols-4">
        {data?.agents?.map((item: any) => (
          <ProgressInfoCard key={item.id} data={item} />
        ))}
      </div>

      <div className="rounded-md border shadow-md border-1 border-[#EAEAEA]">
        <Tabs defaultValue={isValue}>
          <TabsList>
            <TabButton value="1stYear" label="1st Year" onClick={setIsValue} />
            <TabButton value="2ndYear" label="2nd Year" onClick={setIsValue} />
            <TabButton value="3rdYear" label="3rd Year" onClick={setIsValue} />
            <TabButton value="4thYear" label="4th Year" onClick={setIsValue} />
          </TabsList>

          <hr />
          {/* content */}
          <TabsContent value="1stYear">
            <AgentCommissionTable
              year={1}
              data={data}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              isLoading={isLoading}
              sessionId={sessionId}
              setSessionId={setSessionId}
            />
          </TabsContent>
          <TabsContent value="2ndYear">
            <AgentCommissionTable
              year={2}
              data={data}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              isLoading={isLoading}
              sessionId={sessionId}
              setSessionId={setSessionId}
            />
          </TabsContent>
          <TabsContent value="3rdYear">
            <AgentCommissionTable
              year={3}
              data={data}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              isLoading={isLoading}
              sessionId={sessionId}
              setSessionId={setSessionId}
            />
          </TabsContent>
          <TabsContent value="4thYear">
            <AgentCommissionTable
              year={4}
              data={data}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              isLoading={isLoading}
              sessionId={sessionId}
              setSessionId={setSessionId}
            />
          </TabsContent>
        </Tabs>
      </div>
    </PageWithBreadcrumb>
  );
};

export default AgentOverViewPage;
