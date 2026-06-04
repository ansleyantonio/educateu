import AdminProtectedRoutes from "./_assets/components/page_components/AdminProtectedRoute";
import CusAdminLayout from "./_assets/components/root_layout/CusAdminLayout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProtectedRoutes>
      {/* <section className=""> */}
      {/* <BreadcrumbProvider> */}
      <CusAdminLayout>{children}</CusAdminLayout>
      {/* </section> */}
      {/* </BreadcrumbProvider> */}
    </AdminProtectedRoutes>
  );
}
