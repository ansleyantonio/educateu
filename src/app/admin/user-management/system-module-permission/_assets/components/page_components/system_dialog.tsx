/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { AssignSystemPermission } from "../../controller/assign_system_permission";
import {
  formSchema,
  modules,
  type FormSchema,
  type SystemModuleDialogProps,
} from "../../types/systemModule";
import { ModuleCheckboxGroup } from "../../utils/ModuleCheckboxGroup";
import { prepareSubmitData } from "../../utils/systemModuleutils";
import { useAuths } from "@/hooks/userContext";

export function SystemModuleDialog({
  setIsOpen,
  isOpen,
  selectedRows,
}: SystemModuleDialogProps) {
  const auth = useAuths();
  const token = auth?.user?.token as string;

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      modules: modules.map((module) => ({
        ...module,
        GET: false,
        POST: false,
        DELETE: false,
      })),
    },
  });

  const { handleSubmit } = form;

  const mutation = useMutation({
    mutationFn: (data: any) => AssignSystemPermission(data),
    onSuccess: () => {
      toast.success("Permissions updated successfully");
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to update permissions");
    },
  });

  const onSubmit = (values: FormSchema) => {
    const output = prepareSubmitData(values);
    const body = {
      userId: Array.from(selectedRows),
      roleData: { modules: output },
    };
    const data = { token, body };
    mutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="p-0 sm:max-w-[700px]">
        <DialogHeader className="py-4 px-6">
          <DialogTitle>Assign System Module</DialogTitle>
        </DialogHeader>
        <hr />
        <Form {...form}>
          <div className="p-6 space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {form
                .watch("modules")
                ?.map((module, index) => (
                  <ModuleCheckboxGroup
                    key={index}
                    index={index}
                    module={module}
                    form={form}
                  />
                ))}
              <div className="flex gap-3 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save
                </Button>
              </div>
            </form>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
