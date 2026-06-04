"use client";
import { Card } from "@/components/ui/card";
import { Timeline } from "@/components/ui/custom_ui/timeline";

interface LogsTabProps {
  mode?: string;
}

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
};

type AuditLog = {
  id: string;
  action: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: User;
};

type AuditLogsResponse = {
  auditLogs: AuditLog[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
};

const mockData: AuditLogsResponse = {
  auditLogs: [
    {
      id: "1",
      action: "logged in",
      userId: "u1",
      createdAt: "2024-07-12T14:32:00Z",
      updatedAt: "2024-07-12T14:32:00Z",
      user: {
        id: "u1",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        username: "johndoe",
      },
    },
    {
      id: "2",
      action: "updated profile",
      userId: "u2",
      createdAt: "2024-07-12T15:00:00Z",
      updatedAt: "2024-07-12T15:00:00Z",
      user: {
        id: "u2",
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
        username: "janesmith",
      },
    },
    {
      id: "3",
      action: "deleted user",
      userId: "u3",
      createdAt: "2024-07-11T10:15:00Z",
      updatedAt: "2024-07-11T10:15:00Z",
      user: {
        id: "u3",
        firstName: "Admin",
        lastName: "User",
        email: "admin@example.com",
        username: "adminuser",
      },
    },
  ],
  totalRecords: 3,
  totalPages: 1,
  currentPage: 1,
};

const LogsTab = ({ mode }: LogsTabProps) => {

  // console.log("LOGS TAB", mode)

  return (
    <div className="mt-4">
      {/* <Timeline items={mockData} isLoading={false} />
       */}
       <Card className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Hold tight! </h3>
            <p className="text-sm text-gray-500 mb-4">
              These tab will be ready to use once the student portal is live
            </p>
          </div>
        </Card>
    </div>
  );
};

export default LogsTab;