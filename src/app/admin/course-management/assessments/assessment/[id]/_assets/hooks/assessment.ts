import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { useCustomApiMutation } from "./customUseApiMutation";
import { showToast } from "@/components/common/TostMessage/customTostMessage";


// ---------------------------- Fetching --------------------------------
export function useFetchQuizQuestions(assessmentId: string) {
  return useFetchData({
    queryKey: "quiz-questions",
    path: `assessments/${assessmentId}/quiz-questions`,
    method: "GET",
  })
}

export function useFetchAssignmentQuestions(assessmentId: string) {
  return useFetchData({
    queryKey: "assignment-questions",
    path: `assessments/${assessmentId}/assignment-questions`,
    method: "GET",
  })
}

export function useFetchQuizQuestion(quizQuestionId: string) {
  return useFetchData({
    queryKey: "quiz-question",
    path: `assessments/quiz-questions/${quizQuestionId}`,
    method: "GET",
  })
}

export function useFetchAssessment(assessmentId: string) {
  return useFetchData({
    queryKey: "assessment",
    path: `assessments/${assessmentId}`,
    method: "GET",
  })
}

// ---------------------------- Mutations -------------------------------
export function useCreateQuizQuestion() {
  return useCustomApiMutation({
    path: (body) => `assessments/${body.assessmentId}/quiz-questions`,
    method: "POST",
    onSuccess: () => {
      console.log("Question created successfully");
    },
    onError: (error) => {
      console.log("Failed to create question");
      showToast("error", `Failed to create question ${error.response.data.message}`);
    },
    isSuccessToast: false,
  });
}

export function useCreateAssignmentQuestion() {
  return useCustomApiMutation({
    path: (body) => `assessments/${body.assessmentId}/assignment-questions`,
    method: "POST",
    onSuccess: () => {
      console.log("Question created successfully");
    },
    onError: (error) => {
      console.log("Failed to create question");
      showToast("error", `Failed to create question ${error.response.data.message}`);
    },
    isSuccessToast: false,
  });
}

export function useUpdateQuizQuestion() {
  // console.log(quizQuestionId);
  return useCustomApiMutation({
    path: (body) => `assessments/quiz-questions/${body.id}`,
    method: "PUT",
    onSuccess: () => {
      console.log("Question updated successfully");
    },
    onError: (error) => {
      console.log("Failed to update question");
      showToast("error", `Failed to update question ${error.response.data.message}`);
    },
    isSuccessToast: false
  });
}

export function useUpdateAssignmentQuestion() {
  // console.log(quizQuestionId);
  return useCustomApiMutation({
    path: (body) => `assessments/assignment-questions/${body.id}`,
    method: "PUT",
    onSuccess: () => {
      console.log("Question updated successfully");
    },
    onError: (error) => {
      console.log("Failed to update question", error);
      showToast("error", `Failed to update question ${error.response.data.message}`);
    },
    isSuccessToast: false
  });
}

export function useUpdateQuizQuestionIndex() {
  return useCustomApiMutation({
    path: (body) => `assessments/quiz-questions/${body.id}/index`,
    method: "PUT",
    onSuccess: () => {
      console.log("Question Index updated successfully");
    },
    onError: (error) => {
      console.log("Failed to update question index");
      showToast("error", `Failed to update question index ${error.response.data.message}`);
    },
    isSuccessToast: false
  });
}

export function useUpdateAssignmentQuestionIndex() {
  return useCustomApiMutation({
    path: (body) => `assessments/assignment-questions/${body.id}/index`,
    method: "PUT",
    onSuccess: () => {
      console.log("Question updated successfully index");
    },
    onError: (error) => {
      console.log("Failed to update question Index");
      showToast("error", `Failed to update question index ${error.response.data.message}`);
    },
    isSuccessToast: false
  });
}

export function useDeleteQuizQuestion(quizQuestionId: string) {
  return useApiMutation({
    path: `assessments/quiz-questions/${quizQuestionId}`,
    method: "DELETE",
    onSuccess: () => {
      console.log("Question deleted successfully");
    },
    onError: (error) => {
      console.log("Failed to delete question");
      showToast("error", `Failed to delete question ${error.response.data.message}`);
    },
    isSuccessToast: false
  })
}

export function useDeleteAssignmentQuestion(quizQuestionId: string) {
  return useApiMutation({
    path: `assessments/assignment-questions/${quizQuestionId}`,
    method: "DELETE",
    onSuccess: () => {
      console.log("Question deleted successfully");
    },
    onError: (error) => {
      console.log("Failed to delete question");
      showToast("error", `Failed to delete question ${error.response.data.message}`);
    },
    isSuccessToast: false
  })
}

