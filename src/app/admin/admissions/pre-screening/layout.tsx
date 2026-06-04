// import { ScrollArea } from "@/components/ui/custom_ui/scroll-area";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Metadata } from "next";

// export default function PreScreeningLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <section className="overflow-hidden mx-auto">
//       <ScrollArea className="overflow-y-hidden h-[calc(100vh-60px)]">
//         {/* Page Content */}
//         <div className="pr-2 w-full">{children}</div>
//       </ScrollArea>
//     </section>
//   );
// }

export const metadata: Metadata = {
  title: "Pre-Screening",
  description: "Finance Management",
};

export default function PreScreeningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ScrollArea className="overflow-y-hidden h-[calc(100vh-150px)]">
      {/* Page Content */}
      <div className="">{children}</div>
    </ScrollArea>
  );
}
