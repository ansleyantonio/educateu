import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/custom_ui/sheet";

interface AuditLogFilterProps {
  isFilterOpen: boolean;
  setIsFilterOpen: (isFilterOpen: boolean) => void;
}

export function RolemanagementFilter({
  isFilterOpen,
  setIsFilterOpen,
}: AuditLogFilterProps) {
  return (
    <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
      <SheetContent className="overflow-y-auto max-h-screen">
        <div className="pb-20 h-full">
          <SheetHeader>
            <SheetTitle>Filter Applicants</SheetTitle>
          </SheetHeader>
          <div className="h-10"></div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
