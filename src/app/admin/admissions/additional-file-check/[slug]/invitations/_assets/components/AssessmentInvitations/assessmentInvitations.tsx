/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import DynamicTableWithPagination, {
  TableConfig,
} from "@/components/common/DynamicTable/DynamicTable";
import dateFormat from "@/utils/DateFormatter";

interface Props {
  data: any;
  isLoading: boolean;
  setCurrentPage: (data: number) => void;
  currentPage: number;
}

const AssessmentInvitations = ({
  data,
  isLoading,
  setCurrentPage,
  currentPage,
}: Props) => {
  const tableConfig: TableConfig = {
    columns: [
      { key: "type", header: "Request" },
      { key: "note", header: "Note" },
      {
        key: "sentBy",
        header: "Sent By",
        render: (item) => item?.createdBy,
      },
      {
        key: "createdAt",
        header: "Date And Time",
        render: (item) => dateFormat.fullDateTime(item?.createdAt),
      },
    ],
  };

  return (
    <div>
      <DynamicTableWithPagination
        data={data?.data?.applicationNotes}
        pagination={data?.pagination}
        isLoading={isLoading}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        config={tableConfig}
      />
    </div>
  );
};

export default AssessmentInvitations;
