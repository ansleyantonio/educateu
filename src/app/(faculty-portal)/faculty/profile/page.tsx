/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { UpdateUserFormSchema } from "@/app/admin/user-management/_assets/interface/CreateUserSchema";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { CustomField } from "@/components/common/fields/cusInputField";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useAuths } from "@/hooks/userContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { InfoIcon, Loader2, RotateCcw, Share2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import IconShow from "../_assets/components/root_layout/side_bar_menu/iconShow";
import security from "/public/assets/logo/agent/security-password.svg";

const AgentProfile = () => {
  const [isEdit, setIsEdit] = useState(true);
  const auth = useAuths();
  const token = auth?.user?.token;
  const id = auth?.user?.userId;

  // const { data, isLoading } = useQuery({
  //   queryKey: ["user-data", { id, token }],
  //   queryFn: fetchUserData,
  //   enabled: !!id && !!token,
  // });

  const { data, isLoading } = useFetchData({
    token,
    // filterData: {},
    path: `faculty/${id}`,
    queryKey: "user-data",
  });

  const form = useForm<z.infer<typeof UpdateUserFormSchema>>({
    resolver: zodResolver(UpdateUserFormSchema),
    defaultValues: {
      ...data?.data[0],
      mobile: data?.data[0].mobile || "", // Convert null to empty string
    },
  });

  useEffect(() => {
    if (data?.data[0]) {
      form.reset({
        ...data?.data[0],
        mobile: data?.data[0].mobile || "",
      });
    }
  }, [data, form]);

  const queryClient = useQueryClient();

  const updateUserMutation = useMutation({
    mutationFn: (updatedUser: any) =>
      axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/faculty/${id}/`,
        updatedUser,
        //faculty-management/${id}
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      ),
    onSuccess: () => {
      toast.success("Successfully updated user!");
      form.reset({});
      queryClient.invalidateQueries({ queryKey: ["user-data"] });
    },
    onError: (error: any) => {
      console.error("Update error:", error);
      toast.error(error?.response?.data?.message || "Failed to update user");
    },
  });

  const checkUserExistence = async (field: string, value: string) => {
    if (!value) return null;
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/user-management/user/check-user?userid=${id}&${field}=${value}`,
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
  const mobileQuery = useCheckUserExistence(
    "mobile",
    form.watch("mobile") || ""
  );

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
            href="/faculty/password"
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
              <div className="flex justify-between items-center">
                <CustomField.UploadProfilePicture
                  form={form}
                  name="photo"
                  labelName="Profile Image"
                  viewOnly={isEdit}
                />
                {/* {data?.data[0].socail_linkedin && (
                  
                )} */}
                <Button
                  disabled={!data?.data[0].websiteUrl}
                  onClick={() => {
                    // Open new tab with URL
                    window.open(`${data?.data[0].websiteUrl}`, "_blank");
                  }}
                  type="button"
                  variant={"primary"}
                >
                  <Share2 />
                  LinkedIn
                </Button>
              </div>
              <CustomField.Text
                form={form}
                name="firstName"
                labelName="first Name"
                placeholder="first Name"
                optional={false}
                viewOnly={isEdit}
              />
              {!isEdit && (
                <CustomField.Text
                  form={form}
                  name="websiteUrl"
                  labelName="LinkedIn Profile"
                  placeholder="inkedIn Profile"
                />
              )}
              <CustomField.Text
                form={form}
                name="lastName"
                labelName="last Name"
                placeholder="last Name"
                optional={false}
                viewOnly={isEdit}
              />
              <CustomField.Text
                form={form}
                name="username"
                labelName="username"
                placeholder="username"
                optional={false}
                customMessage={
                  usernameQuery.isLoading
                    ? "Checking..."
                    : usernameQuery.data
                    ? "Username already exists!"
                    : ""
                }
                viewOnly={isEdit}
              />
              <CustomField.Text
                form={form}
                name="email"
                labelName="email"
                placeholder="email"
                optional={false}
                viewOnly={isEdit}
                customMessage={
                  emailQuery.isLoading
                    ? "Checking..."
                    : emailQuery.data
                    ? "Email already exists!"
                    : ""
                }
              />

              <CustomField.PhoneNumber
                form={form}
                name="mobile"
                labelName="mobile"
                placeholder="mobile"
                optional={false}
                customMessage={
                  emailQuery.isLoading
                    ? "Checking..."
                    : emailQuery.data
                    ? "Email already exists!"
                    : ""
                }
                viewOnly={isEdit}
              />
            </>
          )}
          <div className="flex gap-x-3 justify-end items-center">
            <Button
              type="button"
              onClick={() => {
                setIsEdit(true);
                form.reset();
              }}
              variant="outline"
            >
              <RotateCcw />
              Reset
            </Button>
            {!isEdit ? (
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
            ) : (
              <div
                className="border px-6 py-1 rounded-md cursor-pointer"
                onClick={() => setIsEdit(false)}
                // type="button"
                // variant="outline"
              >
                Edit
              </div>
            )}
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
