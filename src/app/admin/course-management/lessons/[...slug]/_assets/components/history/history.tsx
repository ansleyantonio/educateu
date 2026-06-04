import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import DataLoader from "@/components/common/GlobalLoader/dataLoader";
import NoDataComponent from "@/components/common/GlobalLoader/empty";
import { Timeline } from "@/components/ui/custom_ui/timeline";

const LessonHistoryTab = ({ id }: { id: string }) => {
  const { data, isLoading } = useFetchData({
    method: "GET",
    path: `courses/audit-logs/${id}`,
    queryKey: "fetch-lesson-history",
  });

  return (
    <div>
      {isLoading ? (
        <DataLoader />
      ) : data?.data?.length === 0 ? (
        <NoDataComponent />
      ) : (
        <Timeline isLoading={isLoading} items={data?.data} />
      )}
      {/* <SingleApplicationAuditLog */}
      {/*   data={data} */}
      {/*   isLoading={isLoading} */}
      {/*   currentPage={currentPage} */}
      {/*   setCurrentPage={setCurrentPage} */}
      {/*   totalPages={1} */}
      {/* /> */}
    </div>
  );
};

export default LessonHistoryTab;
