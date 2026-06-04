"use client";

import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import { ScrollArea } from "@/components/ui/custom_ui/scroll-area";
import { useState } from "react";
import CreateNewAgentForm from "./_assets/components/pageComponents/CreateNewAgentForm";

const CreateNewAgent = () => {
  const [open, setOpen] = useState(false);

  return (
    <PageWithBreadcrumb
      items={[
        { title: "Home", href: "/admin" },
        // {
        //   title: "Business-Development",
        //   href: "/admin/business-development-management/create-new-agent",
        // },
        {
          title: "Agent",
          href: "/admin/business-development-management/agent",
        },
        {
          title: "Create New Agent",
        },
      ]}
    >
      <ScrollArea className="w-full h-[calc(100vh-80px)] pr-2 pb-20">
        <div className="xl:pr-7">
          <div className="w-full flex justify-between items-center py-4 bg-[#FFFFFF]">
            <h1 className="text-lg font-bold leading-5 tracking-wide text-[#192128]">
              Create New Agent
            </h1>
            {/* <button className="text-[#FFFFFF] bg-[#013E5B] rounded-md px-4 py-2 flex items-center gap-x-2">
              send Enrolment Link
              <Loader2 className="animate-spin w-4 h-4 mr-2" />
            </button> */}
          </div>

          <CreateNewAgentForm setOpen={setOpen} />
        </div>
      </ScrollArea>
    </PageWithBreadcrumb>
  );
};

export default CreateNewAgent;
