/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useAuths } from "@/hooks/userContext";
import axios from "axios";
import { RemoveEmptyFields } from "@/utils/common/RemoveEmptyFields";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { FacultySchema, IFacultyForm } from "../../schemas/facultySchema";
import { FacultyDefaultValue } from "../../utils/facultyDefaultValue";
import Form_field from "../formField/form_field";

const CreateFacultyForm = ({
  setOpen,
}: {
  setOpen: (data: boolean) => void;
}) => {
  const auth = useAuths();
  const token = auth?.user?.token as string;
  const form = useForm<IFacultyForm>({
    resolver: zodResolver(FacultySchema.create),
    defaultValues: FacultyDefaultValue(),
  });

  const queryClient = useQueryClient();

  // const queryClient = useMutation();

  // createNewSubAgentMutation
  const createNewFacultyMutation = useApiMutation({
    method: "POST",
    path: "faculty-management/register",
    // token,

    onSuccess: (data) => {
      // console.log("data create new user----atik", data);
      showToast("success", "Successfully created user!", { duration: 5000 });
      // toast.success("Successfully created user!");
      form.reset(); // form reset logic
      setOpen(false); // close modal
      queryClient.invalidateQueries({ queryKey: ["fetch-list-of-faculties"] });
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onError: (error) => {
      showToast("error", error);
    },
  });

  const username = useWatch({
    control: form.control,
    name: "username",
  });

  const email = useWatch({
    control: form.control,
    name: "email",
  });

  const checkUserExistence = async (field: string, value: string) => {
    if (!value) return null;
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/user-management/user/check-user?username=${username}&email=${email}&portal=faculty`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.exists; // Assume API returns { exists: true/false }
  };

  const useCheckUserExistence = (field: string, value: string) => {
    return useQuery({
      queryKey: ["check-user", field, value],
      queryFn: () => checkUserExistence(field, value),
      enabled: !!value, // Only run query if value exists
      staleTime: 1000 * 10, // Cache for 10 seconds
    });
  };

  const usernameQuery = useCheckUserExistence(
    "username",
    form.watch("username")
  );
  const emailQuery = useCheckUserExistence("email", form.watch("email"));

  //. Define a submit handler.
  function onSubmit(values: IFacultyForm) {
    // createNewAgentMutation.mutate(values);
    const newLesson = RemoveEmptyFields(values);
    // console.log("new faculty", newLesson);

    // remove confirmPassword from the newLesson object
    delete newLesson.confirmPassword;

    createNewFacultyMutation.mutate(newLesson);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Form_field
          form={form}
          usernameQuery={usernameQuery}
          emailQuery={emailQuery}
          // mobileQuery={mobileQuery}
        />

        {/* login button  */}
        <div className="flex gap-x-3 justify-end items-center">
          <Button
            className="capitalize"
            onClick={() => setOpen(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button type="submit" className="capitalize">
            submit
            {createNewFacultyMutation.isPending && (
              <Loader2Icon className="animate-spin" />
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateFacultyForm;
