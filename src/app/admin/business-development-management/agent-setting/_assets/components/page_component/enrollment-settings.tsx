import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type React from "react";
import type { UseFormReturn } from "react-hook-form";
import type { FormValues } from "./form-schema";

interface EnrollmentSettingsProps {
  form: UseFormReturn<FormValues>;
}

export const EnrollmentSettings: React.FC<EnrollmentSettingsProps> = ({
  form,
}) => {
  return (
    <Card>
      <CardHeader className="py-3 mb-3 bg-[#F5F7F9]">
        <CardTitle>Enrollment Settings</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-between items-center space-y-4">
        <div className="space-y-2">
          <Label>Agent Enrollment</Label>
          <Select
            onValueChange={(value: FormValues["agentEnrollment"]) =>
              form.setValue("agentEnrollment", value)
            }
            value={form.watch("agentEnrollment")}
          >
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Select enrollment type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EXTERNAL">Open Enrollment</SelectItem>
              <SelectItem value="Enrollment">Closed Enrollment</SelectItem>
              <SelectItem value="EXTERNAL">Invite Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="disable"
            checked={form.watch("disableNewApplication")}
            onCheckedChange={(checked) =>
              form.setValue("disableNewApplication", checked as boolean)
            }
          />
          <Label htmlFor="disable">Disable New Application Submission</Label>
        </div>
      </CardContent>
    </Card>
  );
};
