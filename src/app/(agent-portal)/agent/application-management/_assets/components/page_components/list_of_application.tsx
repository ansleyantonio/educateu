/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import DataLoader from "@/components/common/GlobalLoader/dataLoader";
import NoDataComponent from "@/components/common/GlobalLoader/empty";
import CusPagination from "@/components/common/pagination/paginations";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import ApplicationProgress from "./application_progress";
const ListOfApplication = ({
  data,
  isLoading,

  setCurrentPage,
  currentPage,
}: {
  data: any;
  isLoading: any;

  currentPage: number;
  setCurrentPage: (page: number) => void;
}) => {
  // console.log(ApplicationData);
  // const page = searchParams?.page || "1";
  // console.log("page ---", data);
  return (
    <div className="p-4">
      {/* <DynamicTableWithPagination
        isLoading={isLoading}
        data={data?.data?.applications || []}
        pagination={data?.data?.pagination}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        config={{
          columns: [
            {
              key: "id",
              header: "Application Number",
              render: (application) =>
                application?.status === "DRAFT" ? (
                  <Link
                    className="cursor-pointer"
                    href={`/agent/application-management/create/${application?.id}`}
                  >
                    {application?.id}
                  </Link>
                ) : (
                  <Link
                    className="cursor-pointer"
                    href={`/agent/application-management/${application?.id}/profile`}
                  >
                    {application?.id}
                  </Link>
                ),
            },
            {
              key: "applicationId",
              header: "Application Id",
              render: (application) => application.applicationId,
            },
            {
              key: "applicant",
              header: "Applicant Name",
              render: (application) =>
                application?.personalInformation?.firstName ||
                application?.personalInformation?.lastName ? (
                  <span className="capitalize">
                    {application?.personalInformation?.firstName || ""}{" "}
                    {application?.personalInformation?.lastName || ""}
                  </span>
                ) : (
                  "N/A"
                ),
            },
            {
              key: "interview",
              header: "Interview",
              render: () => "Not Assigned",
            },
            {
              key: "status",
              header: "Outcome",
              render: (application) => application.status,
            },
            {
              key: "progress",
              header: "Progress (%)",
              render: (application) => (
                <div className="flex items-center gap-x-2">
                  <ApplicationProgress percentage={application.progress} />
                  <span>{application.progress} %</span>
                </div>
              ),
            },
          ],
        }}
      /> */}

      <Table className="border border-collapse table-auto">
        <TableHeader className="bg-gray-50">
          <TableRow>
            {/* <TableHead className="w-[5%]">
              <Checkbox />
            </TableHead> */}
            <TableHead className="pl-4 border-r w-[15%] ">
              Application Number
            </TableHead>
            <TableHead className="pl-4 border-r w-[5%] ">Ref Number</TableHead>
            <TableHead className="border-r w-[25%] pl-4">
              Applicant Name
            </TableHead>
            <TableHead className="border-r w-[17%] pl-4">Interview</TableHead>
            <TableHead className="border-r w-[17%] pl-4">Outcome</TableHead>
            <TableHead className="border-r w-[16%] pl-4">
              Progress (%)
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className=" w-full">
          {isLoading ? (
            <div className="min-h-[250px] lg:min-h-[350px] ">
              <DataLoader />
            </div>
          ) : data?.data?.applications?.length === 0 ? (
            <div className="flex justify-center items-center h-[calc(100vh-450px)]">
              <NoDataComponent />
            </div>
          ) : (
            data?.data?.applications?.map((application: any) => (
              <TableRow className="bg-white" key={application?.id}>
                {/* <TableCell className="w-[5%]">
                  <Checkbox />
                </TableCell> */}
                <TableCell className="pl-4 w-[20%] ">
                  {application?.status == "DRAFT" ? (
                    <Link
                      className="cursor-pointer"
                      href={`/agent/application-management/create/${application?.id}`}
                    >
                      {application?.id}
                    </Link>
                  ) : (
                    <Link
                      className="cursor-pointer"
                      href={`/agent/application-management/${application?.id}/profile`}
                    >
                      {application?.id}
                    </Link>
                  )}
                </TableCell>
                <TableCell className="border-x w-[5%] pl-4">
                  {application?.applicationId || "-"}
                </TableCell>
                <TableCell className="font-medium border-x w-[25%] pl-4 capitalize">
                  {application?.personalInformation?.firstName &&
                    application?.personalInformation?.firstName}
                  {"  "}
                  {application?.personalInformation?.lastName &&
                    application?.personalInformation?.lastName}

                  {!application?.personalInformation?.firstName &&
                    !application?.personalInformation?.lastName &&
                    "N/A"}
                </TableCell>
                <TableCell className="border-x w-[17%] pl-4">
                  Not Assigned
                </TableCell>
                <TableCell className="border-x w-[17%] pl-4">
                  {application.status}
                </TableCell>
                <TableCell className="w-[16%] pl-4">
                  <div className="flex items-center gap-x-2 ">
                    <ApplicationProgress percentage={application.progress} />
                    <span>{application.progress} %</span>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
        {data?.data?.applications.length > 0 && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={6} className="">
                <CusPagination
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalPages={data?.pagination?.totalPages || 1}
                />
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  );
};

export default ListOfApplication;
