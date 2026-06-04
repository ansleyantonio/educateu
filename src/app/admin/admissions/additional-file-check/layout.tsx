// import { ScrollArea } from "@/components/ui/custom_ui/scroll-area";

import { Metadata } from "next";

// export default function AdiminChecksLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <section className="overflow-hidden mx-auto">
//       <ScrollArea className="overflow-y-hidden h-[calc(100vh-120px)]">
//         {/* Page Content */}
//         <div className="pr-2 w-full">{children}</div>
//       </ScrollArea>
//     </section>
//   );
// }

export const metadata: Metadata = {
  title: "Additional File Check",
  description: "Finance Management",
};

export default function AdminChecksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="">
      {/* Page Content */}
      <div className="xl:pr-2 w-full">{children}</div>
    </section>
  );
}
