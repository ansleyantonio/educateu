"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { createCommissionGroup } from "../../query_controller/createCommissionGroup";
import toast from "react-hot-toast";

interface CreateGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  groupType: "INTERNAL" | "EXTERNAL";
  onCreate: (groupName: string) => void;
  token: string;
}

export const GroupModal = ({
  isOpen,
  onClose,
  groupType,
  onCreate,
  token,
}: CreateGroupDialogProps) => {
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!groupName.trim()) return;

    try {
      setLoading(true);
      setError("");
      await createCommissionGroup({
        token,
        groupName: groupName.trim(),
        type: groupType,
      });

      onCreate(groupName.trim());
      setGroupName("");
      onClose();
      toast.success("Group created Application!");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        {/* <h1 className="font-bold tracking-wide leading-6 text-[24px] text-[#192128]">
          Create {groupType === "internal" ? "Internal" : "External"} Agent Group
        </h1> */}
        <h1 className="font-bold tracking-wide leading-6 text-[24px] text-[#192128]">
          Create {groupType === "INTERNAL" ? "Internal" : "External"} Agent
          Group
        </h1>

        <Textarea
          placeholder="Write here the details"
          className="p-[18px]"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm pt-1">{error}</p>}
        <div className="flex justify-end gap-3 pt-4">
          <button
            className="border border-[#CFD6DD] text-[#4A545E] bg-white rounded-md p-2 text-sm shadow-sm hover:bg-gray-50"
            onClick={() => {
              onClose();
              setGroupName("");
              setError("");
            }}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="bg-[#013E5B] text-white p-2 rounded-md flex items-center justify-center"
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
