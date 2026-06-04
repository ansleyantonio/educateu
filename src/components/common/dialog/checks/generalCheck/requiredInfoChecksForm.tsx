/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/custom_ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea"; // Import Textarea component
import { CamelToTitle } from "@/utils/CaseConverter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { NoteGeneralFileCheck } from "../queryController";

interface RequiredInfoChecksFormProps {
  checkItemNames: { name: string; status: string }[];
  token: string;
  setIsOpenDialog: (value: boolean) => void;
  id: string;
}

export default function RequiredInfoChecksForm({
  checkItemNames,
  token,
  setIsOpenDialog,
  id,
}: RequiredInfoChecksFormProps) {
  const applicationId = id;

  // console.log("applicationId", applicationId);

  const alreadyUploadedItems = checkItemNames?.map((doc) => ({
    id: doc.name,
    label: CamelToTitle(doc.name),
    status: doc.status ?? "",
  }));

  const InitialFile = [
    {
      id: "nationalIdentification",
      label: "National Identification",
    },
    {
      id: "policeClearance",
      label: "Police Clearance",
    },
    {
      id: "references",
      label: "References",
    },
    {
      id: "qualification",
      label: "Qualification",
    },
    {
      id: "cv",
      label: "CV",
    },
    {
      id: "englishCertificates",
      label: "EnglishCertificates",
    },
    {
      id: "essay",
      label: "Qualification",
    },
    {
      id: "passportId",
      label: "PassportId",
    },
    {
      id: "proofOfNameChange",
      label: "ProofOfNameChange",
    },
    {
      id: "transcripts",
      label: "Transcripts",
    },
    {
      id: "otherDocument",
      label: "OtherDocument",
    },
  ];

  const items = InitialFile.map((file) => {
    const uploadedItem = alreadyUploadedItems?.find(
      (upload) => upload.id === file.id
    );
    return {
      ...file,
      uploaded: !!uploadedItem,
      status: uploadedItem ? uploadedItem.status : "NOT_UPLOADED",
    };
  });

  // console.log("items ----", items);

  const schema = useMemo(() => {
    const shape: Record<string, z.ZodTypeAny> = {};

    items?.forEach((item) => {
      shape[item.id] = z.boolean().optional();
      shape[`${item.id}Note`] = z
        .string()
        .min(3, { message: "Note must be at least 3 characters" })
        .optional();
    });

    return z.object(shape).superRefine((data, ctx) => {
      items?.forEach(({ id }) => {
        if (data[id] && !data[`${id}Note`]) {
          ctx.addIssue({
            path: [`${id}Note`],
            code: z.ZodIssueCode.custom,
            message: `${id
              .replace(/([A-Z])/g, " $1")
              .trim()} note is required because checkbox is selected.`,
          });
        }
      });
    });
  }, [items]);

  type RequiredInfoChecksFormValues = z.infer<typeof schema>;

  const form = useForm<RequiredInfoChecksFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {},
  });

  const checkMutation = useMutation({
    mutationFn: (checkData: any) => NoteGeneralFileCheck(checkData),
    onSuccess: (data: any) => {
      // console.log("data success", data);
      setIsOpenDialog(false);
      if (data?.statusCode === 200) {
        toast.success(data?.message);
      } else {
        toast.error(data?.message);
      }
    },
    onError: (error: Error) => {
      console.log("error ----", error);
      toast.error(error?.message);
    },
  });

  const watchedValues = form.watch();
  const isAnyFileSelected = Object.entries(watchedValues).some(
    ([key, value]) => !key.endsWith("Note") && value === true
  );

  function CheckFileAlreadyUploaded(fieldName: string) {
    const isUploaded = items.find((item) => item.id == fieldName);

    return isUploaded?.uploaded;
  }

  const onSubmit = (data: RequiredInfoChecksFormValues) => {
    // const new =Array.from(items).map((file) => {
    //   const uploadedItem = alreadyUploadedItems?.find(
    //     (upload) => upload.id === file.id
    //   );
    //   return {
    //     ...file,
    //     uploaded: !!uploadedItem,
    //     status: uploadedItem ? uploadedItem.status : "NOT_UPLOADED",
    //   };
    // });
    const transformed = Object.entries(data)
      .filter(([key, value]) => {
        return (
          !key.endsWith("Note") &&
          value === true &&
          typeof data[`${key}Note` as keyof typeof data] === "string"
        );
      })
      .map(([key]) => {
        const note = data[`${key}Note` as keyof typeof data] ?? "";
        const isUploaded = CheckFileAlreadyUploaded(key);

        return {
          [isUploaded ? "attachmentName" : "fieldName"]: isUploaded
            ? key
            : `file-${key}`,
          type: isUploaded ? "FILE_UPDATE_REQUEST" : "UPDATE_REQUEST",
          note,
        };
      });

    checkMutation.mutate({
      body: transformed,
      applicationId,
      token,
    });
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {items?.map((item) => (
            <div key={item.id} className="space-y-2">
              {/* Checkbox */}
              <FormField
                control={form.control}
                name={item.id as keyof RequiredInfoChecksFormValues}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                    <FormControl>
                      <Checkbox
                        checked={
                          !!field.value ||
                          item.status == "NO_INFORMATION_REQUIRED"
                        }
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      {item.label} &nbsp;
                      <span className="text-[#30BD29]">
                        {item.uploaded && "(uploaded)"}
                        {item.status == "NO_INFORMATION_REQUIRED" &&
                          "(verified)"}
                      </span>
                    </FormLabel>
                  </FormItem>
                )}
              />

              {/* Conditional Textarea Field */}
              {form.watch(item.id as keyof RequiredInfoChecksFormValues) && (
                <FormField
                  control={form.control}
                  name={`${item.id}Note` as keyof RequiredInfoChecksFormValues}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-light">
                        Add a message for {item.label}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="w-full"
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
              variant="primary"
              type="submit"
              disabled={checkMutation.isPending || !isAnyFileSelected}
            >
              {checkMutation.isPending ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
