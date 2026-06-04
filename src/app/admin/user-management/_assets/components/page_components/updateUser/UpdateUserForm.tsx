/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useAuths } from "@/hooks/userContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { z } from "zod";
import { UpdateUserFormSchema } from "../../../interface/CreateUserSchema";
import Form_field from "./form_field";

const UpdateUserForm = ({
  setOpen,
  user,
  isLoading,
  portalList,
  onSuccess,
  refetchFilteredUserList,
}: {
  setOpen: any;
  isLoading: any;
  portalList: any;
  user: any;
  onSuccess?: () => void;
  refetchFilteredUserList?: () => void;
}) => {
  const auth = useAuths();
  const token = auth?.user?.token;

  // const agentRole = auth?.user?.user?.userRoles[0]?.id as string;
  // const agentName = auth?.user?.user?.userRoles[0]?.role?.name as string;
  // const token = auth?.user?.accessToken as string;
  const queryClient = useQueryClient();

  // const [selected, setSelected] = useState<{ label: string; value: string }[]>(
  //   []
  // );

  // console.log(" portal list", portalList);
  // console.log(" user data", user);

  const form = useForm<z.infer<typeof UpdateUserFormSchema>>({
    resolver: zodResolver(UpdateUserFormSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      // mobile: user?.mobile ? user?.mobile : "",
      mobile: user?.mobile ? user?.mobile : "",
    },
  });

  // createNewSubAgentMutation
  const createNewSubAgentMutation = useMutation({
    mutationFn: (newApplication: any) => {
      return axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/user-management/user/users/${user.id}/`,
        newApplication,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    },
    onSuccess: () => {
      //
      refetchFilteredUserList?.();
      toast.success("Successfully created user!");
      form.reset();
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["fetch-list-of-users"] });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      console.log("error", error?.response);
      if (error) {
        showToast("error", error);
      }
    },
  });

  // -------------------------real time check  start -------------------------------------------

  const checkUserExistence = async (field: string, value: string) => {
    if (!value) return null;
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/user-management/user/check-user?userid=${user.id}&${field}=${value}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.exists; // Assume API returns { exists: true/false }
  };
  const useCheckUserExistence = (field: string, value: string) => {
    return useQuery({
      queryKey: ["check-user", field, value, token],
      queryFn: () => checkUserExistence(field, value),
      enabled: !!value, // Only run query if value exists
      staleTime: 1000 * 10, // Cache for 10 seconds
    });
  };
  const usernameQuery = useCheckUserExistence(
    "username",
    form.watch("username") || ""
  );
  const emailQuery = useCheckUserExistence("email", form.watch("email") || "");
  const mobileQuery = useCheckUserExistence(
    "mobile",
    form.watch("mobile") || ""
  );

  // -------------------------real time check  end -------------------------------------------

  //. Define a submit handler.
  function onSubmit(values: z.infer<typeof UpdateUserFormSchema>) {
    console.log(values);
    createNewSubAgentMutation.mutate(values);
    // console.log("user create data", values);
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
            form={form}
            // selected={selected}
            // setSelected={setSelected}
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
            Update
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UpdateUserForm;
