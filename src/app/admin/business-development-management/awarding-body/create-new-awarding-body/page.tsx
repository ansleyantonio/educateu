"use client";

import { ScrollArea } from "@/components/ui/custom_ui/scroll-area";
import { useState } from "react";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import CreateNewAwardingBodyForm from "./_assets/CreateNewAwardinBodyForm";

const CreateNewAwardingBodyPage = () => {
  const [open, setOpen] = useState(false);

  return (
    <PageWithBreadcrumb
      items={[
        { title: "Home", href: "/admin" },
        // {
        //   title: "Business Development Management",
        //   href: "/admin/business-development-management/create-new-awarding-body",
        // },
        {
          title: "Awarding Body",
          href: "/admin/business-development-management/create-new-awarding-body",
        },
        {
          title: "Create New Awarding Body",
        },
      ]}
    >
      <ScrollArea className="w-full h-[calc(100vh-80px)] pr-2 pb-20">
        <div className="bg-[#FFFFFF]">
          <div className="w-full flex justify-between items-center py-4 bg-[#FFFFFF]">
            <h1 className="text-lg font-bold leading-5 tracking-wide text-[#192128] p-[15px]">
              Create New Awarding Body
            </h1>
            {/* <button className="text-[#FFFFFF] bg-[#013E5B] rounded-md px-4 py-2 flex items-center gap-x-2">
              send Enrolment Link
              <Loader2 className="animate-spin w-4 h-4 mr-2" />
            </button> */}
          </div>

          <CreateNewAwardingBodyForm setOpen={setOpen} />
        </div>
      </ScrollArea>
    </PageWithBreadcrumb>
  );
};

export default CreateNewAwardingBodyPage;
