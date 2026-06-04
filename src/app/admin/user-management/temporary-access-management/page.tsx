"use client";
import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import CommonSearch from "@/components/common/search/commonSearch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/custom_ui/customCard";
import { useAuths } from "@/hooks/userContext";
import { useQuery } from "@tanstack/react-query";
import { RefreshCcw } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { HiOutlineFilter } from "react-icons/hi";
import { FilterTemporaryUserList } from "./_assets/components/page_components/filterTempurary";
import UserListOfTemporaryAccess from "./_assets/components/page_components/temporary_userlist";
import { fetchTemporaryAccessListOfUsers } from "./_assets/controller/assign_system_permission";

const AdminUserPermission = () => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [TemporaryUserFilterData, setTemporaryUserFilterData] = useState(null);
  const auth = useAuths();
  const token = auth?.user?.token;
  const params = useSearchParams();
  const page = Number(params.get("page")) || 1;
  const [searchText, setSearchText] = useState("");

  const [currentPage, setCurrentPage] = useState(page);
  const { data, isLoading } = useQuery({
    queryKey: [
      "fetch-temporary-access-list",
      { page: currentPage, searchText, TemporaryUserFilterData, token },
    ],
    queryFn: fetchTemporaryAccessListOfUsers,
  });

  // useEffect(() => {
  //   setCurrentPage(page);
  // }, [page]);

  return (
    <PageWithBreadcrumb
      items={[
        { title: "Home", href: "/admin" },
        // { title: "User Management", href: "/admin/user-management/temporary-access-management" },
        {
          title: "Temporary Access Management",
          href: "/admin/user-management/temporary-access-management",
        },
      ]}
    >
      <div>
        <h1 className="font-bold tracking-wide leading-6 text-[24px] text-[#272E35] mb-4">
          Temporary Access Management
        </h1>

        <Card>
          {/* search plus filter */}

          <div className="flex gap-2 flex-wrap justify-between items-center py-4 px-6">
            <div className="flex gap-2 items-center">
              <h1 className="text-base font-bold leading-6 text-black">
                User List
              </h1>
              <span className="flex gap-x-2 items-center py-1 px-2 text-xs rounded-full text-[#013E5B] bg-[#F0F9FF]">
                {data?.data?.totalRecords || 0} users
                {/* {data?.totalUsers || 0} users */}
              </span>
            </div>

            {/* <div className="flex gap-x-3 justify-start w-full"> */}
            <div className="flex gap-3 items-center flex-wrap">
              <div
                className="py-2 px-3 cursor-pointer active:rotate-90"
                onClick={() => {
                  setTemporaryUserFilterData(null);
                  setIsOpenModal(false);
                  setCurrentPage(1);
                  setSearchText("");
                }}
              >
                <RefreshCcw />
              </div>
              <CommonSearch
                searchText={searchText}
                setSearchText={setSearchText}
              />
              <Button
                onClick={() => setIsOpenModal(true)}
                variant="outline"
                size="sm"
                className="p-2 h-10 font-semibold text-[#555F6D]"
              >
                <HiOutlineFilter size={25} color="#555F6D" />
                Filter
              </Button>
              <FilterTemporaryUserList
                setCurrentPage={setCurrentPage}
                setTemporaryUserFilterData={setTemporaryUserFilterData}
                setIsOpenModal={setIsOpenModal}
                isOpenModal={isOpenModal}
              />
            </div>
          </div>

          {/* list of users */}
          <div>
            <UserListOfTemporaryAccess
              data={data}
              isLoading={isLoading}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </div>
        </Card>
      </div>
    </PageWithBreadcrumb>
  );
};

export default AdminUserPermission;
