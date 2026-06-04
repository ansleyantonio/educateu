/* eslint-disable @typescript-eslint/no-explicit-any */

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { usePathname } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { updateRequestFormSchema, UpdateRequestFormValues } from "./schema";
import { updateRequestController } from "./updateRequestController";

interface updateRequestFormProps {
  setIsOpenDialog: (value: boolean) => void;
  value: string;
}

interface NoteTitle {
  [key: string]: {
    id: string;
    label: string;
  }[];
}
const items: NoteTitle = {
  "supporting-documents": [
    { id: "qualification", label: "Qualification" },
    { id: "nationalIdentification", label: "National Identification" },
    { id: "policeClearance", label: "References" },
    { id: "references", label: "Personal Statement" },
  ],
  "others-documents": [
    {
      id: "englishCertificates",
      label: "English Certificates",
    },
    { id: "essay", label: "Essay" },
    { id: "cv", label: "CV" },
    { id: "passportId", label: "Passport/ID" },
    {
      id: "proofOfNameChange",
      label: "Proof of name change",
    },
    { id: "transcripts", label: "Transcripts" },
    {
      id: "otherDocument",
      label: "Attachment (Attach a file if necessary)",
    },
  ],
};

export default function UpdateRequestForm({
  value,
  setIsOpenDialog,
}: updateRequestFormProps) {
  const applicationId = usePathname().split("/")[3];
  const auth = useAuths();
  const token = auth?.user?.token;

  const form = useForm<UpdateRequestFormValues>({
    resolver: zodResolver(updateRequestFormSchema),
    defaultValues: { [value]: true },
  });

  const updateMutation = useMutation({
    mutationFn: (reqData: any) => updateRequestController(reqData),
    onSuccess: (data: any) => {
      // console.log("res data-----------------", data);
      if (data?.statusCode === 200) {
        setIsOpenDialog(false);
        toast.success(data?.message);
      }
      // toast.error(data?.message);
    },
    onError: (error) => {
      toast.error(error?.message);
    },
  });

  const onSubmit = (data: UpdateRequestFormValues) => {
    //

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
      body: transformed,
      applicationId: applicationId,
      token: token,
    };

    updateMutation.mutate(reqData);
  };

  return (
    <div>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {items[value].map((item) => (
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
            <Button
              // onClick={(e) => e.preventDefault}
              type="submit"
              variant="primary"
            >
              Submit
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
