import { ScrollArea } from "@/components/ui/custom_ui/scroll-area";

export default function ApplicationUpdatePageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <section className="">
    //   <div className="flex">
    //     <div className="min-w-[230px]">
    //       <AgentSubSidebarMenu />
    //     </div>
    //     <div className="sticky top-0 z-10 bg-white flex-1 w-full">
    //       <AgentManagementHeader />
    //       <hr />
    //       {children}
    //     </div>
    //   </div>
    // </section>
    <div className="mr-2">
      <ScrollArea className="overflow-y-hidden h-[calc(100vh-140px)]">
        {children}
      </ScrollArea>
    </div>
  );
}
