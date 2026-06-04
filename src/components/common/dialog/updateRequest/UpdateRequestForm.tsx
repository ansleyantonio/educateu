/* eslint-disable @typescript-eslint/no-explicit-any */

import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/custom_ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuths } from "@/hooks/userContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { showToast } from "../../TostMessage/customTostMessage";
import { updateRequestFormSchema, UpdateRequestFormValues } from "./schema";
import { updateRequestController } from "./updateRequestController";

interface updateRequestFormProps {
  setIsOpenDialog: (valu: boolean) => void;
  value: string;
}

const items = [
  { id: "personal_information", label: "Personal Information" },
  { id: "academic_background", label: "Academic Background" },
  { id: "course_selection", label: "Course Selection" },
  { id: "personal_statement", label: "Personal Statement" },
  { id: "disability_and_accessibility", label: "Disability and Accessibility" },
  { id: "next_of_kin", label: "Next of Kin" },
  { id: "funds", label: "Funds" },
  { id: "references", label: "References" },
  { id: "criminal_background", label: "Criminal Background" },
  // { id: "supporting_documents", label: "Supporting Documents" },
];

export default function UpdateRequestForm({
  value,
  setIsOpenDialog,
}: updateRequestFormProps) {
  const applicationId = usePathname().split("/")[4];
  // console.log("applicationId-----", applicationId);
  const auth = useAuths();
  const token = auth?.user?.token;

  console.log("value", value);

  const steps = [
    "courseSelection",
    "personalInformation",
    "academicBackground",
    "personalStatement",
    "disabilityAndAccessibility",
    "nextOfKin",
    "fund",
    "reference",
    "criminalBackground",
  ];

  const schemaStep = [
    "course_selection",
    "personal_information",
    "academic_background",
    "personal_statement",
    "disability_and_accessibility",
    "next_of_kin",
    "funds",
    "references",
    "criminal_background",
  ];

  const index = steps.indexOf(value);

  const findStep = schemaStep[index];

  const form = useForm<UpdateRequestFormValues>({
    resolver: zodResolver(updateRequestFormSchema),
    defaultValues: { [findStep]: true },
  });

  const updateMutation = useApiMutation({
    path: `admission/notes/application?applicationId=${applicationId}`,
    method: "POST",
    isErrorToast: false,
    onSuccess: (data) => {
      // showToast("success", data);
      setIsOpenDialog(false);
    },
  });

  const updateMutations = useMutation({
    mutationFn: (reqData: any) => updateRequestController(reqData),
    onSuccess: (data: any) => {
      console.log("res data", data);
      if (data?.statusCode === 200) {
        toast.success(data?.message);
      }
      // toast.error(data?.message);
    },
    onError: (error) => {
      toast.error(error?.message);
    },
  });

  // default checked value

  const onSubmit = async (data: UpdateRequestFormValues) => {
    const transformed = Object.entries(data)
      .filter(([key, value]) => {
        return (
          !key.endsWith("Note") &&
          value === true &&
          typeof data[`${key}Note` as keyof UpdateRequestFormValues] ===
            "string"
        );
      })
      .map(([key]) => ({
        fieldName: key,
        type: "UPDATE_REQUEST",
        note: data[`${key}Note` as keyof UpdateRequestFormValues] ?? "",
      }));

    const reqData = {
      applicationId,
      token,
    };

    try {
      // run all requests in parallel
      await Promise.all(
        transformed.map((item: any) => updateMutation.mutateAsync(item))
      );

      // only runs if all succeed
      showToast("success", "Update Request Sent Successfully");
      setIsOpenDialog(false);
    } catch (error: any) {
      showToast("error", error);
      // error is already handled in useApiMutation.onError
      console.error("Update failed", error);
    }
  };

  // const onSubmit = (data: UpdateRequestFormValues) => {
  //   const transformed = Object.entries(data)
  //     .filter(([key, value]) => {
  //       return (
  //         !key.endsWith("Note") &&
  //         value === true &&
  //         typeof data[`${key}Note` as keyof UpdateRequestFormValues] ===
  //           "string"
  //       );
  //     })
  //     .map(([key]) => ({
  //       fieldName: key,
  //       type: "UPDATE_REQUEST",
  //       note: data[`${key}Note` as keyof UpdateRequestFormValues] ?? "",
  //     }));

  //   const reqData = {
  //     body: transformed,
  //     applicationId: applicationId,
  //     token: token,
  //   };

  //   for (const item of transformed) {
  //     updateMutation.mutateAsync(reqData); // call mutation for each item
  //   }
  //   showToast("success", "Update Request Sent Successfully");
  //   // updateMutations.mutate(reqData);
  // };

  return (
    <div>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {items.map((item) => (
            <div key={item.id} className="space-y-2">
              {/* Checkbox */}
              <FormField
                control={form.control}
                name={item.id as keyof UpdateRequestFormValues}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                    <FormControl>
                      <Checkbox
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      {item.label}
                    </FormLabel>
                  </FormItem>
                )}
              />

              {/* Conditional Textarea Field */}
              {form.watch(item.id as keyof UpdateRequestFormValues) && (
                <FormField
                  control={form.control}
                  name={`${item.id}Note` as keyof UpdateRequestFormValues}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-light">
                        Add a message for {item.label}
                      </FormLabel>
                      <FormControl>
                        {/* Only textarea inside FormControl */}
                        <textarea
                          {...field}
                          value={
                            typeof field.value === "string" ? field.value : ""
                          }
                          className="py-2 px-3 w-full text-sm rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none placeholder:text-gray-400"
                          rows={5}
                          placeholder="Write here the details"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          ))}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsOpenDialog(false)}
            >
              Cancel
            </Button>
            <Button disabled={updateMutation.isPending} variant="primary">
              Submit
              {updateMutation.isPending && (
                <Loader2 className="animate-spin ml-2" size={16} />
              )}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
