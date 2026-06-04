import { useBreadcrumb } from "@/app/hook/breadcrumb/useBreadcrumb";

const MainContentLayout = ({ children }: { children: React.ReactNode }) => {
  const { breadcrumbs } = useBreadcrumb();

  return (
    <main
      className={`overflow-x-auto overflow-y-auto p-3 w-full bg-gray-50 ${
        breadcrumbs && breadcrumbs?.length > 0
          ? "h-[calc(100vh-7rem)]"
          : "h-[calc(100vh-4rem)]"
      } `}
    >
      {children}
    </main>
  );
};

export default MainContentLayout;
