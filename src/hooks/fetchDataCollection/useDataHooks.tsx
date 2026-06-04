/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface User {
  id: string;
  firstName: string;
  lastName: string;
}

interface UserPortalCategory {
  user: User;
}

interface AdmissionOfficerResponse {
  id: string;
  userPortalCategory: UserPortalCategory;
}

interface AdmissionOfficersApiResponse {
  data: {
    admissionOfficers: AdmissionOfficerResponse[];
  };
}

/* Fetch Awarding Bodies */
export function fetchAwardingBodies({ filter }: { filter?: any } = {}) {
  const { data, isLoading, isError } = useFetchData({
    path: "awarding-bodies",
    queryKey: "fetch-awarding-bodies",
    filterData: { ...filter },
  });

  const options = data?.data?.awardingBodies?.map((item: any) => ({
    label: item.name || item.title || "Unknown",
    value: item.id,
    code: item.code,
  }));

  return { options, data, isLoading, isError };
}

/* Fetch Awarding Bodies */
export function fetchMatchAwardingBodiesBySessionId({
  filter,
  sessionId = "",
  path,
}: {
  filter?: any;
  sessionId: string;
  path?: string;
}) {
  const { data, isLoading, isError } = useFetchData({
    path: path ?? `session/${sessionId}/matching-awarding-bodies`,
    queryKey: "fetch-match-awarding-bodies",
    filterData: { ...filter },
    enabled: !!sessionId,
  });

  const options = data?.data?.awardingBodies?.map((item: any) => ({
    label: item.name || item.title || "Unknown",
    value: item.id,
    code: item.code,
  }));

  return { options, data, isLoading, isError };
}

/* Fetch Academic Sessions */
export function fetchAcademicSessions({
  filter,
  path,
  enabled,
}: { filter?: any; path?: string; enabled?: boolean } = {}) {
  const { data, isLoading, isError } = useFetchData({
    path: path ?? "session",
    queryKey: "fetch-session-list",
    filterData: { ...filter },
    enabled: enabled,
  });

  const options = data?.data?.sessions?.map((item: any) => ({
    label: item.name || item.title || "Unknown",
    value: item?.id,
    startDate: item?.startDate,
  }));

  return { options, data, isLoading, isError };
}

/* fetchCursesBySessionIdWithAwardingBodies */
export function fetchCursesBySessionIdWithAwardingBodies({
  sessionId,
  filter,
  path,
}: {
  sessionId: string;
  filter?: any;
  path?: string;
}) {
  const { data, isLoading, isError } = useFetchData({
    method: "GET",
    path: path ?? `session/${sessionId}/courses`,
    queryKey: `fetch-courses-list-by-session-awarding-bodies`,
    filterData: { ...filter },
    enabled: !!sessionId,
  });

  const options =
    data?.data?.sessionCourses?.map((item: any) => ({
      label: item.course.name || item.course.title || "Unknown",
      value: item.id,
    })) ?? [];

  return { options, data, isLoading, isError };
}

/* Fetch Modules by Course Id */
export function fetchModulesByCourseId({
  courseId,
  filter,
  enabled,
}: {
  courseId: string;
  filter?: any;
  enabled?: boolean;
}) {
  const { data, isLoading, isError } = useFetchData({
    method: "GET",
    path: `faculty-management/courses-list?id=${courseId}`,
    queryKey: `fetch-modules-list-by-courseId`,
    enabled,
    filterData: { ...filter },
  });
  // console.log(data, "Modules");
  // console.log(courseId, "Id");
  const course = data?.data?.find((c: any) => c.courseId === courseId);
  const modules: any = course?.modules || [];

  const options =
    modules.map((mod: any) => ({
      value: mod.id,
      label: mod.title,
    })) ?? [];

  return { options, data, isLoading, isError };
}

/* Fetch  Courses by Session Id */
export function fetchCoursesBySessionId({
  sessionId,
  queryKey,
  enabled,
  filter,
}: {
  sessionId: string;
  queryKey?: string;
  enabled?: boolean;
  filter?: any;
}) {
  const { data, isLoading, isError } = useFetchData({
    path: `session/${sessionId}/courses`,
    queryKey: queryKey ?? "fetch-courses-by-sessionId",
    enabled: enabled,
    filterData: { ...filter },
  });

  // Extract course IDs from the response data
  const courseIds =
    data?.data?.sessionCourses?.map(
      (sessionCourse: any) => sessionCourse.courseId
    ) || [];

  // Extract course IDs and names from the response data
  const courseIdsObj = data?.data?.sessionCourses?.map(
    (sessionCourse: any) => ({
      id: sessionCourse?.courseId,
      name: sessionCourse?.courseSnapshot?.title,
    })
  );

  const options = data?.data?.sessionCourses?.map((item: any) => ({
    value: item?.courseId || "",
    label: item?.courseSnapshot?.title || "",
  }));

  return { data, courseIdsObj, options, isLoading, isError, courseIds };
}

/* Fetch Courses */
export function fetchCourses({ filter }: { filter?: any } = {}) {
  const { data, isLoading, isError } = useFetchData({
    method: "POST",
    path: `courses/get`,
    queryKey: `fetch-${filter?.courseType}-list`,
    filterData: { ...filter },
  });

  const options =
    data?.data?.courses?.map((item: any) => ({
      label: item.name || item.title || "Unknown",
      value: item.id,
    })) ?? [];

  return { options, data, isLoading, isError };
}

export function fetchDiplomaDegreeCourses({ filter }: { filter?: any } = {}) {
  const diploma = useFetchData({
    method: "POST",
    path: `courses/get`,
    queryKey: `fetch-diploma-courses`,
    filterData: { ...filter, courseType: "DIPLOMA_COURSE" },
  });

  const degree = useFetchData({
    method: "POST",
    path: `courses/get`,
    queryKey: `fetch-degree-courses`,
    filterData: { ...filter, courseType: "DEGREE_COURSE" },
  });

  const diplomaCourses = diploma?.data?.data?.courses ?? [];
  const degreeCourses = degree?.data?.data?.courses ?? [];

  const allCourses = [...diplomaCourses, ...degreeCourses];

  const options =
    allCourses.map((item: any) => ({
      label: item.name || item.title || "Unknown",
      value: item.id,
    })) ?? [];

  return {
    options,
    data: { diploma: diploma.data, degree: degree.data },
    isLoading: diploma.isLoading || degree.isLoading,
    isError: diploma.isError || degree.isError,
  };
}
/* Fetch Single Course */
export function fetchSingleCourse({ courseId }: { courseId: string }) {
  const { data, isLoading, isError } = useFetchData({
    method: "GET",
    path: `courses/${courseId}`,
    queryKey: `fetch_single_course_details`,
  });

  return { data, isLoading, isError };
}

/* Fetch Module */
export function fetchModules({ filter }: { filter?: any } = {}) {
  const { data, isLoading, isError } = useFetchData({
    method: "POST",
    path: `course-modules/get`,
    queryKey: `fetch-${filter?.courseType}-list`,
    filterData: { ...filter },
  });

  const options =
    data?.data?.courseModules?.map((item: any) => ({
      label: item.name || item.title || "Unknown",
      value: item.id,
    })) ?? [];

  return { options, data, isLoading, isError };
}

/* Fetch Single Module */
export function fetchSingleModule({ moduleId }: { moduleId: string }) {
  const { data, isLoading, isError } = useFetchData({
    method: "GET",
    path: `course-modules/${moduleId}`,
    queryKey: `fetch_single_module_details`,
  });

  return { data, isLoading, isError };
}

/* Fetch Agent List */
export function fetchAgentList({ filter }: { filter?: any } = {}) {
  const { data, isLoading, isError } = useFetchData({
    method: "GET",
    path: `business-development-management`,
    queryKey: `fetch-list-of-agents`,
    filterData: { ...filter },
  });

  const options =
    data?.data?.agents?.map((agent: any) => ({
      label: `${agent.firstName} ${agent.lastName}`,
      value: agent.roasterId,
      id: agent.id,
    })) || [];

  return { data, isLoading, isError, options };
}

/* Fetch Sub Agent List */
export function fetchSubAgentList({
  agentId,
  filter,
}: { agentId?: string; filter?: any } = {}) {
  const { data, isLoading, isError } = useFetchData({
    method: "GET",
    path: `sub-agent/agent-wise/${agentId}`,
    queryKey: `fetch-list-of-sub-agents`,
    filterData: { ...filter },
    enabled: !!agentId,
  });

  const options =
    data?.data?.map((subAgent: any) => ({
      label: `${subAgent.firstName} ${subAgent.lastName}`,
      value: subAgent.id,
    })) || [];

  return { data, isLoading, isError, options };
}

export function useAdmissionOfficers(token: string) {
  return useQuery({
    queryKey: ["admissionOfficers", token],
    enabled: !!token,
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admission/assigns/admission-officers`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },

    select: (response: any) => {
      const officers = response?.data?.admissionOfficers || [];

      return officers.map((officer: any) => {
        const user = officer?.userPortalCategory?.user || {};
        const portalCategory = officer?.userPortalCategory?.portalCategory;
        const role = officer?.role;

        const id = user?.id || officer?.id;

        const firstName = user?.firstName || "";
        const lastName = user?.lastName || "";
        const roleName = role?.name || "";
        const portalCategoryName = portalCategory?.name || "";

        return {
          id,
          value: id,
          label: `${firstName} ${lastName}`.trim() || "Unnamed Officer",
          role: roleName,
          portalCategory: portalCategoryName,
        };
      });
    },
  });
}
