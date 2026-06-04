/* eslint-disable @typescript-eslint/no-explicit-any */
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import ExpandableText from "@/utils/EnabledText";
import dateFormat from "@/utils/DateFormatter";
import AssignAssessmentsModal from "./assign/assignAssessmentsModal";

interface ModuleProps {
  id: string;
  setIsWaiting: React.Dispatch<React.SetStateAction<boolean>>;
  assignedData: Array<any>;
  searchTerm: string;
  setTotalAssessments: (value: number) => void;
}

const AssessmentsComponent = ({
  id,
  setIsWaiting,
  searchTerm,
  assignedData,
  setTotalAssessments,
}: ModuleProps) => {
  const { data, isLoading } = useFetchData({
    path: `course-modules/${id}/available-assessments${
      searchTerm && `?searchTerm=${searchTerm}`
    }`,
    queryKey: "fetch-assignable-lesson-assessment-list",
    enabled: true,
  });

  if (data?.data?.availableAssessments) {
    setTotalAssessments(data?.data?.availableAssessments?.length);
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
          data?.data?.availableAssessments?.map(
            (assessment: any, i: number) => (
              <div
                key={i}
                className="p-3 mb-5 w-full bg-white rounded-2xl border border-gray-200 shadow-sm transition-shadow duration-300 sm:p-4 hover:shadow-md"
              >
                {/* Title */}
                <h2 className="mb-2 text-base font-semibold text-gray-800 break-words sm:text-lg">
                  {assessment?.nameOrTitle}
                </h2>

                {/* Outcome + Assign Button */}
                <div className="flex flex-col gap-3 justify-between items-start mb-4 sm:flex-row sm:items-center">
                  {/* Outcome text with expandable */}
                  <ExpandableText
                    text={assessment?.descriptionOrInstructions}
                  />

                  {/* Assign button aligned right on larger screens */}
                  <div className="flex justify-end w-full sm:w-auto">
                    <AssignAssessmentsModal
                      assessment={assessment}
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
                      {assessment?.timeLimit} Days
                      {/* {assessment?.availableStartDate} - */}
                      {/* {assessment?.availableEndDate} */}
                    </span>
                  </p>

                  {/* Date */}
                  <p className="text-xs text-gray-400 sm:text-sm">
                    {dateFormat.fullDateTime(assessment?.createdAt)}
                  </p>
                </div>
              </div>
            ),
          )
        )}
      </div>
    </div>
  );
};

export default AssessmentsComponent;
