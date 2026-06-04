import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  position?: "start" | "end" | "between" | "center";
  onPageChange: (page: number) => void;
}

const CustomPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  position,
}: PaginationProps) => {
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 6) {
      // Show all pages if total pages are 6 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first 3 pages, ellipsis, last 3 pages
      if (currentPage <= 3) {
        for (let i = 1; i <= 3; i++) {
          pages.push(i);
        }
        pages.push("...");
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = 1; i <= 3; i++) {
          pages.push(i);
        }
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={`flex gap-2 w-full items-center justify-${position}`}
    >
      <Button
        disabled={currentPage <= 1}
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="ml-2">Previous</span>
      </Button>

      <div className="flex gap-2 items-center">
        {getPageNumbers().map((page, index) =>
          page === "..." ? (
            <span
              key={index}
              className="flex justify-center items-center w-9 h-9"
            >
              <MoreHorizontal className="w-4 h-4" />
            </span>
          ) : (
            <Button
              key={index}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page as number)}
            >
              {page}
            </Button>
          ),
        )}
      </div>

      <Button
        disabled={currentPage == totalPages}
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
      >
        <span className="mr-2">Next</span>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </nav>
  );
};

export default CustomPagination;
