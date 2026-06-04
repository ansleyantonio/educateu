/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
"use client";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const CusPagination = ({
  totalPages = 1,
  setCurrentPage,
  currentPage,
}: {
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // const currentPage = Number(searchParams.get("page")) || 1;
  const router = useRouter();

  // url set
  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  // Number of page links to display at once
  const pageLinksToShow = 5;

  // Calculate the range of page numbers to display
  const startPage = Math.max(1, currentPage - Math.floor(pageLinksToShow / 2));
  const endPage = Math.min(totalPages, startPage + pageLinksToShow - 1);

  // console.log("totalPages ", totalPages);

  //   const handlePageChange = (page: number) => {
  //     const newURL = createPageURL(page);
  //     router.push(newURL);
  //     setCurrentPage?.(page);
  //   };

  const handlePageChange = (page: number) => {
    if (page === currentPage) return;
    setCurrentPage(page); // This will trigger the useEffect below
  };

  useEffect(() => {
    const newURL = createPageURL(currentPage);
    router.push(newURL);
  }, [currentPage]);

  return (
    <Pagination>
      <PaginationContent className="w-full flex justify-between">
        <div>
          <PaginationItem>
            {currentPage === 1 ? (
              <PaginationPrevious className="border" />
            ) : (
              <PaginationPrevious
                className="cursor-pointer border"
                onClick={() => handlePageChange(currentPage - 1)}
              />
            )}
          </PaginationItem>
        </div>
        <div className="flex gap-1">
          {/* Always show first page */}
          {startPage > 1 && (
            <>
              <PaginationItem>
                <PaginationLink
                  className="cursor-pointer"
                  onClick={() => handlePageChange(1)}
                  isActive={currentPage === 1}
                >
                  1
                </PaginationLink>
              </PaginationItem>
              {startPage > 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
            </>
          )}
          {/* <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem> */}

          {Array.from({ length: endPage - startPage + 1 }).map((_, index) => (
            <PaginationItem key={index} className="">
              <PaginationLink
                className="cursor-pointer"
                onClick={() => handlePageChange(startPage + index)}
                isActive={currentPage === startPage + index}
              >
                {startPage + index}
              </PaginationLink>
            </PaginationItem>
          ))}

          {/* {totalPages > 5 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )} */}

          {/* Always show last page */}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink
                  className="cursor-pointer"
                  onClick={() => handlePageChange(totalPages)}
                  isActive={currentPage === totalPages}
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}
        </div>

        <div>
          <PaginationItem>
            {currentPage === totalPages ? (
              <PaginationNext className="border" />
            ) : (
              <PaginationNext
                className="cursor-pointer border"
                onClick={() => handlePageChange(currentPage + 1)}
              />
            )}
          </PaginationItem>
        </div>
      </PaginationContent>
    </Pagination>
  );
};
export default CusPagination;
