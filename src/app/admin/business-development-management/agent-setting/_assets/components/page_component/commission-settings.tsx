import type React from "react";
import type { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { FileUploadArea } from "./file-upload-area";
import type { FormValues } from "./form-schema";

interface CommissionSettingsProps {
  form: UseFormReturn<FormValues>;
}

export const CommissionSettings: React.FC<CommissionSettingsProps> = ({
  form,
}) => {
  return (
    <Card>
      <CardHeader className="py-3 mb-3 bg-[#F5F7F9]">
        <CardTitle>Commission Settings</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 mt-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Internal Agent Commission Rate Template</Label>
          <FileUploadArea
            field="internalCommissionTemplate"
            accept=".pdf,.doc,.docx,image/*"
            helpText="PDF, DOCX, or image files allowed. Max size of 800KB"
            form={form}
          />
        </div>
        <div className="space-y-2">
          <Label>External Agent Commission Rate Template</Label>
          <FileUploadArea
            field="externalCommissionTemplate"
            accept=".pdf,.doc,.docx,image/*"
            helpText="PDF, DOCX, or image files allowed. Max size of 800KB"
            form={form}
          />
        </div>
      </CardContent>
    </Card>
  );
};
