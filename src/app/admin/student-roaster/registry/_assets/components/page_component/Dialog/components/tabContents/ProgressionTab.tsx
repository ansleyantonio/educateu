"use client"
import AcademicOverview from "./ProgressionTabComponents/AcademicOverview"
import CourseProgression from "./ProgressionTabComponents/CourseProgression"
import OngoingCourses from "./ProgressionTabComponents/OngoingCourses"
import GraduationEligibilityTab from "./ProgressionTabComponents/GraduationEligibilityTab"

const ProgressionTab = () => {
  return (
    <div className="m-0 p-0">
        <AcademicOverview />
        <CourseProgression />
        <OngoingCourses />
        <GraduationEligibilityTab />
    </div>
  )
}

export default ProgressionTab