import { Timeline } from "@/components/ui/custom_ui/timeline";

const HistoryTab = () => {
  return (
    <div>
      <Timeline isLoading={false} items={demoItems} />
    </div>
  );
};

export default HistoryTab;

///TODO: Remove This Mock Data
export const demoItems = {
  auditLogs: [
    {
      id: "log-1",
      action: "user_creation",
      userId: "user-1",
      createdAt: "2025-07-09T08:30:00.000Z",
      updatedAt: "2025-07-09T08:30:00.000Z",
      user: {
        id: "user-1",
        firstName: "Alice",
        lastName: "Ahmed",
        email: "alice@example.com",
        username: "alice_ahmed",
      },
    },
    {
      id: "log-2",
      action: "password_reset",
      userId: "user-2",
      createdAt: "2025-07-08T15:45:00.000Z",
      updatedAt: "2025-07-08T15:45:00.000Z",
      user: {
        id: "user-2",
        firstName: "Bob",
        lastName: "Rahman",
        email: "bob@example.com",
        username: "bob_rahman",
      },
    },
    {
      id: "log-3",
      action: "role_assign",
      userId: "user-3",
      createdAt: "2025-07-07T11:20:00.000Z",
      updatedAt: "2025-07-07T11:20:00.000Z",
      user: {
        id: "user-3",
        firstName: "Charlie",
        lastName: "Khan",
        email: "charlie@example.com",
        username: "charlie_k",
      },
    },
  ],
  totalRecords: 3,
  totalPages: 1,
  currentPage: 1,
};
