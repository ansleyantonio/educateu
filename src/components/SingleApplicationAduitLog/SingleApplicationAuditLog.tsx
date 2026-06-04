/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import CusPagination from "../common/pagination/paginations";
import { Card } from "../ui/custom_ui/customCard";
import LogList from "./logList";

interface Props {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  isLoading: boolean;
  data: any;
  totalPages?: number;
}
const SingleApplicationAuditLog = ({
  currentPage,
  setCurrentPage,
  isLoading,
  data,
  totalPages,
}: Props) => {
  return (
    <div>
      <Card className="overflow-x-auto">
        <LogList isLoading={isLoading} logList={data} />
      </Card>
      <div className="my-6 mx-3">
        <CusPagination
          totalPages={totalPages || 1}
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
};

export default SingleApplicationAuditLog;
