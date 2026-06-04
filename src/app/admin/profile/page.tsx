/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/custom_ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useAuths } from "@/hooks/userContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { InfoIcon, Loader2, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import IconShow from "../_assets/components/root_layout/side_bar_menu/iconShow";
import { UpdateUserFormSchema } from "../user-management/_assets/interface/CreateUserSchema";
import { UpdateUserDefaultValues } from "./_assets/utils/userDefaultValue";
import security from "/public/assets/logo/agent/security-password.svg";

const AgentProfile = () => {
  const auth = useAuths();
  const queryClient = useQueryClient();
  const token = auth?.user?.token;
  const id = auth?.user?.userId;
  const userEmail = auth?.user?.email;
  const userName = auth?.user?.username;
  const userPortalName = auth?.user?.portName;

  const fieldNames = [
    "firstName",
    "lastName",
    "username",
    "email",
    "mobile",
  ] as const;

  const { data, isLoading } = useFetchData({
    queryKey: "user-data",
    path: `user-management/user/users/${id}`,
    method: "GET",
  });

  console.log("user data", data);
  // const { data, isLoading } = useQuery({
  //   queryKey: ["user-data", { id, token }],
  //   queryFn: fetchUserData,
  //   enabled: !!id && !!token,
  // });

  const form = useForm<z.infer<typeof UpdateUserFormSchema>>({
    resolver: zodResolver(UpdateUserFormSchema),
    defaultValues: UpdateUserDefaultValues(data?.user),
  });

  useEffect(() => {
    if (data?.user) {
      form.reset(UpdateUserDefaultValues(data.user));
    }
  }, [data, form]);

  const updateUserMutation = useApiMutation({
    safe: false,
    path: `user-management/user/users/${id}/`,
    method: "PATCH",

    onSuccess: (data) => {
      toast.success("Successfully updated user!");
      form.reset({});
      queryClient.invalidateQueries({
        queryKey: ["user-data"],
      });
    },

    onError: (error: any) => {
      console.error("Update error:", error);
      showToast("error", error || "Failed to update");
    },
  });

  const checkUserExistence = async (field: string, value: string) => {
    if (!value) return null;
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/user-management/user/check-user?userid=${id}&username=${userName}&email=${userEmail}&portal=${userPortalName}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.exists;
  };

  const useCheckUserExistence = (field: string, value: string) =>
    useQuery({
      queryKey: ["check-user", field, value],
      queryFn: () => checkUserExistence(field, value),
      enabled: !!value,
      staleTime: 10000,
    });

  const usernameQuery = useCheckUserExistence(
    "username",
    form.watch("username") || ""
  );
  const emailQuery = useCheckUserExistence("email", form.watch("email") || "");
  // const mobileQuery = useCheckUserExistence(
  //   "mobile",
  //   form.watch("mobile") || ""
  // );

  const onSubmit = (values: z.infer<typeof UpdateUserFormSchema>) => {
    updateUserMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 w-full max-h-screen">
      <div className="flex justify-end">
        <div
          className="flex flex-col justify-end items-center w-10 h-10"
          // title="log and Change Password"
        >
          <Link
            href="/admin/password"
            className={`flex  gap-2 xl:gap-3 w-full h-full items-center justify-start p-2 xl:p-3 rounded-md bg-black  transition-all hover:bg-[#002F45]`}
          >
            <IconShow
              navigation={false}
              path={security}
              alt={"security"}
              name={"log and change password"}
            />
          </Link>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <>
              {fieldNames.map((fieldName) => (
                <FormField
                  key={fieldName}
                  control={form.control}
                  name={fieldName}
                  render={({ field }) => (
                    <FormItem>
                      <label className="cusFormLabel">
                        {fieldName === "mobile"
                          ? "Mobile Number"
                          : `${
                              fieldName.charAt(0).toUpperCase() +
                              fieldName.slice(1)
                            }`}{" "}
                        <small>
                          ({fieldName !== "mobile" ? "Required" : "Optional"})
                        </small>
                      </label>
                      <FormControl>
                        <Input
                          placeholder={`Enter Your ${
                            fieldName === "mobile" ? "Mobile Number" : fieldName
                          } Here`}
                          {...field}
                          value={field.value || ""} // Ensure value is never null
                        />
                      </FormControl>
                      <FormMessage>
                        {fieldName === "username" && usernameQuery.isLoading
                          ? "Checking..."
                          : fieldName === "username" && usernameQuery.data
                          ? "Username already exists!"
                          : fieldName === "email" && emailQuery.isLoading
                          ? "Checking..."
                          : fieldName === "email" && emailQuery.data
                          ? "Email already exists!"
                          : // : fieldName === "mobile" &&
                            //     mobileQuery.isLoading
                            //   ? "Checking..."
                            //   : fieldName === "mobile" && mobileQuery.data
                            //     ? "Mobile number already exists!"
                            ""}
                      </FormMessage>
                    </FormItem>
                  )}
                />
              ))}{" "}
            </>
          )}
          <div className="flex gap-x-3 justify-end items-center">
            <Button
              type="button"
              onClick={() => form.reset()}
              variant="outline"
            >
              <RotateCcw />
              Reset
            </Button>
            <Button
              disabled={updateUserMutation.isPending}
              type="submit"
              className="py-2 px-8 bg-[#013E5B] hover:bg-[#73b7d6]"
            >
              {updateUserMutation.isPending && (
                <Loader2 className="animate-spin" />
              )}{" "}
              Update
            </Button>
          </div>
        </form>
      </Form>
      <div className="flex gap-x-2 justify-start items-center px-6 pb-6 mt-8">
        <InfoIcon className="w-5 h-5" />
        <h1 className="text-sm font-semibold leading-5 text-[#555F6D]">
          <span> To modify</span>
          &nbsp;
          <span className="font-bold text-[#272E35]">
            campus, course, intake, year of entry or study preferences,
          </span>
          you will be required to reset course details.
        </h1>
      </div>
    </div>
  );
};

export default AgentProfile;
