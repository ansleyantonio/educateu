import useFetchData from "@/app/hook/TanstackQueries/useFetchData";

export const useFetchStudentRoaster = (
  filterData?: Record<string, unknown>
) => {
  return useFetchData({
    path: "registry",
    method: "POST",
    queryKey: "fetch-student-roaster",
    filterData,
  });
};

export const useFetchStudentSession = () => {
  return useFetchData({
    path: "session",
    method: "GET",
    queryKey: "fetch-student-session",
  });
};
