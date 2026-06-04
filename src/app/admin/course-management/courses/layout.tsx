import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EducateU | Course Management",
  description: "Course Management",
};

export default function AdminCourseManagement({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <AdminProtectedAgentRoute>
    <div>{children}</div>
  );
}
