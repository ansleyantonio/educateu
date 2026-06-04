/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/custom_ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CamelToTitle } from "@/utils/CaseConverter";
import { useMemo } from "react";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea"; // Import Textarea component
import { updateAdditionalFileCheck } from "../queryController";

interface RequiredInfoChecksFormProps {
  checkItemNames: { name: string }[];
  token: string;
  setIsOpenDialog: (value: boolean) => void;
}

export default function RequiredInfoChecksForm({
  checkItemNames,
  token,
  setIsOpenDialog,
}: RequiredInfoChecksFormProps) {
  const applicationId = usePathname().split("/")[3];

  const items = checkItemNames?.map((doc) => ({
    id: doc.name,
    label: CamelToTitle(doc.name),
  }));

  const schema = useMemo(() => {
    const shape: Record<string, z.ZodTypeAny> = {};

    items?.forEach((item) => {
      shape[item.id] = z.boolean().optional();
      shape[`${item.id}Note`] = z.string().optional();
    });

    return z.object(shape).superRefine((data, ctx) => {
      items?.forEach(({ id }) => {
        if (data[id] && !data[`${id}Note`]) {
          ctx.addIssue({
            path: [`${id}Note`],
            code: z.ZodIssueCode.custom,
            message: `${id.replace(/([A-Z])/g, " $1").trim()} note is required because checkbox is selected.`,
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
    mutationFn: (checkData: any) => updateAdditionalFileCheck(checkData),
    onSuccess: (data: any) => {
      if (data?.statusCode === 200) {
        toast.success(data?.message);
        setIsOpenDialog(false);
      } else {
        toast.error(data?.message);
      }
    },
    onError: (error: Error) => {
      toast.error(error?.message);
    },
  });

  const onSubmit = (data: RequiredInfoChecksFormValues) => {
    const transformed = Object.entries(data)
      .filter(([key, value]) => {
        return (
          !key.endsWith("Note") &&
          value === true &&
          typeof data[`${key}Note` as keyof typeof data] === "string"
        );
      })
      .map(([key]) => ({
        attachmentName: key,
        status: "INFORMATION_REQUIRED",
        note: data[`${key}Note` as keyof typeof data] ?? "",
      }));

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
              disabled={checkMutation.isPending}
            >
              {checkMutation.isPending ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
