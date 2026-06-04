import FacultyProtectedRoute from "./faculty/_assets/components/page_components/AdminProtectedRoute";
import CusFacultyLayout from "./faculty/_assets/components/root_layout/CusFacultyLayout";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Faculty Management",
  description: "Faculty Management",
};
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FacultyProtectedRoute>
      {/* <section className=""> */}
      <CusFacultyLayout>{children}</CusFacultyLayout>
      {/* </section> */}
    </FacultyProtectedRoute>
  );
}
