// import { ScrollArea } from "@/components/ui/custom_ui/scroll-area";

// export default function AdminAdmissionLayout({
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

export default function AdminAdmissionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="">
      {/* Page Content */}
      <div className="pr-2 w-full">{children}</div>
    </section>
  );
}
