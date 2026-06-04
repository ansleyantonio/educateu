import {
  fetchAcademicSessions,
  fetchAwardingBodies,
  fetchCourses,
  fetchCoursesBySessionId,
  fetchCursesBySessionIdWithAwardingBodies,
  fetchMatchAwardingBodiesBySessionId,
  fetchModules,
  fetchSingleCourse,
  fetchSingleModule,
  fetchModulesByCourseId,
  fetchAgentList,
  fetchSubAgentList,
  useAdmissionOfficers,
  fetchDiplomaDegreeCourses
} from "./useDataHooks";

const DataFetcher = {
  fetchAwardingBodies,
  fetchMatchAwardingBodiesBySessionId,
  fetchCursesBySessionIdWithAwardingBodies,
  fetchCoursesBySessionId,
  fetchAcademicSessions,
  fetchSingleCourse,
  fetchCourses,
  fetchModules,
  fetchSingleModule,
  fetchModulesByCourseId,
  fetchAgentList,
  fetchSubAgentList,
  useAdmissionOfficers,
  fetchDiplomaDegreeCourses
};

export default DataFetcher;
