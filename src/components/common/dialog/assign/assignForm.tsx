/* eslint-disable @typescript-eslint/no-explicit-any */

import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import { UserSearchField } from "@/components/common/search/searchSelectUser";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  assignFormSchema,
  AssignFormValues,
} from "../../../../app/admin/admissions/admission/[slug]/assigns/_assets/schema/assignFormSchema";
import { showToast } from "../../TostMessage/customTostMessage";
import ActionButton from "../../button/actionButton";

interface AssignFormProps {
  assignTo?: any;
  setIsOpenDialog: (valu: boolean) => void;
  applicationId: string[];
  assignToUser: any;
  searchText: string;
  setSearchText: any;
  user: any;
  isLoading: boolean;
}

const AssignForm = ({
  assignTo,
  setIsOpenDialog,
  assignToUser,
  searchText,
  setSearchText,
  applicationId,
  isLoading,
}: AssignFormProps) => {
  const queryClient = useQueryClient();

  const form = useForm<AssignFormValues>({
    resolver: zodResolver(assignFormSchema),
    defaultValues: {
      userPortalCategoryRoleId: "",
      applicationId: applicationId,
    },
    mode: "onChange",
  });

  const assignMutation = useApiMutation({
    path: `admission/assigns/application-assignments`,
    method: "POST",
    onSuccess: (data) => {
      showToast("success", data);
      queryClient.invalidateQueries({
        queryKey: [`fetch-list-of-assigned-logs`],
      });
      queryClient.invalidateQueries({
        queryKey: [`fetch-applicant-stage`],
      });
      queryClient.invalidateQueries({
        queryKey: [`list-of-admission-applications-data`],
      });
      setIsOpenDialog(false);
    },
    onError: (error: any) => {
      showToast("error", error);
    },
  });

  const onSubmit = (data: AssignFormValues) => {
    //console.log("data", data);
    assignMutation.mutate(data);
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Assign To */}
          <UserSearchField
            assignTo={assignTo}
            form={form}
            name="userPortalCategoryRoleId"
            label="Assign To"
            searchText={searchText}
            setSearchText={setSearchText}
            users={assignToUser}
            isLoading={isLoading}
          />

          {/* Submit button */}
          <div className="flex justify-end">
            <ActionButton
              handleOpen={() => form.handleSubmit(onSubmit)}
              buttonContent="Assign To"
              loadingContent="Assigning..."
              isPending={assignMutation.isPending}
            />
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AssignForm;
