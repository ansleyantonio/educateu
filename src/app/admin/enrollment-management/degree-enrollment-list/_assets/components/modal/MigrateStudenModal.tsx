/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { extractEnrollmentIds } from "@/app/admin/enrollment-management/_assets/utils/enrollmentsIds";
import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import DownloadCSV from "@/components/Download/CSV_XLSX/ExportasCSV";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import SelectedApplicantListForMigrate from "../view/selectedApplicantListForMigrate";
import DynamicCourseInfo from "./courseInfo";

interface ModalProps {
  selectApplicant: any;
}

export function MigrateStudentModal({ selectApplicant }: ModalProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  //  console.log("FilterData---", selectApplicant);

  const ImportStudentMutation = useApiMutation({
    method: "POST",
    path: "enrollment-management/migrate",
    onSuccess: (data) => {
      showToast("success", data);
      setOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["fetch-degree-enrollment-list"],
      });
    },
    onError: (error: any) => {
      console.log("error", error.response);

      if (error) {
        // console.log("error", error.response);
        showToast("error", error);
      }
    },
  });

  const handelImportStudent = () => {
    const ids = extractEnrollmentIds(selectApplicant);
    ImportStudentMutation.mutate({ studentEnrollmentIds: ids });
  };

  const isCoursesSame = (data: any[]) => {
    const courseName = data[0].course;
    return data.every((item: any) => item.course === courseName);
  };

  const handelOpenMigrateModal = () => {
    if (isCoursesSame(selectApplicant)) {
      setOpen(true);
    } else {
      showToast("error", {
        message: "Please select same course for all selected applicants",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        onClick={handelOpenMigrateModal}
        className="flex gap-x-2 items-center py-2 px-4 rounded-md text-[#FFFFFF] bg-[#013E5B]"
      >
        Migrate Student
      </button>

      <DialogContent className="w-full items-start md:min-w-[55%] h-fit max-h-[85%] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between">
            <DialogTitle> Migrate Student </DialogTitle>
            <div className="flex gap-2 items-center">
              <DownloadCSV
                data={selectApplicant}
                fileName="Diploma Enrolment List"
              />
              <Button
                className="py-4"
                disabled={ImportStudentMutation.isPending}
                onClick={handelImportStudent}
                variant="primary"
              >
                Import Students{" "}
                {ImportStudentMutation.isPending && (
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                )}
              </Button>
            </div>
          </div>

          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>

        <div className="">
          <DynamicCourseInfo data={selectApplicant[0]} />
          <SelectedApplicantListForMigrate Data={selectApplicant} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
