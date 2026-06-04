/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useAuths } from "@/hooks/userContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CreateUserFormSchema } from "../../interface/CreateUserSchema";
import Form_field from "./form_field";
// import { DeleteObjectKey } from "@/utils/DeleteObjectKey";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { DeleteEmptyKeys } from "@/utils/DeleteObjectKey";

const CreateUserForm = ({
  setOpen,
  isLoading,
  portalList,
  roleList,
}: {
  setOpen: any;
  isLoading: any;
  portalList: any;
  roleList: any;
}) => {
  const auth = useAuths();
  // const agentRole = auth?.user?.user?.userRoles[0]?.id as string;
  // const agentName = auth?.user?.user?.userRoles[0]?.role?.name as string;
  const token: string | undefined = auth?.user?.token;
  const queryClient = useQueryClient();

  // console.log("ROle List in Create User Form", roleList);

  const [selected, setSelected] = useState<{ label: string; value: string }[]>(
    []
  );
  const form = useForm<z.infer<typeof CreateUserFormSchema>>({
    resolver: zodResolver(CreateUserFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      password: "",
      email: "",
      mobile: "",
      // portalCategoryId: "",
      // RoleId: []
      RoleId: { label: "", value: "" },
      // portalCategoryId: [],
    },
  });

  // createNewSubAgentMutation
  // const createNewSubAgentMutation = useMutation({
  //   mutationFn: (newApplication: any) => {
  //     return axios.post(
  //       `${process.env.NEXT_PUBLIC_API_URL}/user-management/user/register/`,
  //       newApplication,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //   },
  //   onSuccess: () => {
  //     //
  //     toast.success("Successfully created user!");
  //     form.reset();
  //     setOpen(false);
  //     queryClient.invalidateQueries({ queryKey: ["fetch-list-of-users"] });
  //   },
  //   onError: (error: any) => {
  //     console.log("error", error?.response);
  //     if (error?.response) {
  //       toast.error(error.response?.data?.message);
  //     }
  //   },
  // });

  const createNewSubAgentMutation = useApiMutation({
    method: "POST",
    path: "user-management/user/register",
    // token,

    onSuccess: (data) => {
      console.log("data create new user----atik", data);
      showToast("success", "Successfully created user!", { duration: 5000 });
      // toast.success("Successfully created user!");
      form.reset(); // form reset logic
      queryClient.invalidateQueries({ queryKey: ["fetch-list-of-users"] });
      queryClient.invalidateQueries({ queryKey: ["fetch-list-of-portal"] });
      queryClient.invalidateQueries({ queryKey: ["fetch-list-of-roles"] });
      setOpen(false); // close modal
    },
    onError: (error) => {
      showToast("error", error, { duration: 5000 });
    },
  });

  // -------------------------real time check  start -------------------------------------------

  const checkUserExistence = async (field: string, value: string) => {
    if (!value) return null;
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/user-management/user/check-user?${field}=${value}`,
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
    form.watch("username") || ""
  );
  const emailQuery = useCheckUserExistence("email", form.watch("email"));
  const mobileQuery = useCheckUserExistence(
    "mobile",
    form.watch("mobile") || ""
  );

  // -------------------------real time check  end -------------------------------------------

  //. Define a submit handler.
  // function onSubmit(values: z.infer<typeof CreateUserFormSchema>) {

  //   // console.log("VALUES FROM FORM", values);
  //   const newUserData = {
  //     ...values,
  //     roleId: values.RoleId?.value,
  //     roleName: values.RoleId?.label
  //   };
  //   // console.log("VALUES OF ITEM", newUserData);
  //   createNewSubAgentMutation.mutate(newUserData);
  //   // createNewSubAgentMutation.mutate(values);
  //   // console.log("user create data", newUserData);
  // }

  function onSubmit(values: z.infer<typeof CreateUserFormSchema>) {
    const newUserData = {
      ...values,
      roleId: values.RoleId?.value,
      roleName: values.RoleId?.label,
    };

    // if (newUserData.roleId == null || newUserData.roleId === "") delete newUserData.roleId;
    // if (newUserData.roleName == null || newUserData.roleName === "") delete newUserData.roleName;
    // DeleteObjectKey(newUserData, ["roleId", "roleName"])
    DeleteEmptyKeys(newUserData);

    createNewSubAgentMutation.mutate(newUserData);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
          {isLoading && (
            <div className="flex-col justify-center items-center w-full h-full">
              <Loader2 className="animate-spin" />
            </div>
          )}
          <Form_field
            usernameQuery={usernameQuery}
            emailQuery={emailQuery}
            mobileQuery={mobileQuery}
            portalList={portalList}
            roleList={roleList}
            form={form}
            selected={selected}
            setSelected={setSelected}
          />
        </div>

        {/* login button  */}
        <div className="flex gap-x-3 justify-end items-center">
          <Button
            onClick={() => setOpen(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={createNewSubAgentMutation?.isPending}
            type="submit"
            className="py-2 px-8 bg-[#013E5B] hover:bg-[#73b7d6]"
          >
            {createNewSubAgentMutation?.isPending && (
              <Loader2 className="animate-spin" />
            )}
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateUserForm;
