/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useApiMutation } from "@/app/hook/TanstackQueries/useApiMutation";
import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormField } from "@/components/ui/form";
import { Download, Loader2 } from "lucide-react";

const fieldGroups = {
  "General Information": [
    "Student ID",
    "College Email",
    "Title",
    "Sex",
    "First Name",
    "Middle Name",
    "Last Name",
    "Date of Birth",
    "Current Nationality",
    "Country of Residence",
    "Current Post code",
    "Country of Birth",
    "Ethnicity",
    "Marital Status",
    "Current Address",
    "Permanent Address",
    "Phone",
    "Email",
    "Student Status",
    "Student Registration Outcome",
    "Next of Kin Relationship",
    "Next of Kin Full Name",
    "Next of Kin Phone",
    "Next of Kin Address",
  ],
  "Agent’s Details": [
    "Agent First Name",
    "Agent Last Name",
    "Agent Phone",
    "Agent Email",
    "Sub Agent First Name",
    "Sub Agent Last Name",
  ],
  "Student Status & Registration Data": [
    "Student Status",
    "Status Effective From",
    "Status Created By",
    "Reason for Withdrawal",
    "Course Title",
    "Awarding Body Name",
    "Course Start Date",
    "Course End Date",
    "Year of Entry",
    "Course Fees",
  ],
  "University Partners": ["Awarding Body ID", "Awarding Body Name"],
};
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

const schema = z.object({
  selectedFields: z
    .array(z.string())
    .min(1, "Please select at least one field to download"),
});

type FormData = z.infer<typeof schema>;

interface DownloadStudentDataModalProps {
  open: boolean;
  onClose: () => void;
  applicants: Applicant[];
}

export function DownloadStudentDataModal({
  open,
  onClose,
  applicants,
}: DownloadStudentDataModalProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { selectedFields: [] },
  });

  const downloadMutation = useApiMutation({
  path: "student-roaster/download-csv",
  method: "POST",// 🔹 Ensure response is treated as plain text
  responseType: "text",
  onSuccess: (data: string) => {
    try {
      // Create a CSV blob
      const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);

      // Create a temporary <a> element to download the file
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "student-roaster.csv");
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);

      showToast("success", "CSV downloaded successfully!");
      onClose?.();
    } catch (err) {
      console.error("Error while processing CSV:", err);
      showToast("error", "Something went wrong while downloading CSV");
    }
  },
  onError: (error) => {
    console.error("Download failed:", error);
    showToast("error", "Failed to download CSV file");
  }
});


  const handleSubmit = (data: FormData) => {
    downloadMutation.mutate({
      fields: data.selectedFields,
      ids: applicants.map((a) => a.id),
    });
  };

  useEffect(() => {
    if (!open) form.reset();
  }, [open]);

  // Toggle all fields globally
  const toggleAll = (checked: boolean) => {
    if (checked) {
      const allFields = Object.values(fieldGroups).flat();
      form.setValue("selectedFields", allFields);
    } else {
      form.setValue("selectedFields", []);
    }
  };

  // Toggle a specific section
  const toggleSection = (fields: string[], checked: boolean) => {
    const current = form.getValues("selectedFields");
    if (checked) {
      const updated = Array.from(new Set([...current, ...fields]));
      form.setValue("selectedFields", updated);
    } else {
      const updated = current.filter((f) => !fields.includes(f));
      form.setValue("selectedFields", updated);
    }
  };

  const selectedFields = form.watch("selectedFields");
  const allFields = Object.values(fieldGroups).flat();
  const globalAllSelected =
    allFields.length > 0 && allFields.every((f) => selectedFields?.includes(f));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-3xl max-h-[90vh] overflow-y-scroll">
        <DialogHeader>
          <DialogTitle>Select Fields to Download</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Global select all/deselect all */}
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => toggleAll(!globalAllSelected)}
              >
                {globalAllSelected ? "Deselect All" : "Select All"}
              </Button>
            </div>

            {/* Section-wise fields */}
            {Object.entries(fieldGroups).map(([section, fields]) => {
              const allSelected = fields.every((f) =>
                selectedFields?.includes(f)
              );

              return (
                <div key={section} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">{section}</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => toggleSection(fields, !allSelected)}
                    >
                      {allSelected ? "Deselect All" : "Select All"}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {fields.map((field) => (
                      <FormField
                        key={field}
                        control={form.control}
                        name="selectedFields"
                        render={({ field: formField }) => {
                          const checked = formField.value?.includes(field);
                          return (
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(isChecked) => {
                                  if (isChecked) {
                                    formField.onChange([
                                      ...formField.value,
                                      field,
                                    ]);
                                  } else {
                                    formField.onChange(
                                      formField.value.filter(
                                        (f: string) => f !== field
                                      )
                                    );
                                  }
                                }}
                              />
                              {field}
                            </label>
                          );
                        }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Footer Actions */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={downloadMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="min-w-[150px]"
                disabled={
                  downloadMutation.isPending || selectedFields.length === 0
                }
              >
                {downloadMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
