/* eslint-disable @typescript-eslint/no-explicit-any */
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";

export const useUpdateAssessmentMutation = ({
  assessmentId,
  onSuccess,
  onError,
}: {
  assessmentId: string;
  onSuccess: (data: any) => void;
  onError: (error: any) => void;
}) => {
  return useApiMutation({
    method: "PATCH",
    path: `assessments/${assessmentId}/status`,
    onSuccess,
    onError: onError,
    isSuccessToast: false,
    isErrorToast: false,
  });
};
