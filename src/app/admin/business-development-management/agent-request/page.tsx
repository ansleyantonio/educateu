"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import AgentRequestTable from "./_assets/component/agent_request_table";

const AgentRequest = () => {
  // const [agentType, setAgentType] = useState("");

  const { data, isLoading } = useFetchData({
    queryKey: "agents-request",
    path: `business-development-management/pending/agents`,
    method: "GET",
    filterData: {},
  });

  // const { data, isLoading } = useQuery({
  //   queryKey: ["agents-request", { token }],
  //   queryFn: fetchAgentRequests,
  //   // enabled: !!agentType,
  // });
  console.log("Agent Requests", data);

  return (
    <PageWithBreadcrumb
      items={[
        { title: "Home", href: "/admin" },
        // {
        //   title: "Business Development Management",
        //   href: "/admin/business-development-management/agent-request",
        // },
        { title: "Agent Requests" },
      ]}
    >
      {/* <div className="py-4 px-2">
        <BreadcrumbMenu currentPage="Agent Requests" currentPageHref={`/admin/business-development-management/agent-request`}/>
      </div> */}
      <div className="flex justify-between items-center py-4">
        <h1 className="text-lg font-bold tracking-wide leading-5 text-[#192128]">
          Review Agent Request
        </h1>
        {/* <div> */}
        {/*   <Select> */}
        {/*     <SelectTrigger className=""> */}
        {/*       <SelectValue placeholder="Agent Type" /> */}
        {/*     </SelectTrigger> */}
        {/*     <SelectContent> */}
        {/*       <SelectGroup> */}
        {/*         <SelectLabel>Agent Type</SelectLabel> */}
        {/*         <SelectItem value="apple">Apple</SelectItem> */}
        {/*         <SelectItem value="banana">Banana</SelectItem> */}
        {/*       </SelectGroup> */}
        {/*     </SelectContent> */}
        {/*   </Select> */}
        {/* </div> */}
      </div>

      <div className="pt-4">
        <AgentRequestTable data={data?.data} isLoading={isLoading} />
      </div>
    </PageWithBreadcrumb>
  );
};

export default AgentRequest;
