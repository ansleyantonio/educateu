/* eslint-disable @typescript-eslint/no-explicit-any */
// import AgentPagination from "@/app/(agent_management)/agent/application/_assets/components/page_components/pagination";
import DataLoader from "@/components/common/GlobalLoader/dataLoader";
import NoDataComponent from "@/components/common/GlobalLoader/empty";
import CusPagination from "@/components/common/pagination/paginations";
import {
  Table,
  TableBody,
  TableCell,
  // TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/custom_ui/border_table";
import { TableFooter } from "@/components/ui/table";
import dateFormat from "@/utils/DateFormatter";
import { TruncateText } from "@/utils/TruncateText";

interface studentProps {
  currentPage: number;
  setCurrentPage: (data: number) => void;
  students: any;
  pagination: any;
  isLoading: boolean;
}

const StudentsTable = ({
  currentPage,
  setCurrentPage,
  students,
  pagination,
  isLoading,
}: studentProps) => {
  // console.log("student list", students);
  return (
    <>
      <Table className="border-t border-r border-collapse table-auto bg-[#FFFFFF]">
        <TableHeader className="bg-[#F5F7F9]">
          <TableRow className="border-t bg-[#F5F7F9] border-[#EAEDF0]">
            <TableHead className="pl-4">ApplicationId</TableHead>
            <TableHead>Student Name</TableHead>
            <TableHead>Enrolled At</TableHead>
            {/* <TableHead className="text-left">Action</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody className="relative">
          {isLoading ? (
            <div className="min-h-[250px]">
              <DataLoader />
            </div>
          ) : students?.length === 0 ? (
            <div className="min-h-[250px]">
              <NoDataComponent />
            </div>
          ) : (
            students.map((data: any, index: number) => (
              <TableRow className="" key={index}>
                <TableCell className="pl-4 text-sm leading-6 capitalize">
                  <TruncateText text={data?.application?.applicationId} />
                </TableCell>
                <TableCell>
                  <TruncateText
                    text={
                      data.application.personalInformation.firstName +
                      " " +
                      data.application.personalInformation.lastName
                    }
                  />
                </TableCell>
                <TableCell>{dateFormat.time12h(data.createdAt)}</TableCell>
                {/* <TableCell className="text-left">
                  <div className="flex gap-x-2">
                    <div className="flex gap-2 items-center py-1 px-3 rounded-lg border border-[#E1E5E7]">
                      <Image src={fileView} alt="eye" width={17} height={17} />
                      <p>View</p>
                    </div>
                  </div>
                </TableCell> */}
              </TableRow>
            ))
          )}
        </TableBody>

        {isLoading === false && students?.length > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={10} className="text-center">
                <CusPagination
                  totalPages={pagination?.totalPages || 1}
                  setCurrentPage={setCurrentPage}
                  currentPage={currentPage}
                />
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </>
  );
};

export default StudentsTable;
