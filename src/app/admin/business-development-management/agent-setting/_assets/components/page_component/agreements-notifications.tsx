import type React from "react";
import type { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUploadArea } from "./file-upload-area";
import type { FormValues } from "./form-schema";

interface AgreementsNotificationsProps {
  form: UseFormReturn<FormValues>;
}

export const AgreementsNotifications: React.FC<
  AgreementsNotificationsProps
> = ({ form }) => {
  return (
    <Card>
      <CardHeader className="py-3 mb-3 bg-[#F5F7F9]">
        <CardTitle>Agreements and Notifications</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Internal Agent Agreement Template</Label>
          <FileUploadArea
            field="internalAgreementTemplate"
            accept="*/*"
            helpText="Any file type (PDF, DOCX, JPG, PNG, GIF) allowed. Max size of 800KB"
            form={form}
          />
        </div>
        <div className="space-y-2">
          <Label>External Agent Agreement Template</Label>
          <FileUploadArea
            field="externalAgreementTemplate"
            accept="*/*"
            helpText="Any file type (PDF, DOCX, JPG, PNG, GIF) allowed. Max size of 800KB"
            form={form}
          />
        </div>
        <div className="space-y-2">
          <Label>Expiry Date Reminder</Label>
          <Select
            onValueChange={(value: FormValues["expiryDateReminder"]) =>
              form.setValue("expiryDateReminder", value)
            }
            value={form.watch("expiryDateReminder")}
          >
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Select reminder period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1week">1 Week Before</SelectItem>
              <SelectItem value="2weeks">2 Weeks Before</SelectItem>
              <SelectItem value="1month">1 Month Before</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
