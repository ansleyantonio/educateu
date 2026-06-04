import { addNoteController } from "@/app/admin/admissions/additional-file-check/[slug]/notes/_assets/queryClient/queryController";
import { Button } from "@/components/ui/custom_ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormField, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  addNoteFormSchema,
  NoteFormValues,
} from "../../../../../../../(agent-portal)/agent/application-management/[id]/notes/_assets/schema/noteSchema";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";

interface AddNoteProps {
  token: string;
  applicationId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Define types for mutation payload and response
type AddNoteRequest = {
  body: NoteFormValues;
  applicationId: string | null;
};

type AddNoteResponse = {
  statusCode: number;
  message: string;
};

export const AddNote = ({
  token,
  applicationId,
  isOpen,
  onClose,
  onSuccess,
}: AddNoteProps) => {
  const queryClient = useQueryClient();

  const form = useForm<NoteFormValues>({
    resolver: zodResolver(addNoteFormSchema),
    defaultValues: {
      note: "",
    },
  });

 const noteMutation = useApiMutation({
  path: "notes", // Adjust based on your addNoteController endpoint
  method: "POST",
  onSuccess: (data) => {
    if (data.statusCode === 200) {
      queryClient.invalidateQueries({
        queryKey: ["list-of-well-being-applications-data"],
      });
      toast.success(data?.message);
      onClose();
      onSuccess?.();
    } else {
      toast.error(data?.message);
    }
  },
  onError: (error) => {
    toast.error(error || "Failed to add note");
  },
});

  const onSubmit = (data: NoteFormValues) => {
    const body: AddNoteRequest = {
      body: data,
      applicationId,
    };
    noteMutation.mutate(body);
  };

  const handleClose = () => {
    form.reset({ note: "" });
    form.clearErrors();
    onClose();
  };

  useEffect(() => {
    form.reset({ note: "" });
    form.clearErrors();
  }, [onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 space-y-6"
          >
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <div className="relative">
                  <textarea
                    {...field}
                    className="py-2 px-3 w-full text-sm rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none placeholder:text-gray-400"
                    rows={8}
                    placeholder="Enter your note"
                  />
                  <FormMessage />
                </div>
              )}
            />

            <div className="flex gap-6 justify-end">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={noteMutation.isPending}
              >
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
