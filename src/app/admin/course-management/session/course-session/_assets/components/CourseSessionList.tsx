/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusWithIcon } from "@/utils/status_point";
import { AttachedCourses } from "./attachedCourses/attachedCoursesModal";
import { DuplicateSession } from "./duplicate/duplicateSessionModal";
import { ViewSession } from "./view/viewSessionModal";
import ConnectCoursesModal from "./connectCourse/connectCoursesModal";
import { ResponsiveButtonGroup } from "@/components/common/button/responsiveButtons";
import DynamicTableWithPagination from "@/components/common/DynamicTable/DynamicTable";

interface ModuleProps {
  currentPage: number;
  data: any;
  setCurrentPage: (data: number) => void;
  isLoading: boolean;
}

const CourseSessionList = ({
  data,
  isLoading,
  setCurrentPage,
  currentPage,
}: ModuleProps) => {
  return (
    <>
      <DynamicTableWithPagination
        data={data?.data?.sessions}
        isLoading={isLoading}
        pagination={data?.pagination}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        config={{
          columns: [
            {
              key: "name",
              header: "Sessions",
              render: (item: any) => (
                <ViewSession data={item} title={item?.name} />
              ),
            },
            {
              key: "intakePeriod",
              header: "Intake Period",
              render: (item: any) => item?.intakePeriod,
            },
            {
              key: "year",
              header: "Session Year",
              render: (item: any) => item?.year,
            },
            {
              key: "status",
              header: "Session Status",
              render: (item: any) => <StatusWithIcon status={item?.status} />,
            },
            {
              key: "action",
              header: "Action",
              render: (item) => (
                <ResponsiveButtonGroup>
                  <ConnectCoursesModal id={item?.id} />

                  <ViewSession data={item} />

                  <DuplicateSession sessionData={item} />

                  <AttachedCourses sessionData={item} />

                  {/* <ActionButton */}
                  {/*   disabled={!editAccess} */}
                  {/*   imageSrc={fileDownload} */}
                  {/*   variant="icon" */}
                  {/*   tooltipContent="Download" */}
                  {/* /> */}
                </ResponsiveButtonGroup>
              ),
            },
          ],
        }}
      />
    </>
  );
};

export default CourseSessionList;
