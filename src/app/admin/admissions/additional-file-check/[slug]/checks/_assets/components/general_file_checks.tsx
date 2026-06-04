/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import CheckDocumentViewPage from "@/components/common/viewDocumentImage/checkDocumentDialog";
import { Card } from "@/components/ui/card";
import { CamelToTitle } from "@/utils/CaseConverter";
import { Loader2, SquareCheckBig } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const GeneralFileChecks = ({ id }: { id: string }) => {
  const { data, isLoading } = useFetchData({
    queryKey: "all-check-data",
    path: `additional-file-check/general-file-checks`,
    method: "GET",
    filterData: {
      applicationId: id,
    },
  });
  // const { data, isLoading } = useQuery({
  //   queryKey: ["all-check-data", id, token],
  //   queryFn: fetchAllCheckData,
  // });

  const checkData =
    data?.data?.generalFileChecks?.supportingDocumentAttachments;

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <Card>
      <div className="flex justify-between items-center p-4">
        <h1 className="text-lg font-semibold text-black">
          General File Checks
        </h1>
        {/* <ChevronUp /> */}
      </div>
      <hr />

      {isLoading ? (
        <div className="flex justify-center items-center min-h-24">
          <Loader2 className="w-10 h-10 text-black animate-spin-slow" />
        </div>
      ) : (
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
                  <TableCell>{item?.agent}</TableCell>
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
                        attachment={item?.attachment}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

        // <div className="p-4">
        //   <div className="grid grid-cols-10 gap-4 items-center font-semibold">
        //     <h3 className="col-span-2">Date</h3>
        //     <h3 className="col-span-2">Admission Officer</h3>
        //     <h3 className="col-span-6">File Check Outcome</h3>
        //   </div>
        //   <div>
        //     {checkData?.map((item: any, i: number) => (
        //       <div
        //         key={i}
        //         className="grid grid-cols-10 gap-4 items-center my-5 font-thin text-gray-800"
        //       >
        //         <h3 className="col-span-2">{formatDate(item?.createdAt)}</h3>
        //         <h3 className="col-span-2">{item?.agent}</h3>
        //         <div className="flex col-span-6 gap-2 items-center">
        //           <SquareCheckBig size={15} color="#30BD29" strokeWidth={3} />
        //           <h3>{CamelToTitle(item?.name)}</h3>
        //           <CheckDocumentViewPage
        //             name={item?.name}
        //             attachment={item?.attachment}
        //           />
        //         </div>
        //       </div>
        //     ))}
        //   </div>
        // </div>
      )}
    </Card>
  );
};

export default GeneralFileChecks;
