// const Sub_agent_list = () => {
//   return <div></div>;
// };

// export default Sub_agent_list;

"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const data: User[] = [
  {
    name: "John Doe",
    username: "@john",
    company: "EduTech Solutions",
    role: "Senior Agent",
    mobile: "1234567890",
    status: "Active",
    submittedApplications: 45,
  },
  {
    name: "Jane Smith",
    username: "@jane",
    company: "Learnz Innovations",
    role: "Junior Agent",
    mobile: "9876543210",
    status: "Incomplete",
    submittedApplications: 12,
  },
  {
    name: "Michelle Carter",
    username: "@michelle",
    company: "Bright Minds Co.",
    role: "Manager",
    mobile: "6677889900",
    status: "Active",
    submittedApplications: 68,
  },
  {
    name: "Sarah Johnson",
    username: "@sarah",
    company: "SkillBuilders Inc.",
    role: "Agent",
    mobile: "8899001122",
    status: "Pending",
    submittedApplications: 34,
  },
  {
    name: "Emily Davis",
    username: "@emily",
    company: "Knowledge Pros",
    role: "Senior Agent",
    mobile: "7788990011",
    status: "Active",
    submittedApplications: 25,
  },
  {
    name: "Rahul Kumar",
    username: "@rahul",
    company: "FutureLearn Hub",
    role: "Junior Agent",
    mobile: "9988776655",
    status: "Active",
    submittedApplications: 9,
  },
  {
    name: "Lisa Wong",
    username: "@lisa",
    company: "Global training Ltd.",
    role: "Manager",
    mobile: "5566778899",
    status: "Incomplete",
    submittedApplications: 50,
  },
];

export type User = {
  name: string;
  username: string;
  company: string;
  role: string;
  mobile: string;
  status: string;
  submittedApplications: number;
};

export const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        className="min-w-5 h-5"
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        className="min-w-5 h-5"
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.name}</div>
        <div className="text-sm text-gray-500">{row.original.username}</div>
      </div>
    ),
  },
  {
    accessorKey: "company",
    header: "Company Name",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "mobile",
    header: "Mobile",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue<string>(
        "status"
      ) as keyof typeof statusClasses;
      const statusClasses = {
        Active: "text-green-600 bg-green-100",
        Incomplete: "text-red-600 bg-red-100",
        Pending: "text-yellow-600 bg-yellow-100",
      };

      return (
        <span
          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status]}`}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "submittedApplications",
    header: "Number of Submitted Applications",
    cell: ({ row }) => (
      <div className="text-start font-medium">
        {row.getValue("submittedApplications")}
      </div>
    ),
  },
];

export function Sub_agent_list() {
  const [rowSelection, setRowSelection] = React.useState({});
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
