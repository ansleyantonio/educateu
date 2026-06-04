import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Management",
  description: "User Management",
};

export default function AdminUserManagement({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <AdminProtectedAgentRoute>
    <div className="pr-4">{children}</div>
  );
}
