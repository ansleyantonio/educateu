/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import DataLoader from "@/components/common/GlobalLoader/dataLoader";
import CheckDocumentViewPage from "@/components/common/viewDocumentImage/checkDocumentDialog";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuths } from "@/hooks/userContext";
import { CamelToTitle } from "@/utils/CaseConverter";
import { SquareCheckBig } from "lucide-react";
import GeneralChecksDialog from "./dialog/generalChecksDialog";

const GeneralFileChecks = ({ id }: { id: string }) => {
  const auth = useAuths();
  const token = auth?.user?.token;

  // const { data, isLoading } = useQuery({
  //   queryKey: ["single-application-data", token, id],
  //   queryFn: fetchAllCheckData,
  // });

  const {
    data: singleApplicationData,
    isLoading: singleApplicationDataLoading,
  } = useFetchData({
    queryKey: "list-of-admission-applications-data",
    path: `admission/profile/application/${id}`,
    method: "GET",
  });

  const { data, isLoading } = useFetchData({
    queryKey: "list-of-admission-applications-data",
    path: `admission/checks/logs/${id}`,
    method: "GET",
    filterData: {
      type: "CHECK",
    },
  });

  const generalCheckDone =
    singleApplicationData?.data?.application?.generalFileCheckStatus;

  const checkData = data?.data?.fileChecks;

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // console.log("generalCheckDone", generalCheckDone);

  return (
    <Card>
      <div className="flex justify-between items-center p-4">
        <h1 className="text-lg font-semibold text-black">
          General File Checks
        </h1>
      </div>
      <hr />

      {isLoading || singleApplicationDataLoading ? (
        <div className="flex justify-center items-center min-h-24">
          <DataLoader />
        </div>
      ) : (
        <div className="p-4">
          <Table className="text-nowrap">
            <TableHeader className="">
              <TableHead className="font-semibold text-black text-xl">
                Date
              </TableHead>
              <TableHead className="font-semibold text-black text-xl">
                Admission Officer
              </TableHead>
              <TableHead className="font-semibold text-black text-xl">
                File Check Outcome
              </TableHead>
            </TableHeader>
            <TableBody>
              {checkData?.map((item: any, i: number) => (
                <TableRow key={i}>
                  <TableCell>{formatDate(item?.createdAt)}</TableCell>
                  <TableCell>{item?.createdBy}</TableCell>
                  <TableCell>
                    {" "}
                    <div className="flex col-span-6 gap-2 items-center">
                      <SquareCheckBig
                        size={15}
                        color="#30BD29"
                        strokeWidth={3}
                      />
                      <h3>{CamelToTitle(item?.name)}</h3>
                      <CheckDocumentViewPage
                        name={item?.name}
                        attachment={item}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {generalCheckDone === "PENDING" && (
            <div className="flex justify-end mt-2">
              {token && (
                <GeneralChecksDialog
                  id={id}
                  token={token}
                  checkItemNames={checkData}
                />
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default GeneralFileChecks;
