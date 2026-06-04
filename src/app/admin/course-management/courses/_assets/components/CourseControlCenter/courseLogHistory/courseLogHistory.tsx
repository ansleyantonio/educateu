import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { Timeline } from "@/components/ui/custom_ui/timeline";

const CourseLogHistoryTab = ({ id }: { id: string }) => {
  const { data, isLoading } = useFetchData({
    path: `courses/audit-logs/${id}`,
    queryKey: "fetch-module-audit-logs",
  });

  return (
    <div>
      <Timeline isLoading={isLoading} items={data?.data} />
    </div>
  );
};

export default CourseLogHistoryTab;
