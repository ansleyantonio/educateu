/* eslint-disable @typescript-eslint/no-explicit-any */
import ActionButton from "@/components/common/button/actionButton";
import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { CopyPlus } from "lucide-react";
import { useState } from "react";
import DuplicateAdvanceCourseForm from "./DuplicateAdvanceCourseForm";
import { useAuths } from "@/hooks/userContext";

interface DuplicateAdvanceCourseModalProps {
  existingCourse: any;
}

const DuplicateAdvanceCourseModal = ({
  existingCourse,
}: DuplicateAdvanceCourseModalProps) => {
  const [open, setOpen] = useState(false);
  const {editAccess} = useAuths()

  const handelOpen = () => {
    setOpen(!open);
  };

  return (
    <DialogWrapper
      open={open}
      handleOpen={handelOpen}
      triggerContent={
        <ActionButton
          variant="icon"
          btnStyle="hover:border-blue-700"
          tooltipContent="Duplicate Course"
          icon={<CopyPlus />}
          handleOpen={handelOpen}
          disabled={!editAccess}
        />
      }
      title="Duplicate Advanced Course"
    >
      <div>
        <DuplicateAdvanceCourseForm
          existingCourse={existingCourse}
          setOpen={setOpen}
        />
      </div>
    </DialogWrapper>
  );
};

export default DuplicateAdvanceCourseModal;
