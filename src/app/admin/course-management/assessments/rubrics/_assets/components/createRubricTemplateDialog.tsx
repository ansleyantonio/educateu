import { DialogWrapper } from "@/components/common/dialog/common_dialog/common_dialog";
import { useCreateRubricTemplate } from "../hooks/rubricTemplates";
import { useState } from "react";
interface Props {
  open: boolean
  setOpen: (open: boolean) => void
}
export default function CreateRubricTemplateDialog({ open, setOpen }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const createRubricTemplate = useCreateRubricTemplate();

  const handleClose = () => {
    setOpen(false);
    setName("");
    setDescription("");
  }

  const handleCreateRubricTemplate = () => {
    createRubricTemplate.mutate({
      name,
      description
    });
  }
  return (
    <DialogWrapper open={open} handleOpen={setOpen} >
      <div className="bg-white p-4 pt-0 rounded-md w-[400px]">
        <h1 className="text-[#0F172A] text-[20px] font-semibold">Create Rubric Template</h1>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[#0F172A] text-[14px] font-semibold">Name</label>
            <input type="text" className="border border-[#E2E8F0] rounded-md p-2" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[#0F172A] text-[14px] font-semibold">Description</label>
            <input type="text" className="border border-[#E2E8F0] rounded-md p-2" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-4 mt-4">
          <button className="bg-[#0F172A] text-white py-2 px-4 rounded-md" onClick={handleCreateRubricTemplate}>Create</button>
          <button className="bg-[#E2E8F0] text-[#0F172A] py-2 px-4 rounded-md" onClick={() => handleClose()}>Cancel</button>
        </div>
      </div>
    </DialogWrapper>
  );
}
