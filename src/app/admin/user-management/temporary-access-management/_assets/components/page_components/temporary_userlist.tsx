/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import ListOfUserLOaderLoader from "@/app/admin/user-management/_assets/components/page_components/loading_page/listOfUserList";
import TooltipComponent from "@/components/common/TooltipComponent";
import { ScrollArea } from "@/components/ui/custom_ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableRow,
} from "@/components/ui/table";
import { TemporaryAccessListBySingleUser } from "./modal/listOfTemporaryBySingleUserModal";
import DynamicTableWithPagination from "@/components/common/DynamicTable/DynamicTable";

interface ListOfUsersProps {
  data: any;
  isLoading: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

const UserListOfTemporaryAccess = ({
  data,
  isLoading,
  currentPage,
  setCurrentPage,
}: ListOfUsersProps) => {
  // Extract users and pagination data
  const users = data?.data?.users || [];
  const paginationData = {
    totalPages: data?.data?.totalPages || 1,
    total: data?.data?.total || 0,
    page: currentPage,
  };

  return (
            <DynamicTableWithPagination
              data={users}
              isLoading={isLoading}
              pagination={paginationData}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              config={{
                columns: [
                  {
                    key: "userName",
                    header: "User Name",
                    render: (user: any) => (
                      <TemporaryAccessListBySingleUser user={user} />
                    ),
                  },
                  {
                    key: "email",
                    header: "Email",
                    className: "whitespace-nowrap max-w-[370px] truncate text-ellipsis",
                    render: (user: any) => (
                      <TooltipComponent
                        lowercase={true}
                        text={user?.email}
                      />
                    ),
                  },
                  {
                    key: "portalCategory",
                    header: "Portal Category",
                    className: "capitalize",
                    render: (user: any) => (
                      <span className="capitalize">
                        {user.portalCategory ? user.portalCategory : "Not Assigned"}
                      </span>
                    ),
                  },
                  {
                    key: "role",
                    header: "Roles",
                    className: "capitalize",
                    render: (user: any) => (
                      <span className="capitalize">
                        {user.role ? user.role : "Not Assigned"}
                      </span>
                    ),
                  },
                ],
                emptyMessage: "No data found",
              }}
            />
          )
};

export default UserListOfTemporaryAccess;
