/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuths } from "@/hooks/userContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { AssignPortal } from "../../query_controller/assignPortal";

interface Portal {
  id: string;
  name: string;
}

interface PortalListProps {
  id: string;
  data?: { userPortals: { portalCategoryId: string }[]; allPortal: Portal[] };
  isLoading: boolean;
  closeModal: () => void;
}

export function PortalList({
  id,
  data,
  closeModal,
  isLoading,
}: PortalListProps) {
  const auth = useAuths();
  const token = auth?.user?.token;
  // console.log("get-data", data);
  const allPortal = data?.allPortal || [];
  const userPortals = data?.userPortals || [];
  const queryClient = useQueryClient();

  const activePortal = userPortals.map((portal) => portal.portalCategoryId);
  // console.log("activePortal", activePortal);

  const FormSchema = z.object({
    items: z
      .array(z.string())
      .min(1, { message: "You must select at least one portal." }),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      items: activePortal,
    },
  });
  form.setValue("items", activePortal);

  const assignPortalMutation = useMutation({
    mutationFn: (data: any) => AssignPortal(data),
    onSuccess: (data) => {
      toast.success(data?.message);
      queryClient.invalidateQueries({ queryKey: ["assign-portal"] });
      queryClient.invalidateQueries({ queryKey: ["fetch-list-of-users"] });
      console.log(data);
      closeModal();
    },
    onError: (error) => {
      console.log(error);
    },
  });

  function onSubmit(formData: z.infer<typeof FormSchema>) {
    const data = {
      userId: id,
      portalCategoryId: formData.items,
      token: token,
    };
    console.log("data", data);
    assignPortalMutation.mutate(data);
  }

  if (isLoading || assignPortalMutation.isPending) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="animate-spin" size={55} strokeWidth={2} />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormItem>
          <div className="mb-4">
            <FormLabel className="text-base">Assign Portal</FormLabel>
          </div>

          {allPortal.map((portal) => (
            <FormField
              key={portal.id}
              control={form.control}
              name="items"
              render={({ field }) => (
                <FormItem
                  key={portal.id}
                  className="flex flex-row items-start space-y-0 space-x-3"
                >
                  <FormControl>
                    <Checkbox
                      checked={field.value.includes(portal.id)}
                      onCheckedChange={(checked) => {
                        field.onChange(
                          checked
                            ? [...field.value, portal.id]
                            : field.value.filter((value) => value !== portal.id)
                        );
                      }}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal capitalize">
                    {portal.name}
                  </FormLabel>
                </FormItem>
              )}
            />
          ))}
          <FormMessage />
        </FormItem>
        <Button type="submit" disabled={assignPortalMutation.isPending}>
          {assignPortalMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Update
        </Button>
      </form>
    </Form>
  );
}
