/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Form } from "@/components/ui/form";
import { useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { FacultySchema, IFacultyForm } from "../../schemas/facultySchema";
import { FacultyDefaultValue } from "../../utils/facultyDefaultValue";
import Update_Form_field from "../formField/update_form_field";
import ActionButton from "@/components/common/button/actionButton";
import { useAuths } from "@/hooks/userContext";

interface FormProps {
  setOpen: (open: boolean) => void;
  data: any;
  editView?: boolean;
  setEditView?: (data: boolean) => void;
}

const UpdateFacultyFrom = ({
  setOpen,
  data,
  editView,
  setEditView,
}: FormProps) => {
  const queryClient = useQueryClient();
  const { editAccess } = useAuths();

  const form = useForm<IFacultyForm>({
    resolver: zodResolver(FacultySchema.update),
    defaultValues: FacultyDefaultValue(data),
    mode: "onChange",
  });

  const updateFacultyMutation = useApiMutation({
    method: "PATCH",
    path: `faculty-management/${data?.id}`,
    onSuccess: () => {
      showToast("success", "Successfully updated user!");
      form.reset();
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["fetch-list-of-faculties"] });
    },
    onError: (error: any) => {
      showToast("error", error?.response?.data?.message || "Failed to update");
    },
  });

  const handleSubmit = () => {
    form.handleSubmit((values) => updateFacultyMutation.mutate(values))();
  };

  return (
    <Form {...form}>
      <form className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <Update_Form_field viewOnly={editView} form={form} />
        </div>

        <div className="flex gap-x-3 justify-end items-center">
          {!editView && (
            <div className="flex gap-x-3 justify-end items-center">
              <ActionButton
                buttonContent="Cancel"
                type="button"
                variant="outline"
                handleOpen={() => setOpen(false)}
              />
              <ActionButton
                buttonContent="Update"
                variant="primary"
                isPending={updateFacultyMutation?.isPending}
                loadingContent="Updating"
                handleOpen={handleSubmit}
              />
            </div>
          )}
        </div>
      </form>
    </Form>
  );
};

export default UpdateFacultyFrom;
