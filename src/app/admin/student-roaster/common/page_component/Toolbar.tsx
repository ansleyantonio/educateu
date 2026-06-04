// components/Toolbar.tsx
// "use client";

import { CustomField } from "@/components/common/fields/cusInputField";
import CommonSearch from "@/components/common/search/commonSearch";
import { Button } from "@/components/ui/button";
import { useAuths } from "@/hooks/userContext";
import { AnimatePresence, motion } from "framer-motion";
import { Mail } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { DownloadStudentDataModal } from "./Dialog/DownloadStudentDataModal";
import { SendEmailTemplateModal } from "../../../../../components/EmailModals/SendEmailTemplateModal";
import CSV from "/public/assets/logo/admin/csv-02.svg";

type Applicant = {
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
};

interface ToolbarProps {
  applicants?: Applicant[];
  total: number;
  search: string;
  setSearch: (val: string) => void;
  setLimit: (limit: string) => void;
}

export function Toolbar({
  applicants,
  total,
  search,
  setSearch,
  setLimit,
}: ToolbarProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const { editAccess } = useAuths();

  return (
    <div className="bg-white border-b">
      <div className="flex flex-wrap justify-between items-center p-4  gap-4">
        {/* Left side */}
        <div className="flex gap-2 items-center">
          <h2 className="text-lg font-semibold text-black">Total Registry</h2>
          <span className="py-1 px-3 text-xs text-blue-600 bg-blue-50 rounded-full">
            {total} Students
          </span>
        </div>

        {/* Right side */}
        <div className="flex flex-wrap gap-3 items-center">
          {applicants && applicants.length > 0 && (
            <Button
              disabled={!editAccess}
              variant="primary"
              onClick={() => setCsvDialogOpen(true)}
            >
              <Image src={CSV} width={20} height={20} alt="Download" />
              Download CSV
            </Button>
          )}
          {applicants && applicants.length > 1 && (
            <Button onClick={() => setDialogOpen(true)} disabled={!editAccess}>
              <Mail className="mr-2" size={20} /> Send Bulk Email
            </Button>
          )}

          <CommonSearch searchText={search} setSearchText={setSearch} />
          <CustomField.LimitField setLimit={setLimit} />
        </div>
        <SendEmailTemplateModal
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          emailList={applicants?.map((a) => a.email) ?? []}
        />
        <DownloadStudentDataModal
          applicants={applicants ?? []}
          open={csvDialogOpen}
          onClose={() => setCsvDialogOpen(false)}
        />
      </div>
      <AnimatePresence>
        {applicants && applicants.length > 0 && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="pl-4 mb-4 text-sm text-gray-500"
          >
            Selected Applicants: {applicants.length}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
