import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { Timeline } from "@/components/ui/custom_ui/timeline";

const ModuleLogHistoryTab = ({ id }: { id: string }) => {
  const { data, isLoading } = useFetchData({
    path: `course-modules/audit-logs/${id}`,
    queryKey: "fetch-module-audit-logs",
  });

  return (
    <div>
      <Timeline isLoading={isLoading} items={data?.data} />
    </div>
  );
};

export default ModuleLogHistoryTab;
