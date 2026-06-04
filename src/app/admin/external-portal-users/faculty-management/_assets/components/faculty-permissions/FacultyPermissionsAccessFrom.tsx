/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { useAuths } from "@/hooks/userContext";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  assignCourseSchema,
  IAssignCourseForm,
} from "../../schemas/assignCourseSchema";
import Faculty_Form_field from "../formField/facultyPermissonsForm";

const FacultyPermissionsForm = ({
  setOpen,
  id,
}: {
  setOpen: any;
  id: string;
}) => {
  const auth = useAuths();
  // const token = auth?.user?.accessToken as string;
  const token = auth?.user?.token as string;
  const queryClient = useQueryClient();

  const [resetSignal, setResetSignal] = useState(0);
  const [permissionsPayload, setPermissionsPayload] = useState<any>(null);

  const [permissionsData, setPermissionsData] = useState({
    mainSwitch: false,
    courseSwitches: {},
    permissions: {},
  });

  const onReset = () => {
    form.reset();
    setResetSignal((prev) => prev + 1);
    setPermissionsData({
      mainSwitch: false,
      courseSwitches: {},
      permissions: {},
    });
  };

  const form = useForm<IAssignCourseForm>({
    resolver: zodResolver(assignCourseSchema),
    defaultValues: {},
  });

  const facultyPermissionsMutation = useMutation({
    mutationFn: (values: any) =>
      axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/faculty-management/${id}`,
        values,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      ),
    onSuccess: () => {
      toast.success("Successfully updated faculty permissions!");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["fetch-assigned-courses"] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Something went wrong!";
      toast.error(message);
    },
  });

  const onSubmit = () => {
    if (!permissionsPayload) {
      toast.error("No permissions data generated.");
      return;
    }

    // console.log("✅ Final payload to send:", permissionsPayload?.courseModule.length);
    // console.log("✅ Final payload to send:", permissionsPayload);
    if(permissionsPayload?.courseModule.length === 0){
      toast.error("Can not update Faculty Module")
    }else{
      facultyPermissionsMutation.mutate(permissionsPayload);
    }
  };

  return (
    <FormProvider {...form}>
      <form 
      // onSubmit={form.handleSubmit(onSubmit)} 
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <Faculty_Form_field
            id={id}
            resetSignal={resetSignal}
            onPermissionsChange={setPermissionsData}
            onPayloadChange={(payload) => {
              setPermissionsPayload(payload);
            }}
          />
        </div>

        <div className="flex gap-x-3 justify-between items-center">
          <Button onClick={onReset} type="button" variant="outline">
            Reset
          </Button>
          <Button
            // onClick={onSubmit}
            disabled={facultyPermissionsMutation?.isPending}
            type="submit"
            className="py-2 px-8 bg-[#013E5B] hover:bg-[#73b7d6]"
          >
            {facultyPermissionsMutation?.isPending && (
              <Loader2 className="mr-2 animate-spin" />
            )}
            Save
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default FacultyPermissionsForm;
