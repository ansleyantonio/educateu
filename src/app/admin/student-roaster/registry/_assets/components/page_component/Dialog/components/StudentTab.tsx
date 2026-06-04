"use client";
import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
} from "@/components/ui/custom_ui/invitation_tabs";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/custom_ui/scroll-area";
import { TabButton } from "@/components/ui/TabButton";
import ProfileTab from "./tabContents/ProfileTab";
import RegistrationDetailsTab from "./tabContents/RegistrationDetailsTab";
import ProgressionTab from "./tabContents/ProgressionTab";
import DocumentsTab from "./tabContents/DocumentsTab";
import NotesTab from "./tabContents/NotesTab";
import WarningsTab from "./tabContents/WarningsTab";
import LogsTab from "./tabContents/LogsTab";

const StudentTab = () => {
  const [isValue, setIsValue] = useState("profile");

  return (
    <Card className="pt-4 rounded-xl shadow-sm border border-gray-200 mt-4">
      <Tabs defaultValue={isValue}>
        <TabsList className="w-full border-b border-gray-200">
          <TabButton value="profile" label="Profile" onClick={setIsValue} />
          <TabButton value="registration_details" label="Registration Details" onClick={setIsValue} />
          <TabButton value="progression" label="Progression" onClick={setIsValue} />
          <TabButton value="documents" label="Documents" onClick={setIsValue} />
          <TabButton value="notes" label="Notes" onClick={setIsValue} />
          <TabButton value="warnings" label="Warnings" onClick={setIsValue} />
          <TabButton value="change_logs" label="Change Logs" onClick={setIsValue} />
        </TabsList>
        <ScrollArea className="pb-8">
          <TabsContent value="profile">
            <ProfileTab />
          </TabsContent>
          <TabsContent value="registration_details">
            <RegistrationDetailsTab />
          </TabsContent>
          <TabsContent value="progression">
            <ProgressionTab />
          </TabsContent>
          <TabsContent value="documents">
            <DocumentsTab />
          </TabsContent>
          <TabsContent value="notes">
            <NotesTab />
          </TabsContent>
          <TabsContent value="warnings">
            <WarningsTab />
          </TabsContent>
          <TabsContent value="change_logs">
            <LogsTab />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </Card>
  );
};

export default StudentTab;
