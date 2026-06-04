import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { useCustomApiMutation } from "./customUseApiMutation";
import { showToast } from "@/components/common/TostMessage/customTostMessage";

export const useGetRubric = (id: string) =>
  useFetchData({
    queryKey: ["rubric", id],
    path: `assessments/assignment-questions/${id}/rubric-criteria`,
    method: "GET",
  })

export const useConnectRubric = () =>
  useCustomApiMutation({
    path: (body) => `assessments/assignment-questions/${body.assignmentQuestionId}/rubric-criteria`,
    method: "POST",
    onSuccess: () => {
      console.log("Rubric connected successfully");
    },
    onError: () => {
      console.log("Failed to connect rubric");
      showToast("error", "Failed to connect rubric");
    },
    isSuccessToast: false,
  })

export const useUpdateRubricCriteria = () =>
  useCustomApiMutation({
    path: (body) => `assessments/rubric-criteria/${body.rubricCriteriaId}`,
    method: "PUT",
    onSuccess: () => {
      console.log("Rubric updated successfully");
    },
    onError: () => {
      console.log("Failed to update rubric");
      showToast("error", "Failed to update rubric");
    },
    isSuccessToast: false,
  });

export const useUpdateRubricCriteriaIndex = () =>
  useCustomApiMutation({
    path: (body) => `assessments/rubric-criteria/${body.rubricCriteriaId}/index`,
    method: "PUT",
    onSuccess: () => {
      console.log("Rubric updated successfully");
    },
    onError: () => {
      console.log("Failed to update rubric");
      showToast("error", "Failed to update rubric");
    },
    isSuccessToast: false,
  })

export const useDeleteRubricCriteria = () =>
  useCustomApiMutation({
    path: (body) => `assessments/rubric-criteria/${body.rubricCriteriaId}`,
    method: "DELETE",
    onSuccess: () => {
      console.log("Rubric deleted successfully");
    },
    onError: () => {
      console.log("Failed to delete rubric");
      showToast("error", "Failed to delete rubric");
    },
    isSuccessToast: false
  })

export const useCreateRubricTemplate = () =>
  useCustomApiMutation({
    path: (body) => `assessments/assignment-questions/${body.assignmentQuestionId}/create-template`,
    method: "POST",
    onSuccess: () => {
      console.log("Rubric Template created successfully");
    },
    onError: () => {
      console.log("Failed to create rubric template");
      showToast("error", "Failed to create rubric template");
    },
    isSuccessToast: false
  })

export const useGetRubricTemplates = () =>
  useFetchData({
    queryKey: ["rubricTemplates"],
    path: `assessments/rubric-templates`,
    method: "GET",
  })

export const useGetRubricTemplate = (id: string) =>
  useFetchData({
    queryKey: ["rubricTemplate", id],
    path: `assessments/rubric-templates/${id}`,
    method: "GET",
  })

