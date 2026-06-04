"use client";

import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { Dispatch, SetStateAction, useState } from "react";
import { useUpdateAssessmentMutation } from "../utils/hooks";
import { Assessment } from "../utils/types";

interface AssessmentActionProps {
  assessment: Assessment;
  onEditingAssessment?: Dispatch<
    SetStateAction<
      Assessment | (Omit<Assessment, "id"> & { id?: string }) | undefined
    >
  >;
  onRefresh?: () => void;
  onDuplicateAssessment?: Dispatch<
    SetStateAction<
      Assessment | (Omit<Assessment, "id"> & { id?: string }) | undefined
    >
  >;
}

export default function AssessmentAction({
  assessment,
  onEditingAssessment,
  onRefresh,
  onDuplicateAssessment,
}: AssessmentActionProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const updateAssessmentMutation = useUpdateAssessmentMutation({
    assessmentId: assessment.id,
    onSuccess: () => {
      showToast("success", "Assessment status updated successfully");
      if (onRefresh) {
        onRefresh();
      }
    },
    onError: (error) => {
      let errorMessage = "Failed to update assessment";
      const data = error?.response?.data || {};
      if (data?.statusCode === 400 && data?.message) {
        errorMessage = data.message;
      }

      showToast("error", errorMessage);
    },
  });

  const deleteAssessmentMutation = useApiMutation({
    method: "DELETE",
    path: `assessments/${assessment.id}`,
    onSuccess: () => {
      showToast("success", "Assessment  Deleted Successfully");
      setIsDeleteModalOpen(false);
      if (onRefresh) {
        onRefresh();
      }
    },
    onError: () => {
      showToast("error", "Failed To Delete Assessment");
    },
    isSuccessToast: false,
    isErrorToast: false,
  });

  return (
    <div className="flex  items-center text-primary justify-start gap-2">
      <Button
        variant="outline"
        size="icon"
        title="Edit"
        onClick={() => onEditingAssessment?.(assessment)}
      >
        <Image
          height={6}
          width={6}
          src={"/assets/icons/edit-2.svg"}
          alt="edit"
          className="w-6 h-6"
        />
      </Button>

      <div
        className={`inline-block ${
          updateAssessmentMutation.isPending ||
          assessment.status === "PUBLISHED"
            ? "cursor-not-allowed"
            : "cursor-pointer"
        }`}
      >
        <Button
          variant="outline"
          size="icon"
          title="Publish"
          onClick={() => {
            updateAssessmentMutation.mutate({
              status: "PUBLISHED",
            });
          }}
          disabled={
            updateAssessmentMutation.isPending ||
            assessment.status === "PUBLISHED"
          }
        >
          <Image
            className="w-6 h-6"
            height={6}
            width={6}
            src={"/assets/icons/publish.svg"}
            alt="publish"
          />
        </Button>
      </div>

      <div
        className={`inline-block ${
          updateAssessmentMutation.isPending || assessment.status === "DRAFT"
            ? "cursor-not-allowed"
            : "cursor-pointer"
        }`}
      >
        <Button
          variant="outline"
          size="icon"
          title="Unpublish"
          onClick={() => {
            updateAssessmentMutation.mutate({
              status: "DRAFT",
            });
          }}
          disabled={
            updateAssessmentMutation.isPending || assessment.status === "DRAFT"
          }
        >
          <Image
            height={6}
            width={6}
            src={"/assets/icons/un_publish.svg"}
            alt="unpublish"
            className="w-6 h-6"
          />
        </Button>
      </div>

      <Button
        variant="outline"
        size="icon"
        title="Duplicate"
        onClick={() => {
          const { id: _, ...assessmentWithoutId } = assessment;
          const duplicateAssessment: Omit<Assessment, "id"> & { id?: string } =
            {
              ...assessmentWithoutId,
              id: undefined,
              nameOrTitle: "",
              assessmentCode: "",
            };
          onDuplicateAssessment?.(duplicateAssessment);
        }}
      >
        <Image
          height={6}
          width={6}
          src={"/assets/icons/duplicate.svg"}
          alt="duplicate"
          className="w-6 h-6"
        />
      </Button>

      <AlertDialog
        open={isDeleteModalOpen}
        onOpenChange={(open) => {
          // Prevent closing the dialog while the mutation is pending
          if (!open && deleteAssessmentMutation.isPending) {
            return;
          }
          setIsDeleteModalOpen(open);
        }}
      >
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="icon" title="Delete">
            <Image
              height={6}
              width={6}
              src={"/assets/icons/delete.svg"}
              alt="delete"
              className="w-6 h-6"
            />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              assessment &quot;{assessment.nameOrTitle || assessment.title}
              &quot; and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteAssessmentMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={() => {
                deleteAssessmentMutation.mutate({});
              }}
              disabled={deleteAssessmentMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteAssessmentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
