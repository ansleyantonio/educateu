"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import IconShow from '@/app/admin/_assets/components/root_layout/side_bar_menu/iconShow'
import React from 'react'
import { Form } from '@/components/ui/custom_ui/form';
import { ISettingsForm, SettingsSchema } from '../schemas/settingsSchema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, RotateCcw, SettingsIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApiMutation } from '@/app/hook/TanstackQueries/useApiMutation';
import useFetchData from '@/app/hook/TanstackQueries/useFetchData';
import { Button } from '@/components/ui/custom_ui/button';
import { CustomField } from '@/components/common/fields/cusInputField';

export default function SettingsOptions() {
const form = useForm<ISettingsForm>({
    resolver: zodResolver(SettingsSchema.update),
    // defaultValues: LessonDefaultValue(),
    defaultValues: {
      fileUploadLimit: 0,
    },
  });

const { data, isLoading } = useFetchData({
    path: "system-settings",
    queryKey: "system-settings",
  });

  const settingsMutation = useApiMutation({
    method: "POST",
    path: "system-settings",
    onSuccess: () => {
      toast.success("Successfully created Awarding Body!");
      form.reset();
    },
    onError: (error: any) => {
      console.error("Error creating awarding body:", error);
      toast.error(
        error?.response?.data?.message || "Failed to create awarding body"
      );
    },
  });


  function onSubmit(values: ISettingsForm) {
    console.log(values);
    }

  //   if (isLoading) {
  //   return (
  //     <div className="flex justify-center items-center h-full">
  //       <Loader2 className="animate-spin" />
  //     </div>
  //   );
  // }
  return (
    <div className="p-4 w-full max-h-screen">
      <div className="flex justify-start">
        <div
          className="flex justify-start items-center gap-2"
          // title="log and Change Password"
        >
            <h1 className="text-black text-2xl">System Settings</h1>
                        <SettingsIcon 
              className="text-[#013E5B] rounded-md w-8 h-8"
            />
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="animate-spin" />
            </div>
          ) : ( */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              <CustomField.Number
                name="fileUploadLimit"
                labelName="Course Material File Upload Limit (in MB)"
                placeholder="File Upload Limit (in MB)"
                form={form}
                // defaultValue={data?.fileUploadLimit || 5}
              />
              <CustomField.Number
                name="fileUploadLimit"
                labelName="Additional Document File Upload Limit (in MB)"
                placeholder="File Upload Limit (in MB)"
                form={form}
                defaultValue={data?.fileUploadLimit || 5}
              />
              <CustomField.Number
                name="fileUploadLimit"
                labelName="Certificate File Upload Limit (in MB)"
                placeholder="File Upload Limit (in MB)"
                form={form}
                // defaultValue={data?.fileUploadLimit || 5}
              />
              <CustomField.Number
                name="fileUploadLimit"
                labelName="Financial Report File Upload Limit (in MB)"
                placeholder="File Upload Limit (in MB)"
                form={form}
                // defaultValue={data?.fileUploadLimit || 5}
              />
            </div>
          {/* )} */}
          <div className="flex gap-x-3 justify-end items-center mt-5">
            <Button
              type="button"
              onClick={() => form.reset()}
              variant="outline"
            >
              <RotateCcw />
              Reset
            </Button>
            <Button
              disabled={settingsMutation.isPending}
              type="submit"
              className="py-2 px-8 bg-[#013E5B] hover:bg-[#73b7d6]"
            >
              {settingsMutation.isPending && (
                <Loader2 className="animate-spin" />
              )}{" "}
              Update
            </Button>
          </div>
        </form>
      </Form>
      {/* <div className="flex gap-x-2 justify-start items-center px-6 pb-6 mt-8">
        <InfoIcon className="w-5 h-5" />
        <h1 className="text-sm font-semibold leading-5 text-[#555F6D]">
          <span> To modify</span>
          &nbsp;
          <span className="font-bold text-[#272E35]">
            campus, course, intake, year of entry or study preferences,
          </span>
          you will be required to reset course details.
        </h1>
      </div> */}
    </div>
  )
}

