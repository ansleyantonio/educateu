import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { Card } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import StudentsTable from "./student_table";

const AllStudentsCardTable = ({ id }: { id: string }) => {
  const params = useSearchParams();
  const page = params.get("page") || 1;
  const [currentPage, setCurrentPage] = useState(Number(page));

  const { data, isLoading } = useFetchData({
    path: `courses/${id}/students`,
    method: "GET",
    filterData: {
      page: currentPage,
    },
    queryKey: "fetch-course-student-list",
  });

  // console.log("student list", data);

  useEffect(() => {
    setCurrentPage(Number(page));
  }, [page]);

  return (
    <Card className="mt-9">
      {/* Header */}
      <div className="flex justify-between items-center p-4 w-full">
        <h1>Students List</h1>
        {/* <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a value" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="export">Export</SelectItem>
              <SelectItem value="import">Import</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select> */}
      </div>

      {/* Table */}
      <StudentsTable
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isLoading={isLoading}
        pagination={data?.pagination}
        students={data?.data?.students}
      />
    </Card>
  );
};

export default AllStudentsCardTable;
