/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * DynamicTableWithPagination Component
 *
 * Usage:
 *  - Import and use <DynamicTableWithPagination /> when you need a reusable table with:
 *    - Pagination
 *    - Dynamic columns
 *    - Optional row selection with checkboxes
 *    - Loading and empty states
 *
 *  Required Props:
 *  - data: any[] → Table row data
 *  - isLoading: boolean → Show loader while fetching data
 *  - pagination: { page, total, perPage?, totalPages } → Pagination object
 *  - currentPage: number → Current active page
 *  - setCurrentPage: (page: number) => void → Callback for changing page
 *  - config: TableConfig → Table configuration (columns, headers, rowClassName, etc.)
 *
 * Optional Props:
 *  - isCheckBox: boolean → Enables checkbox selection (default: false)
 *  - selectedIds: string[] → Currently selected row IDs
 *  - setSelectedIds: (ids: string[]) => void → Updates selected IDs
 *  - setSelectObject: (data: any[]) => void → Updates selected row objects
 *  - pageName?: string → (optional) For additional page-level context
 *
 * Dependencies:
 *  - DataLoader → Shows loading spinner
 *  - NoDataComponent → Displays when no data is available
 *  - CusPagination → Custom pagination component
 *  - @/components/ui/table → UI table components
 *
 * Example:
 * ```
 * <DynamicTableWithPagination
 *   data={users}
 *   isLoading={loading}
 *   pagination={pagination}
 *   currentPage={page}
 *   setCurrentPage={setPage}
 *   config={{
 *     columns: [
 *       { key: "name", header: "Name" },
 *       { key: "email", header: "Email" },
 *       { key: "actions", header: "Actions", render: (user) => <Button>Edit</Button> },
 *     ],
 *   }}
 *   isCheckBox
 *   selectedIds={selectedIds}
 *   setSelectedIds={setSelectedIds}
 *   setSelectObject={setSelectedObjects}
 * />
 * ```
 */

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DataLoader from "../GlobalLoader/dataLoader";
import NoDataComponent from "../GlobalLoader/empty";
import CusPagination from "../pagination/paginations";
import React from "react";

/* eslint-disable no-unused-vars */

// Define types for table configurations
export type TableColumn = {
  key: string;
  header: string;
  className?: string;
  render?: (item: any, index: number) => React.ReactNode;
};

export type TableConfig = {
  columns: TableColumn[];
  emptyMessage?: string;
  showPagination?: boolean;
  rowClassName?: (item: any) => string;
  footer?: React.ReactNode;
  renderExpandableRow?: (item: any, index: number) => React.ReactNode;
};

interface Pagination {
  page: number;
  total: number;
  perPage?: number;
  totalPages: number;
}

interface DynamicTableProps {
  isLoading: boolean;
  pagination?: Pagination;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  config: TableConfig;
  data: any;
  // checkbox
  isCheckBox?: boolean;
  selectedIds?: string[]; // or number[] depending on your ID type
  setSelectedIds?: (ids: string[]) => void;
  setSelectObject?: (data: any[]) => void;

  pageName?: string;
  renderExpandedRow?: (item: any, index: number) => React.ReactNode;
  selectedKeys?: string;
}

const DynamicTableWithPagination = ({
  data,
  isLoading,
  pagination,
  currentPage,
  setCurrentPage,
  config,
  selectedIds = [],
  setSelectedIds = () => [],
  setSelectObject = () => [],
  isCheckBox = false,
  pageName,
  renderExpandedRow,
  selectedKeys,
}: DynamicTableProps) => {
  const isEmpty = !isLoading && (!data || data.length === 0);

  // Helper function to update selected objects
  const updateSelectedObjects = (newSelectedIds: string[]) => {
    const filteredApplications = data.filter((item: any) =>
      newSelectedIds.includes(item.id),
    );
    setSelectObject(filteredApplications);
  };

  // check box
  const isRowSelected = (id: string) => selectedIds?.includes(id);

  const toggleRowSelection = (id: string) => {
    let newSelectedIds: string[];

    if (isRowSelected(id)) {
      newSelectedIds = selectedIds.filter((item) => item !== id);
    } else {
      newSelectedIds = [...selectedIds, id];
    }

    setSelectedIds(newSelectedIds);
    updateSelectedObjects(newSelectedIds);
  };

  const toggleSelectAll = () => {
    let newSelectedIds: string[];

    if (data.every((item: any) => isRowSelected(item.id))) {
      newSelectedIds = [];
    } else {
      newSelectedIds = data.map((item: any) => item.id);
    }

    setSelectedIds(newSelectedIds);
    updateSelectedObjects(newSelectedIds);
  };

  return (
    <Table className="border border-collapse bg-[#FFFFFF]">
      {pagination && pagination?.totalPages > 0 && (
        <TableCaption className="p-4 border">
          <CusPagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={pagination?.totalPages}
          />
        </TableCaption>
      )}

      <TableHeader className="bg-[#F5F7F9]">
        <TableRow>
          {isCheckBox && (
            <TableHead className="pl-4 w-4 text-center">
              <input
                type="checkbox"
                checked={
                  data?.length > 0 &&
                  data?.every((item: any) => isRowSelected(item.id))
                }
                onChange={toggleSelectAll}
                aria-label="Select all rows"
                className="w-4 h-4"
              />
            </TableHead>
          )}
          {config?.columns.map((column) => (
            <TableHead key={column.key} className={column.className}>
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <div className="min-h-[250px] lg:min-h-[400px]">
            <DataLoader />
          </div>
        ) : isEmpty ? (
          <div className="min-h-[250px] lg:min-h-[400px]">
            <NoDataComponent />
          </div>
        ) : (
          data?.map((row: any, rowIndex: number) => (
            <React.Fragment key={rowIndex}>
              <TableRow
                key={rowIndex}
                className={config.rowClassName ? config.rowClassName(row) : ""}
              >
                {isCheckBox && (
                  <TableCell className="pl-4 text-center">
                    <input
                      type="checkbox"
                      checked={isRowSelected(row.id)}
                      onChange={() => toggleRowSelection(row.id)}
                      className="w-4 h-4"
                    />
                  </TableCell>
                )}
                {config?.columns.map((col, colIndex) => (
                  <TableCell key={colIndex} className={`${col.className}`}>
                    {col.render ? col.render(row, rowIndex) : row[col.key]}
                  </TableCell>
                ))}
              </TableRow>
              {renderExpandedRow &&
                (() => {
                  const expandedContent = renderExpandedRow(row, rowIndex);
                  if (!expandedContent) return null;
                  return (
                    <TableRow>
                      <TableCell
                        colSpan={config.columns.length + (isCheckBox ? 1 : 0)}
                      >
                        {expandedContent}
                      </TableCell>
                    </TableRow>
                  );
                })()}
            </React.Fragment>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default DynamicTableWithPagination;
