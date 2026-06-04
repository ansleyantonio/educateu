import AgentProtectedAgentRoute from "./agent_protected";
import CusAgentLayout from "./customLayout";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent Management",
  description: "Agent Management",
};
export default function AgentPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AgentProtectedAgentRoute>
      <section className="max-h-screen w-full">
        <CusAgentLayout>{children}</CusAgentLayout>
      </section>
    </AgentProtectedAgentRoute>
  );
}

// collapsed
// "use client";

// import {
//   SidebarInset,
//   SidebarProvider,
//   SidebarTrigger,
// } from "@/components/ui/sidebar";
// import AgentManagementHeader from "./agent/_assets/components/root_layout/header/header";
// import { AgentSidebarMenu } from "./agent/_assets/components/root_layout/side_bar_menu/sidebar_menu";
// import AgentProtectedAgentRoute from "./agent_protected";

// export default function Layout({ children }: { children: React.ReactNode }) {
//   return (
//     <AgentProtectedAgentRoute>
//       <SidebarProvider>
//         <div className="bg-black h-screen">
//           <AgentSidebarMenu />
//         </div>
//         <SidebarInset>
//           <div className=" sticky w-full top-0 z-10 bg-white">
//             <div className="flex justify-start gap-2 items-center ">
//               <div className="md:hidden w-5 md:w-0">
//                 <SidebarTrigger className="" />
//               </div>
//               <div className="flex-1 md:w-full">
//                 <AgentManagementHeader />
//               </div>
//             </div>
//             <hr />
//           </div>

//           <div className="w-full">{children}</div>
//         </SidebarInset>
//       </SidebarProvider>
//     </AgentProtectedAgentRoute>
//   );
// }
