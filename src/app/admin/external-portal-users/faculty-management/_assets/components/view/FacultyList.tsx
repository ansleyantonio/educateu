/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import DynamicTableWithPagination from "@/components/common/DynamicTable/DynamicTable";
import { ResponsiveButtonGroup } from "@/components/common/button/responsiveButtons";
import { StatusWithIcon } from "@/utils/status_point";
import { AssignCourseModal } from "../modal/AssignCourseModal";
import { FacultyPermissionsModal } from "../modal/FacultyPermissionsModal";
import { FacultyUserLoginConfirmModal } from "../modal/facultyUserLoginConfirmModal";
import { UpdateFacultyModal } from "../modal/UpdateFacultyModal";
import UserINfo from "../modal/UserInfo";
interface PaginationProps {
  count: number;
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
interface ModuleProps {
  currentPage: number;
  FacultyData: any;
  setCurrentPage: (data: number) => void;
  isLoading: boolean;
  pagination: PaginationProps;
}
const FacultyList = ({
  currentPage,
  setCurrentPage,
  FacultyData,
  isLoading,
  pagination,
}: ModuleProps) => {
  return (
    <>
      <DynamicTableWithPagination
        isLoading={isLoading}
        data={FacultyData || []}
        pagination={{
          page: currentPage,
          total: FacultyData?.length || 0,
          totalPages: pagination?.totalPages,
        }}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        config={{
          columns: [
            {
              key: "facultyName",
              header: "Faculty Name",
              render: (faculty) => <UserINfo user={faculty} />,
            },
            {
              key: "roleName",
              header: "Role Name",
              render: (faculty) => faculty.roleName,
            },
            {
              key: "status",
              header: "Status",
              render: (faculty) => (
                <StatusWithIcon status={faculty.userStatus} />
              ),
            },
            {
              key: "action",
              header: "Action",
              render: (faculty) => (
                <ResponsiveButtonGroup>
                  {/* Update Faculty */}
                  <UpdateFacultyModal data={faculty} />
                  {/* View Faculty */}
                  {/* <ViewFacultyModal data={faculty} /> */}
                  {/* Assign Course */}
                  <AssignCourseModal
                    id={faculty.id}
                    firstName={faculty.firstName}
                    lastName={faculty.lastName}
                  />
                  {/* Permissions */}
                  <FacultyPermissionsModal
                    id={faculty.id}
                    firstName={faculty.firstName}
                    lastName={faculty.lastName}
                  />
                  <FacultyUserLoginConfirmModal id={faculty.id} />
                  {/* View Course */}
                  {/* <Button
                      variant="outline"
                      size="icon"
                      className="hover:border-blue-700"
                    >
                      <Image src={user} alt="Edit" width={18} height={18} />
                    </Button> */}
                </ResponsiveButtonGroup>
              ),
            },
          ],
        }}
      />
    </>
  );
};

export default FacultyList;
