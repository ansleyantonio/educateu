/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/custom_ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { z } from "zod";
import { useMemo } from "react";
import { CamelToTitle } from "@/utils/CaseConverter";
import { updateGeneralFileCheck } from "../queryController";

interface NoRequiredInfoChecksFormProps {
  token: string;
  checkItemNames: { name: string }[];
  setIsOpenDialog: (value: boolean) => void;
}

export default function NoRequiredInfoChecksForm({
  token,
  checkItemNames,
  setIsOpenDialog,
}: NoRequiredInfoChecksFormProps) {
  const applicationId = usePathname()?.split("/")[3] || "";

  const items = checkItemNames?.map((doc) => ({
    id: doc.name,
    label: CamelToTitle(doc.name),
  }));

  const schema = useMemo(
    () =>
      z.object(
        items.reduce(
          (acc, { id }) => ({
            ...acc,
            [id]: z.boolean().optional(),
          }),
          {},
        ),
      ),
    [items],
  );

  const form = useForm({
    resolver: zodResolver(schema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (
      requirements: Array<{ attachmentName: string; status: string }>,
    ) =>
      updateGeneralFileCheck({
        body: requirements,
        applicationId,
        token,
      }),
    onSuccess: (data) => {
      if (data?.statusCode === 200) {
        toast.success(data?.message || "Update successful");
        setIsOpenDialog(false);
      } else {
        toast.error(data?.message || "Update failed");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "An error occurred");
    },
  });

  const onSubmit = (formData: Record<string, boolean>) => {
    const requirements = items
      .filter(({ id }) => formData[id])
      .map(({ id }) => ({
        attachmentName: id,
        status: "NO_INFORMATION_REQUIRED",
      }));

    mutate(requirements);
  };

  const watchedValues = form.watch();

  // Check if at least one checkbox is selected (true)
  const isAnyChecked = Object.values(watchedValues).some(
    (value) => value === true,
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {items.map(({ id, label }) => (
          <div key={id} className="space-y-2">
            <FormField
              control={form.control}
              name={id}
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal">{label}</FormLabel>
                </FormItem>
              )}
            />
          </div>
        ))}

        <div className="flex gap-4 justify-end pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpenDialog(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending || !isAnyChecked}
            variant="primary"
          >
            {isPending ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
