"use client";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
} from "@/components/ui/custom_ui/invitation_tabs";
import { useState } from "react";
import { TabButton } from "./_assets/components/tab_button";
import InvitationTable from "./_assets/components/invitation_table";
import AssessmentInvitations from "./_assets/components/AssessmentInvitations/assessmentInvitations";

const InvitationsPage = () => {
  const [isValue, setIsValue] = useState("interviewer_reminder");
  return (
    <Card>
      <Tabs defaultValue="interviewer_reminder">
        {/* Header */}
        <div className="flex gap-2 items-center p-4 mb-2 font-semibold">
          <h3>Invitations</h3>
          <p className="flex justify-center items-center w-8 h-6 text-sm rounded-full border bg-[#F0F9FF]">
            10
          </p>
        </div>

        <TabsList>
          <TabButton
            value="interviewer_reminder"
            label="Interviewer Reminder"
            count={interviewData?.length}
            isActive={isValue === "interviewer_reminder"}
            onClick={setIsValue}
          />
          <TabButton
            value="assessment_invitations"
            label="Assessment Invitations"
            count={3}
            isActive={isValue === "assessment_invitations"}
            onClick={setIsValue}
          />
        </TabsList>

        <hr />
        <div className="-mt-2">
          {/* content */}
          <TabsContent value="interviewer_reminder">
            <InvitationTable data={interviewData} />
          </TabsContent>
          <TabsContent value="assessment_invitations">
            <AssessmentInvitations />
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
};

export default InvitationsPage;

const interviewData = [
  {
    id: "1",
    userName: "JohnDoe",
    applyDate: "2025-01-15",
    interviewerName: "Jane Smith",
    interviewDate: "2025-02-01 10:00 AM",
  },
  {
    id: "2",
    userName: "AliceBrown",
    applyDate: "2025-01-18",
    interviewerName: "Mark Johnson",
    interviewDate: "2025-02-02 11:30 AM",
  },
  {
    id: "3",
    userName: "BobMartin",
    applyDate: "2025-01-20",
    interviewerName: "Susan Lee",
    interviewDate: "2025-02-03 09:00 AM",
  },
  {
    id: "4",
    userName: "CharlieWhite",
    applyDate: "2025-01-22",
    interviewerName: "David Brown",
    interviewDate: "2025-02-04 02:00 PM",
  },
  {
    id: "5",
    userName: "EvaGreen",
    applyDate: "2025-01-25",
    interviewerName: "Emma Davis",
    interviewDate: "2025-02-05 03:30 PM",
  },
  {
    id: "6",
    userName: "HarryBlue",
    applyDate: "2025-01-27",
    interviewerName: "Chris Taylor",
    interviewDate: "2025-02-06 12:00 PM",
  },
  {
    id: "7",
    userName: "LilyPink",
    applyDate: "2025-01-28",
    interviewerName: "Olivia Wilson",
    interviewDate: "2025-02-07 01:30 PM",
  },
];
