import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { useCustomApiMutation } from "../../../../assessment/[id]/_assets/hooks/customUseApiMutation";
import { showToast } from "@/components/common/TostMessage/customTostMessage";

export const useGetRubricTemplates = () =>
  useFetchData({
    queryKey: ["rubricTemplates"],
    path: `rubrics/rubric-templates`,
    method: "GET",
  })

export const useGetRubricTemplate = (id: string) =>
  useFetchData({
    queryKey: ["rubricTemplate", id],
    path: `rubrics/rubric-templates/${id}`,
    method: "GET",
  })

export const useCreateRubricTemplate = () =>
  useCustomApiMutation({
    path: `rubrics/rubric-templates`,
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

export const useAddRubricCriteria = () =>
  useCustomApiMutation({
    path: (body) => `rubrics/rubric-templates/${body.rubricTemplateId}/rubric-criteria`,
    method: "POST",
    onSuccess: () => {
      console.log("Successfully added rubric criteria");
    },
    onError: () => {
      console.log("Failed to create rubric template");
      showToast("error", "Failed to create rubric template");
    },
    isSuccessToast: false
  })

export const useUpdateRubricCriteria = () =>
  useCustomApiMutation({
    path: (body) => `rubrics/rubric-criteria/${body.rubricCriteriaId}`,
    method: "PUT",
    onSuccess: () => {
      console.log("Successfully updated rubric criteria");
    },
    onError: () => {
      console.log("Failed to update rubric criteria");
      showToast("error", "Failed to update rubric criteria");
    },
    isSuccessToast: false
  })

export const useUpdateRubricCriteriaIndex = () =>
  useCustomApiMutation({
    path: (body) => `rubrics/rubric-criteria/${body.rubricCriteriaId}/index`,
    method: "PUT",
    onSuccess: () => {
      console.log("Successfully updated rubric criteria index");
    },
    onError: () => {
      console.log("Failed to update rubric criteria index")
      showToast("error", "Failed to update rubric criteria index");
    },
    isSuccessToast: false
  })

export const useDeleteRubricCriteria = () =>
  useCustomApiMutation({
    path: (body) => `rubrics/rubric-criteria/${body.rubricCriteriaId}`,
    method: "DELETE",
    onSuccess: () => {
      console.log("Successfully deleted rubric criteria");
    },
    onError: () => {
      console.log("Failed to delete rubric criteria");
      showToast("error", "Failed to delete rubric criteria");
    },
    isSuccessToast: false
  })

