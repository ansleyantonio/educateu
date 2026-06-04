/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/custom_ui/course-accordion";
import { BookOpen, ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import ConnectCourseForm from "../connectCourse/connectCourseForm";
import { UseFormReturn } from "react-hook-form";

interface ModuleProps {
  data: any;
  openList: string | null;
  setOpenList: (value: string | null) => void;
  form: UseFormReturn<any>;
}
const AddCoursesToSession = ({
  data,
  openList,
  setOpenList,
  form,
}: ModuleProps) => {
  const currentCourses: string[] = form.watch("courseIds") ?? [];

  // Handle accordion click
  const handleAccordionClick = (id: string) => {
    if (openList === id) {
      setOpenList(null);
    } else {
      setOpenList(id);
    }
  };

  const handleToggle = (id: string) => {
    // Check if the course is already selected
    const isAlreadySelected = currentCourses?.some(
      (courseId) => courseId === id,
    );

    // Add or remove the course ID
    const updatedCourses = isAlreadySelected
      ? currentCourses.filter((courseId) => courseId !== id) // remove
      : [...currentCourses, id]; // add

    // Update the form value directly
    form.setValue("courseIds", updatedCourses, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <div>
      {/* Title */}
      <h2 className="mb-5 font-semibold text-gray-800">
        Are you sure you want to duplicate the following courses?
      </h2>

      <div className="my-5">
        <ConnectCourseForm form={form} isEditMode={false} />
      </div>

      <Accordion
        type="single"
        value={openList ?? undefined}
        collapsible
        className="overflow-y-auto space-y-4 w-full max-h-[65%]"
      >
        {data?.map((item: any) => {
          const course = item?.course;
          const isChecked = currentCourses?.includes(course.id);

          return (
            <AccordionItem
              key={course.id}
              value={course.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-neutral-800"
            >
              {/* Header */}
              <div
                className={`flex gap-3 items-center px-2 w-full ${openList === course?.id ? "border-b-2 border-b-gray-200" : ""}`}
              >
                {/* Checkbox */}
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => handleToggle(course.id)}
                  className="flex-shrink-0"
                />

                {/* Accordion Trigger */}
                <div
                  onClick={() => handleAccordionClick(course?.id)}
                  className="flex flex-1 justify-between items-center py-3 transition cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-700"
                >
                  <div className="flex gap-3 items-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <div className="text-left">
                      <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100">
                        {course.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Code: {course.code} • {course.status}
                      </p>
                    </div>
                  </div>

                  <ChevronDown
                    strokeWidth={3}
                    size={15}
                    className={`text-muted-foreground transition-transform ${
                      openList === course?.id ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </div>

              {/* Details */}
              <AccordionContent className="py-3 px-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <p>
                  <span className="font-medium">Course Type:</span>{" "}
                  {course.courseType}
                </p>
                <p>
                  <span className="font-medium">Study Modes:</span>{" "}
                  {course.studyModes.join(", ")}
                </p>
                {course.totalCredits && (
                  <p>
                    <span className="font-medium">Credits:</span>{" "}
                    {course.totalCredits}
                  </p>
                )}
                <p>
                  <span className="font-medium">Duration:</span>{" "}
                  {course.durationLength} months
                </p>
                <p>
                  <span className="font-medium">Start Date:</span>{" "}
                  {new Date(course.startDate).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-medium">End Date:</span>{" "}
                  {new Date(course.endDate).toLocaleDateString()}
                </p>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default AddCoursesToSession;
