import { ScrollArea } from "@/components/ui/scroll-area";

export default function AuditLogging({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <AdminProtectedAgentRoute>
    <>
      <ScrollArea className="overflow-y-hidden h-[calc(100vh-140px)]">
        {children}
      </ScrollArea>
    </>
  );
}
