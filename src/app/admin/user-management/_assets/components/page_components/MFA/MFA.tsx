/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { Switch } from "@/components/ui/custom_ui/switch";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useAuths } from "@/hooks/userContext";
import { getUserAccess } from "@/utils/permissions/permissions";
import { useMatchedModule } from "@/utils/useMatchedModule/useMatchedModule";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

const FormSchema = z.object({
  mfaEnabled: z.boolean().default(false).optional(),
});

export function MfaEnabledDisabled({ user }: { user: any }) {
  const auth = useAuths();
  const token = auth?.user?.token;
  const queryClient = useQueryClient();

  const matchedModule = useMatchedModule();
  const permissions = matchedModule?.modulePermission || [];
  const accessLevel = getUserAccess(permissions);
  const canEdit = accessLevel === "full-access";

  // mutation for toggling MFA
  const mfaMutation = useMutation({
    mutationFn: (newApplication: any) => {
      return axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/auth-management/mfa-status/${user.id}/`,
        newApplication,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    },
    onSuccess: (data) => {
      if (data.data.statusCode === 200) {
        toast.success(data?.data?.data?.message);
        queryClient.invalidateQueries({ queryKey: ["fetch-list-of-users"] });
      } else {
        toast.error("Something went wrong");
      }
    },
    onError: (error: any) => {
      if (error) {
        showToast("error", error);
      }
    },
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      mfaEnabled: user?.mfaEnabled,
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    // You can handle form submit if needed (currently empty)
  }

  const handelMFA = (data: z.infer<typeof FormSchema>) => {
    mfaMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <div>
          <FormField
            control={form.control}
            name="mfaEnabled"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={() => {
                      if (!canEdit) return; // disable toggle if no full access
                      field.onChange(!field.value);
                      handelMFA(form.getValues());
                    }}
                    disabled={!canEdit} // disable switch UI if no full access
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
