/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Card } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
} from "@/components/ui/custom_ui/invitation_tabs";
import { ScrollArea } from "@/components/ui/custom_ui/scroll-area";
import { TabButton } from "@/components/ui/TabButton";
import { useState } from "react";
import DocumentsTab from "./tabContents/DocumentsTab";
import EngagementTab from "./tabContents/EngagementTab";
import LogsTab from "./tabContents/LogsTab";
import NotesTab from "./tabContents/NotesTab";
import ProfileTab from "./tabContents/ProfileTab";
import ProgressionTab from "./tabContents/ProgressionTab";
import RegistrationDetailsTab from "./tabContents/RegistrationDetailsTab";
import WarningsTab from "./tabContents/WarningsTab";
import PaymentLogsTab from "./tabContents/PaymentLogs";

interface StudentTabProps {
  mode?: string;
  data?: any;
}

const StudentTab = ({ mode, data }: StudentTabProps) => {
  const [isValue, setIsValue] = useState("profile");

  return (
    <Card className="pt-4 rounded-xl shadow-sm border border-gray-200 mt-4">
      <Tabs defaultValue={isValue}>
        <TabsList className="w-full border-b border-gray-200">
          <TabButton value="profile" label="Profile" onClick={setIsValue} />
          <TabButton value="registration_details" label="Registration Details" onClick={setIsValue} />
          {mode === "registry" && <TabButton value="progression" label="Progression" onClick={setIsValue} />}
          {mode === "support" && <TabButton value="engagement" label="Engagement" onClick={setIsValue} />}
          <TabButton value="documents" label="Documents" onClick={setIsValue} />
          <TabButton value="notes" label="Notes" onClick={setIsValue} />
          <TabButton value="warnings" label="Warnings" onClick={setIsValue} />
          <TabButton value="change_logs" label="Change Logs" onClick={setIsValue} />
          {mode === "registry" && <TabButton value="payment_logs" label="Payment History" onClick={setIsValue} />}
        </TabsList>
        <ScrollArea className="pb-8">
          <TabsContent value="profile">
            <ProfileTab profileInfo={data?.profileInfo} mode={mode}/>
          </TabsContent>
          <TabsContent value="registration_details">
            <RegistrationDetailsTab regDetails={data?.registrationDetails} mode={mode}/>
          </TabsContent>
          <TabsContent value="progression">
            <ProgressionTab mode={mode}/>
          </TabsContent>
          <TabsContent value="engagement">
            <EngagementTab mode="support"/>
          </TabsContent>
          <TabsContent value="documents">
            <DocumentsTab mode={mode} documents={data?.documents?.supportingDocumentAttachments}/>
          </TabsContent>
          <TabsContent value="notes">
            <NotesTab notes={data?.notes} />
          </TabsContent>
          <TabsContent value="warnings">
            <WarningsTab mode={mode}/>
          </TabsContent>
          <TabsContent value="change_logs">
            <LogsTab mode={mode}/>
          </TabsContent>
          <TabsContent value="payment_logs">
            <PaymentLogsTab mode={mode}/>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </Card>
  );
};

export default StudentTab;
