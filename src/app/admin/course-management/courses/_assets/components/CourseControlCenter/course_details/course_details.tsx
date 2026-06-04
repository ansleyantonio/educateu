/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import ViewProfessionalCourseForm from "../../../../professional-certificate-course/_assets/components/view-update/viewProfessionalCourseForm";
import ViewCPDCourseForm from "../../../../cpd-course/_assets/components/view_update/viewCPDCourseForm";
import ViewAdvanceCourseForm from "../../advanceCourseComponent/view-update/viewAdvanceCourseForm";

const CourseDetails = ({ course }: { course: any }) => {
  const [isEdit, setIsEdit] = useState(true);

  return (
    <>
      {/* Advance Module */}
      {["DIPLOMA_COURSE", "DEGREE_COURSE"].includes(course?.courseType) && (
        <ViewAdvanceCourseForm
          queryKeys="fetch_single_course_details"
          course={course}
          isEdit={isEdit}
          setIsEdit={setIsEdit}
        />
      )}

      {/* CPD Module */}
      {course?.courseType === "CPD_COURSE" && (
        <ViewCPDCourseForm
          queryKeys="fetch_single_course_details"
          course={course}
          isEdit={isEdit}
          setIsEdit={setIsEdit}
        />
      )}

      {/* Professional Certificate Module */}
      {course?.courseType === "PROFESSIONAL_COURSE" && (
        <ViewProfessionalCourseForm
          queryKeys="fetch_single_course_details"
          course={course}
          isEdit={isEdit}
          setIsEdit={setIsEdit}
        />
      )}
    </>
  );
};

export default CourseDetails;
