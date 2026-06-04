/* eslint-disable @typescript-eslint/no-explicit-any */
import { addNoteController } from "@/app/admin/admissions/admission/[slug]/invitations/_assets/queryClient/queryController";
import {
  addNoteFormSchema,
  NoteFormValues,
} from "@/app/admin/admissions/admission/[slug]/notes/_assets/schema/noteSchema";
import ActionButton from "@/components/common/button/actionButton";
import { Form, FormField, FormMessage } from "@/components/ui/custom_ui/form";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TriangleAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { updateWellBeingApplicant } from "../../../queryController/updateWellBeingApplicant";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  applicantId: string | null;
  applicantName: string | null;
  status: "APPROVED" | "REJECTED" | null;
  token: string;
  parentDialogClose?: () => void;
}

const ConfirmationDialog = ({
  isOpen,
  onClose,
  applicantId,
  applicantName,
  status,
  token,
  parentDialogClose
}: ConfirmationDialogProps) => {
  const queryClient = useQueryClient();
  const form = useForm<NoteFormValues>({
    resolver: zodResolver(addNoteFormSchema),
    defaultValues: {
      note: "",
    },
  });

  const { mutate, status: mutationStatus } = useMutation({
    mutationFn: updateWellBeingApplicant,
    onSuccess: () => {
      toast.success("Status Updated Successfully");
      queryClient.invalidateQueries({
        queryKey: ["list-of-well-being-applications-data"],
      });
      onClose();
      parentDialogClose?.();
    },
    onError: (error) => {
      console.error("Error updating status:", error);
      toast.error("Something went wrong!");
    },
  });

  const noteMutation = useMutation({
    mutationFn: (data: any) => addNoteController({ token, data }),
    onSuccess: (data: any) => {
      if (data.statusCode === 200) {
        queryClient.invalidateQueries({
          queryKey: ["get-applicant-note-wellbeing"],
        });
        console.log(data?.message);
        // After note is saved, proceed with status update
        if (applicantId && status) {
          mutate({
            id: applicantId,
            status,
            token,
          });
        }
      } else {
        console.log(data?.message);
        toast.error(data?.message || "Failed to add note");
      }
    },
    onError: (error: any) => {
      console.error("Add note error:", error);
      toast.error(error?.response?.data?.message || "Failed to add note");
    },
  });

  const isLoading =
    mutationStatus === "pending" || noteMutation.status === "pending";

  const handleSubmit = async () => {
    // If status is REJECTED, validate the form first
    if (status === "REJECTED") {
      const formData = form.getValues();
      if (formData?.note?.length < 3) {
        return; // Stop submission if validation fails
      }
      // Get form values and submit note
      onSubmit(formData);
    } else if (status === "APPROVED") {
      // For approval, directly update status without note
      if (applicantId && status) {
        mutate({
          id: applicantId,
          status,
          token,
        });
      }
    }
  };

  const onSubmit = (data: NoteFormValues) => {
    console.log("Note submission clicked");
    const body = {
      body: data,
      applicationId: applicantId,
    };
    noteMutation.mutate(body);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-6">
        <div className="flex flex-col space-y-6">
          <div className="flex items-start space-x-3">
            <TriangleAlert className="text-yellow-500 mt-1" />
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold">
                Confirm {status === "APPROVED" ? "Approval" : "Rejection"}
              </h2>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to{" "}
                {status === "REJECTED" ? "Reject" : "Approve"} the applicant{" "}
                <b>{applicantName}</b>?
                <br />
                Once {status?.toLowerCase()}ed, you won&apos;t be able to undo
                this action.
              </p>
            </div>
          </div>

          {status === "REJECTED" && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-6"
              >
                <div className="space-y-6">
                  {/* Note */}
                  <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <div className="relative">
                        <textarea
                          {...field}
                          className="py-2 px-3 w-full text-sm rounded-md border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none placeholder:text-gray-400"
                          rows={6}
                          placeholder="Enter rejection details here... (*)"
                        />
                        <FormMessage />
                      </div>
                    )}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <ActionButton
                    variant="outline"
                    handleOpen={onClose}
                    disabled={isLoading}
                    buttonContent="Cancel"
                  />
                  <ActionButton
                    variant="destructive"
                    handleOpen={handleSubmit}
                    disabled={isLoading}
                    isPending={isLoading}
                    buttonContent="Reject"
                    loadingContent="Processing..."
                  />
                  {/* <Button variant="destructive" type="submit">
            Reject
          </Button> */}
                </div>
              </form>
            </Form>
          )}

          {status === "APPROVED" && (
            <div className="flex justify-end space-x-3">
              <ActionButton
                variant="outline"
                handleOpen={onClose}
                disabled={isLoading}
                buttonContent="Cancel"
              />
              <ActionButton
                variant="primary"
                handleOpen={handleSubmit}
                disabled={isLoading}
                isPending={isLoading}
                buttonContent="Submit"
                loadingContent="Submitting..."
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;
