/* eslint-disable @typescript-eslint/no-explicit-any */
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import DataLoader from "@/components/common/GlobalLoader/dataLoader";
import NoDataComponent from "@/components/common/GlobalLoader/empty";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TruncateText } from "@/utils/TruncateText";
import { Clock, GraduationCap } from "lucide-react";
import UnassignCourse from "./unassignCourse";

function getCourseTypeVariant(courseType: string) {
  return courseType === "PROFESSIONAL_COURSE" ? "default" : "secondary";
}

export default function CoursesInfoTable({
  sessionData,
}: {
  sessionData: any;
}) {
  const { data, isLoading } = useFetchData({
    path: `session/${sessionData?.id}/courses`,
    queryKey: "fetch-session-assigned-courses",
  });
  const existingCourses = data?.data?.sessionCourses;

  return (
    <div className="rounded-md border">
      {isLoading ? (
        // Loader state
        <div className="flex justify-center items-center pt-5 min-h-[200px]">
          <DataLoader />
        </div>
      ) : existingCourses?.length === 0 ? (
        // No data state
        <div className="flex justify-center items-center pt-5 min-h-[200px]">
          <NoDataComponent />
        </div>
      ) : (
        // Table content
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Course Details</TableHead>
              <TableHead className="font-semibold">Type</TableHead>
              <TableHead className="font-semibold">Study Modes</TableHead>
              <TableHead className="font-semibold">Duration</TableHead>
              <TableHead className="font-semibold">Accreditation</TableHead>
              <TableHead className="font-semibold">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {existingCourses?.map((item: any) => {
              const course = item?.course;

              if (!course) return null; // Safety check

              return (
                <TableRow key={course.id} className="hover:bg-muted/50">
                  {/* Course Details */}
                  <TableCell className="space-y-1">
                    <div className="text-lg font-medium">{course?.title}</div>
                    <div className="text-sm text-muted-foreground">
                      Code: {course.code}
                    </div>
                    <div className="max-w-xs text-sm text-muted-foreground">
                      <TruncateText
                        weight="[110px]"
                        text={course.courseDescription}
                      />
                    </div>
                  </TableCell>

                  {/* Course Type */}
                  <TableCell>
                    <Badge variant={getCourseTypeVariant(course.courseType)}>
                      {course.courseType === "PROFESSIONAL_COURSE"
                        ? "Professional"
                        : "CPD"}
                    </Badge>
                  </TableCell>

                  {/* Study Modes */}
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {course.studyModes?.map((mode: string, i: number) => {
                        const formattedMode = mode
                          .replace(/_/g, " ")
                          .toLowerCase()
                          .replace(/\b\w/g, (c) => c.toUpperCase()); // INSTRUCTOR_LED -> Instructor Led

                        return (
                          <span
                            key={i}
                            title={formattedMode} // Tooltip shows full text
                            className="py-1 px-2 text-xs font-thin text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 rounded-full border border-blue-200 shadow-sm max-w-[120px] truncate"
                          >
                            {formattedMode}
                          </span>
                        );
                      })}
                    </div>
                  </TableCell>

                  {/* Duration */}
                  <TableCell>
                    <div className="flex gap-1 items-center">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">
                        {course.durationLength}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Year
                      </span>
                    </div>
                  </TableCell>

                  {/* Accreditation Info */}
                  <TableCell>
                    <div className="flex gap-1 items-center">
                      <GraduationCap className="w-4 h-4 text-muted-foreground" />
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {course.professionalAccreditation}
                        </div>
                        {course.accreditationStatus && (
                          <Badge variant="outline" className="text-xs">
                            {course.accreditationStatus}
                          </Badge>
                        )}
                        {course.accreditationBodyCode && (
                          <div className="text-xs text-muted-foreground">
                            Body: {course.accreditationBodyCode}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Action */}
                  <TableCell>
                    <UnassignCourse
                      sessionId={sessionData?.id}
                      course={course}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
