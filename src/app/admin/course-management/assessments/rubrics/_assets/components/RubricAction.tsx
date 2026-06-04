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
import { useState } from "react";
import { RubricTemplate } from "../utils/types";

interface RubricActionProps {
  rubric: RubricTemplate;
  onRefresh?: () => void;
}

export default function RubricAction({
  rubric,
  onRefresh,

}: RubricActionProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const deleteRubricMutation = useApiMutation({
    method: "DELETE",
    path: `assessments/rubric-templates/${rubric.id}`,
    onSuccess: () => {
      showToast("success", "Rubric template deleted successfully");
      setIsDeleteModalOpen(false);
      if (onRefresh) {
        onRefresh();
      }
    },
    onError: () => {
      showToast("error", "Failed to delete rubric template");
    },
    isSuccessToast: false,
    isErrorToast: false,
  });

  return (
    <div className="flex items-center text-primary justify-start gap-2">
      <Button
        variant="outline"
        size="icon"
        title="Edit"

      >
        <Image
          height={6}
          width={6}
          src={"/assets/icons/edit-2.svg"}
          alt="edit"
          className="w-6 h-6"
        />
      </Button>

      <Button
        variant="outline"
        size="icon"
        title="Copy"

      >
        <Image
          height={6}
          width={6}
          src={"/assets/icons/duplicate.svg"}
          alt="copy"
          className="w-6 h-6"
        />
      </Button>

      <Button
        variant="outline"
        size="icon"
        title="View"

      >
        <Image
          height={6}
          width={6}
          src={"/assets/icons/file-view.svg"}
          alt="view"
          className="w-6 h-6"
        />
      </Button>

      <AlertDialog
        open={isDeleteModalOpen}
        onOpenChange={(open) => {
          if (!open && deleteRubricMutation.isPending) {
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
              rubric template &quot;{rubric.name}&quot; and remove all
              associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteRubricMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={() => {
                deleteRubricMutation.mutate({});
              }}
              disabled={deleteRubricMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteRubricMutation.isPending ? (
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

