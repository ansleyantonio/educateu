/* eslint-disable @typescript-eslint/no-explicit-any */

import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  assignFormSchema,
  AssignFormValues,
} from "../../../schema/assignFormSchema";
import { Button } from "@/components/ui/custom_ui/button";
import { UserSearchField } from "@/components/common/search/searchSelectUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { assignToAdmissionOfficer } from "../../../queryClient/queryController";
import { usePathname } from "next/navigation";

interface AssignFormProps {
  assignTo?: any;
  setIsOpenDialog: (valu: boolean) => void;
  assignToUser: any;
  searchText: string;
  setSearchText: any;
  user: any;
  token: string;
  isLoading: boolean;
}

const AssignForm = ({
  assignTo,
  setIsOpenDialog,
  assignToUser,
  searchText,
  setSearchText,
  token,
  isLoading,
}: AssignFormProps) => {
  const applicantId = usePathname().split("/")[3];
  const queryClient = useQueryClient();

  const form = useForm<AssignFormValues>({
    resolver: zodResolver(assignFormSchema),
    defaultValues: {
      userPortalCategoryRoleId: "",
      applicationId: applicantId,
    },
  });

  const assignMutation = useMutation({
    mutationFn: (data: any) => assignToAdmissionOfficer({ token, data }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ["fetch-list-of-assigned-logs"],
      });
      if (data.statusCode === 200) {
        toast.success(data?.message);
        setIsOpenDialog(false);
      } else {
        toast.error(data?.message);
      }
    },
    onError: (error: any) => {
      console.error("Change password error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to change password",
      );
    },
  });

  const onSubmit = (data: AssignFormValues) => {
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

          {/* Assign Date */}
          {/* <div className="relative"> */}
          {/*   <CalendarDays className="absolute left-2 top-1/2 text-gray-500 transform -translate-y-1/2" /> */}
          {/*   <Input */}
          {/*     type="text" */}
          {/*     value={formatDate(new Date())} */}
          {/*     disabled */}
          {/*     className="pl-12 mt-2 text-sm text-gray-500" */}
          {/*   /> */}
          {/* </div> */}

          {/* Assigned By */}
          {/* <SelectedUser user={user} /> */}

          {/* Time */}
          {/* <div className="relative"> */}
          {/*   <Clock className="absolute left-2 top-1/2 text-gray-500 transform -translate-y-1/2" /> */}
          {/*   <Input */}
          {/*     type="text" */}
          {/*     value={formatTime(new Date())} */}
          {/*     disabled */}
          {/*     className="pl-12 mt-2 text-sm text-gray-500" */}
          {/*   /> */}
          {/* </div> */}

          {/* Submit button */}
          <div className="flex justify-end">
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AssignForm;
