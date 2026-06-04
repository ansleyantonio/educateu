/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import DynamicTableWithPagination from "@/components/common/DynamicTable/DynamicTable";
import Link from "next/link";
import { DuplicateLessonModal } from "./duplicate/DuplicateLessonModal";
import { UpdateLessonModal } from "./update/UpdateLessonModal";
import { ViewLessonModal } from "./modal/ViewLessonModal";
import { ResponsiveButtonGroup } from "@/components/common/button/responsiveButtons";

interface ModuleProps {
  currentPage: number;
  lessonData: any;
  setCurrentPage: (data: number) => void;
  isLoading: boolean;
  totalPages: number;
}
const LessonList = ({
  currentPage,
  setCurrentPage,
  lessonData,
  isLoading,
  totalPages,
}: ModuleProps) => {

  const typeMap: Record<string, string> = {
    DEGREE: "Degree",
    DIPLOMA: "Diploma",
    CPD: "CPD",
    PROFESSIONAL_CERTIFICATE: "Professional Certificate",
  };

  return (
    <>
      <DynamicTableWithPagination
        isLoading={isLoading}
        data={lessonData || []}
        pagination={{
          page: currentPage,
          total: lessonData?.length || 0,
          totalPages: totalPages,
        }}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        config={{
          columns: [
            {
              key: "title",
              header: "Lesson Title",
              render: (lesson) => (
                <Link
                  href={`lessons/${lesson?.title}/${lesson?.id}`}
                  className="text-blue-700 transition cursor-pointer hover:opacity-80"
                >
                  {" "}
                  {lesson.title}
                </Link>
              ),
            },
            {
              key: "awardingBody",
              header: "Awarding Body",
              render: (lesson) =>
                lesson?.awardingBody?.name ||
                lesson?.accredationBody?.name || <p className="ml-5">-</p>,
            },
            {
              key: "code",
              header: "Lesson Code",
              render: (lesson) => lesson.code,
            },
            {
              key: "type",
              header: "Lesson Type",
              render: (lesson) => typeMap[lesson.type] || lesson.type,
            },
            {
              key: "estimatedTimeToComplete",
              header: "Est. Time",
              render: (lesson) => (
                <>
                  {lesson.estimatedTimeToComplete}{" "}
                  {["DEGREE", "DIPLOMA"].includes(lesson?.type) ? "Hr" : "Min"}
                </>
              ),
            },
            {
              key: "action",
              header: "Action",
              render: (lesson) => (
                <ResponsiveButtonGroup>
                  <UpdateLessonModal data={lesson} />
                  <ViewLessonModal data={lesson} />
                  <DuplicateLessonModal existingModule={lesson} />
                </ResponsiveButtonGroup>
              ),
            },
          ],
        }}
      />
    </>
  );
};

export default LessonList;
