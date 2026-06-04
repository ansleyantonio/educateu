/* eslint-disable @typescript-eslint/no-explicit-any */
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import ExpandableText from "@/utils/EnabledText";
import dateFormat from "@/utils/DateFormatter";
import AssignLessonModal from "./assign/assignLessonModal";

interface ModuleProps {
  id: string;
  setIsWaiting: React.Dispatch<React.SetStateAction<boolean>>;
  assignedData: Array<any>;
  searchTerm: string;
  setTotalLessons: (value: number) => void;
}

const LessonComponent = ({
  id,
  setIsWaiting,
  searchTerm,
  assignedData,
  setTotalLessons,
}: ModuleProps) => {
  const { data, isLoading } = useFetchData({
    path: `course-modules/${id}/available-lessons${
      searchTerm && `?searchTerm=${searchTerm}`
    }`,
    queryKey: "fetch-assignable-lesson-assessment-list",
  });

  if (data?.data?.availableLessons) {
    setTotalLessons(data?.data?.availableLessons?.length);
  }

  return (
    <div>
      <div className="mt-4">
        {isLoading ? (
          <div className="flex justify-center items-center mt-16 h-64">
            <div className="w-8 h-8 rounded-full border-b-2 border-blue-600 animate-spin"></div>
          </div>
        ) : data?.data?.availableLessons?.length === 0 ? (
          <div className="flex justify-center">
            <div className="col-span-12 lg:col-span-8">
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <div className="mb-2 text-gray-400">📚</div>
                  <div className="text-gray-500">No lessons available</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          data?.data?.availableLessons?.map((lesson: any, i: number) => (
            <div
              key={i}
              className="p-3 mb-5 w-full bg-white rounded-2xl border border-gray-200 shadow-sm transition-shadow duration-300 sm:p-4 hover:shadow-md"
            >
              {/* Title */}
              <h2 className="mb-2 text-base font-semibold text-gray-800 break-words sm:text-lg">
                {lesson?.title}
              </h2>

              {/* Outcome + Assign Button */}
              <div className="flex flex-col gap-3 justify-between items-start mb-4 sm:flex-row sm:items-center">
                {/* Outcome text with expandable */}
                <ExpandableText text={lesson?.outcome} />

                {/* Assign button aligned right on larger screens */}
                <div className="flex justify-end w-full sm:w-auto">
                  <AssignLessonModal
                    lesson={lesson}
                    id={id}
                    setIsWaiting={setIsWaiting}
                    assignedData={assignedData}
                  />
                </div>
              </div>

              {/* Footer Section */}
              <div className="flex flex-row gap-3 justify-between items-start lg:flex-col xl:flex-row">
                {/* Estimated Time */}
                <p className="flex gap-1 items-center text-xs font-medium text-gray-500 sm:text-sm">
                  <span className="font-semibold text-blue-600">
                    {lesson?.estimatedTimeToComplete}
                  </span>
                  {["DEGREE", "DIPLOMA"].includes(lesson?.type)
                    ? "hr"
                    : ["CPD", "PROFESSIONAL_CERTIFICATE"].includes(lesson?.type)
                      ? "min"
                      : ""}
                </p>

                {/* Date */}
                <p className="text-xs text-gray-400 sm:text-sm">
                  {dateFormat.fullDateTime(lesson?.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LessonComponent;
