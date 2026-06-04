import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { House,ChevronRight } from "lucide-react";

interface BreadcrumbMenuProps {
  currentPage?: string;
  currentPageHref?: string;
}

export function BreadcrumbMenu({ currentPage, currentPageHref }: BreadcrumbMenuProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard/development">
            <House />
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <ChevronRight />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbLink href="/admin/business-development-management">
            Business Development
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <ChevronRight />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbLink href="/admin/business-development-management">Agents</BreadcrumbLink>
        </BreadcrumbItem>
        {
          currentPage && <BreadcrumbSeparator>
          <ChevronRight />
        </BreadcrumbSeparator> 
        }
        <BreadcrumbItem>
          <BreadcrumbLink href={currentPageHref}>{currentPage}</BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
