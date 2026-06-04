"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import StudentInfo from "./components/StudentInfo";
import StudentTab from "./components/StudentTab";

interface ApplicantProps {
  id: string;
  name: string;
  studentId: string;
  course: string;
  progress: string;
  email: string;
  entrydate: string;
  endDate: string;
  status: string;
}

interface ApplicantDialogProps {
  open: boolean;
  onClose: () => void;
  applicant: ApplicantProps | null;
}

export function ApplicantDialog({
  open,
  onClose,
  applicant,
}: ApplicantDialogProps) {
  if (!applicant) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[95vw] h-[90vh] max-h-[90vh] overflow-y-auto">
        <div className="w-full max-w-[95vw]">
        <StudentInfo
          name={applicant.name}
          applicationId={applicant.id}
          enrollmentDate={applicant.entrydate}
          course={applicant.course}
          status={applicant.status}
        />
        <StudentTab />
        </div>
      </DialogContent>
    </Dialog>
  );
}
