"use client"
import AcademicOverview from "./ProgressionTabComponents/AcademicOverview"
import CourseProgression from "./ProgressionTabComponents/CourseProgression"
import OngoingCourses from "./ProgressionTabComponents/OngoingCourses"
import GraduationEligibilityTab from "./ProgressionTabComponents/GraduationEligibilityTab"
import { Card } from "@/components/ui/card"

interface ProgressionTabProps {
  mode?: string;
}

const ProgressionTab = ({ mode }: ProgressionTabProps) => {
  return (
    <div className="m-0 p-0">
        {/* <AcademicOverview mode={mode}/>
        <CourseProgression />
        <OngoingCourses />
        <GraduationEligibilityTab /> */}
        <Card className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Hold tight! </h3>
            <p className="text-sm text-gray-500 mb-4">
              These tab will be ready to use once the student portal is live
            </p>
          </div>
        </Card>
    </div>
  )
}

export default ProgressionTab