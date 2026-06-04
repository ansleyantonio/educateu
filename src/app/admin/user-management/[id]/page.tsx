"use client";
import { ScrollArea } from "@/components/ui/custom_ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { fetchSingleUser } from "./-assets/components/controller/fetchSingleUser";
import UserAuditLog from "./-assets/components/pageComponent/UserAuditLog";
import UserInfo from "./-assets/components/pageComponent/UserInfo";
import { useAuths } from "@/hooks/userContext";

export default function CreateUserPage() {
  const auth = useAuths();
  const token = auth?.user?.token;
  const params = useParams();
  const { id } = params;
  const userId = id as string;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["fetch-list-single-user", { token, userId }],
    queryFn: fetchSingleUser,
  });

  return (
    <div className="p-3 min-h-screen bg-gray-50">
      <PageWithBreadcrumb
        items={[
          { title: "Home" },
          { title: "User Management", href: "/admin/user-management" },
          {
            title: `${data?.user?.firstName ?? ""} ${data?.user?.lastName ?? ""}`,
            // href: `/admin/user-management/${userId}`, 
          }
        ]}
      >
        <div className="p-6 mx-auto max-w-6xl bg-white rounded-lg shadow-lg">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid grid-cols-2 gap-x-2 w-full bg-gray-100">
              <TabsTrigger
                value="general"
                className="text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
              >
                General
              </TabsTrigger>
              <TabsTrigger
                value="audit"
                className="text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
              >
                Audit Log
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <ScrollArea className="w-full h-[calc(100vh-220px)]">
                <div className="mt-6">
                  {isLoading ? (
                    <p className="text-center text-gray-500">
                      Loading User data...
                    </p>
                  ) : (
                    <UserInfo
                      data={data?.user}
                      showEditButton
                      onUpdated={refetch}
                    />
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="audit">
              <ScrollArea className="w-full h-[calc(100vh-220px)]">
                <div className="mt-6">
                  {isLoading ? (
                    <p className="text-center text-gray-500">
                      Loading User Audit Log data...
                    </p>
                  ) : (
                    <UserAuditLog id={userId} user={data?.user} />
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </PageWithBreadcrumb>
    </div>
  );
}
