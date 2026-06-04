/* eslint-disable @typescript-eslint/no-explicit-any */
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import DataLoader from "@/components/common/GlobalLoader/dataLoader";
import NoDataComponent from "@/components/common/GlobalLoader/empty";
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
  awardingBody: string;
}

interface ApplicantDialogProps {
  open: boolean;
  onClose: () => void;
  applicant: ApplicantProps | null;
  mode?: string;
}

export function ApplicantDialog({
  open,
  onClose,
  applicant,
  mode,
}: ApplicantDialogProps) {
  // console.log("MODE IN APPLICANT DIALOG", applicant);
  // console.log("MODE IN APPLICANT DIALOG", mode);

  const { data, isLoading } = useFetchData({
    method: "POST",
    path: `${mode}/registered-student-details`,
    queryKey: "fetch-student-roaster-details",
    filterData: {
      registrationId: applicant?.id,
    },
  });
  if (!applicant) return null;

  return (
    <DialogWrapper open={open} handleOpen={onClose} style="w-full">
      <div className="w-full max-w-[95vw]">
        <StudentInfo
          studentId={applicant?.studentId}
          name={applicant?.name}
          email={applicant?.email}
          applicationId={applicant.id}
          enrollmentDate={applicant.entrydate}
          course={applicant.course}
          status={applicant.status}
        />
        {isLoading ? (
          <div className="min-h-[250px]">
            <DataLoader />
          </div>
        ) : data.length === 0 ? (
          <div className="min-h-[250px]">
            <NoDataComponent />
          </div>
        ) : (
          <StudentTab data={data?.data} mode={mode} />
        )}
      </div>
    </DialogWrapper>
  );
}
