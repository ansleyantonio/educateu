"use client";
import { ScrollArea } from "@/components/ui/custom_ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import AgentPagination from "@/app/(agent-portal)/agent/application-management/_assets/components/page_components/pagination";
import fileDownload from "/public/assets/logo/agent/admin/download-02.svg";
import fileEdit from "/public/assets/logo/agent/admin/edit-2.svg";
import fileView from "/public/assets/logo/agent/admin/file-view.svg";

const invoices = [
  {
    invoice: "INV001",
    paymentStatus: "Paid",
    totalAmount: "$250.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV002",
    paymentStatus: "Pending",
    totalAmount: "$150.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV003",
    paymentStatus: "Unpaid",
    totalAmount: "$350.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV004",
    paymentStatus: "Paid",
    totalAmount: "$450.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV005",
    paymentStatus: "Paid",
    totalAmount: "$550.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV006",
    paymentStatus: "Pending",
    totalAmount: "$200.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV007",
    paymentStatus: "Unpaid",
    totalAmount: "$300.00",
    paymentMethod: "Credit Card",
  },
];
const AllCourseList = () => {
  return (
    <>
      <ScrollArea className="w-full border-none  overflow-y-auto  2xl:h-full !h-[calc(100vh-290px)] ">
        <Table>
          <TableHeader>
            <TableRow className="border-t bg-[#F5F7F9] border-[#EAEDF0]">
              <TableHead className="pl-4">Course Title</TableHead>
              <TableHead>Sessions</TableHead>
              <TableHead>Session Status</TableHead>
              <TableHead className="text-left">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow className="" key={invoice.invoice}>
                <TableCell className="pl-4 text-sm leading-6 capitalize text-[#3E6CC3]">
                  {invoice.invoice}
                </TableCell>
                <TableCell>{invoice.paymentStatus}</TableCell>
                <TableCell>{invoice.paymentMethod}</TableCell>
                <TableCell className="text-left">
                  <div className="flex gap-x-2">
                    <div className="py-2 px-3 rounded-lg border border-[#E1E5E7]">
                      <Image src={fileView} alt="eye" width={17} height={17} />
                    </div>
                    <div className="py-2 px-3 rounded-lg border border-[#E1E5E7]">
                      <Image
                        src={fileDownload}
                        alt="eye"
                        width={17}
                        height={17}
                      />
                    </div>
                    <div className="py-2 px-3 rounded-lg border border-[#E1E5E7]">
                      <Image src={fileEdit} alt="eye" width={17} height={17} />
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
      <Table>
        {invoices?.length > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell className="">
                <AgentPagination totalPages={invoices.length} />
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </>
  );
};

export default AllCourseList;
