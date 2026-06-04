/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { CourseDetailsModalButton } from "@/app/admin/finance/_assets/components/modal/ViewCourseDetails";
import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { CustomField } from "@/components/common/fields/cusInputField";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import DataFetcher from "@/hooks/fetchDataCollection/hooksExport";
import { useEffect } from "react";
import { useWatch } from "react-hook-form";

interface FormType {
  form: any;
  viewOnly?: boolean;
  moduleType?: string;
}

interface ModuleInfo {
  id: string;
  title: string;
  credit: number;
}

interface SemesterInfo {
  semesterNumber: number;
  modules: ModuleInfo[];
}

const Form_field = ({ form, viewOnly, moduleType }: FormType) => {
  const agreementStatus = form.watch("agreementStatus");
  const selectedSessionId = form.watch("session");
  const courseId = form.watch("course");

  const { options: AcademicSession } = DataFetcher.fetchAcademicSessions({
    filter: { pageSize: 100 },
  });

  useEffect(() => {
    form.setValue("course", "");
  }, [selectedSessionId, form]);

  const { options: courseOptions } = DataFetcher.fetchCoursesBySessionId({
    sessionId: selectedSessionId,
    enabled: !!selectedSessionId,
    filter: {
      pageSize: 100,
      courseType: moduleType === "degree" ? "DEGREE_COURSE" : "DIPLOMA_COURSE",
      hasFees: false,
    },
  });

  const { data: semesterList } = useFetchData({
    path: `courses/${courseId}/semesters`,
    queryKey: `get-semester-modules`,
  });

  const semesters: SemesterInfo[] = semesterList?.data?.semesters ?? [];

  const { data: coursesessionList } = useFetchData({
    path: `session/${selectedSessionId}/courses`,
    queryKey: `get-course-session-ids`,
    enabled: !!selectedSessionId,
  });

  const moduleFeeValues = useWatch({
    control: form.control,
    name: semesters.flatMap((s) => s.modules.map((m) => `module_${m.id}_fee`)),
  });

  useEffect(() => {
    if (semesters.length > 0) {
      const formattedSemesters = semesters.map((semester) => ({
        semesterName: `Semester ${semester.semesterNumber}`,
        semesterFee: semester.modules.reduce(
          (sum, module) =>
            sum + (Number(form.getValues(`module_${module.id}_fee`)) || 0),
          0
        ),
        modules: semester.modules.map((module) => ({
          module: module.title,
          credit: module.credit,
          fee: Number(form.getValues(`module_${module.id}_fee`)) || 0,
        })),
      }));

      form.setValue("semesters", formattedSemesters);
    }
  }, [semesters, moduleFeeValues, form]);

  useEffect(() => {
    semesters.forEach((semester) => {
      const total = semester.modules.reduce((sum, module) => {
        const value = form.getValues(`module_${module.id}_fee`);
        return sum + (Number(value) || 0);
      }, 0);
      form.setValue(`semester_${semester.semesterNumber}`, total);
    });

    const overallTotal = semesters.reduce((sum, semester) => {
      const semesterTotal = form.getValues(
        `semester_${semester.semesterNumber}`
      );
      return sum + (Number(semesterTotal) || 0);
    }, 0);

    form.setValue("overallcoursefee", overallTotal);
  }, [moduleFeeValues, semesters, form]);

  useEffect(() => {
    if (!coursesessionList?.data?.sessionCourses) return;
    const match = coursesessionList.data.sessionCourses.find(
      (item: any) => item.courseId === courseId
    );
    if (match) {
      form.setValue("sessionCourseId", match.id);
    } else {
      form.setValue("sessionCourseId", "");
    }
  }, [courseId, coursesessionList, form]);

  return (
    <>
      <Card>
        <div className="p-4 flex flex-col space-y-2">
          <h2 className="text-lg font-semibold mb-4">
            {moduleType === "degree"
              ? "Create Degree Course Fee"
              : "Create Diploma Course Fee"}
          </h2>
          <div className="grid grid-cols-2 items-start gap-4 min-h-[120px]">
            <CustomField.SelectField
              form={form}
              name="session"
              labelName="Session"
              placeholder="Select Session"
              options={AcademicSession}
              type="single"
            />
            <div className="flex flex-col">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <CustomField.SelectField
                          form={form}
                          name="course"
                          labelName="Course"
                          placeholder="Select Course"
                          options={courseOptions}
                          type="single"
                          disabled={!selectedSessionId}
                        />
                      </div>

                      {courseId && <CourseDetailsModalButton courseId={courseId} />}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-500">
                    <p className="text-[10px]">
                      Select a session first
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="mt-1">
                <p className="text-[12px] text-gray-500">
                  Hint: Select a session first
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {selectedSessionId && courseId && semesters.length > 0 && (
        <Card>
          <div className="p-4 flex flex-col space-y-2">
            <h2 className="text-lg font-semibold mb-8">Semester Fee</h2>
            <CustomField.Number
              form={form}
              name="overallcoursefee"
              labelName="Overall Course Fee"
              optional={false}
              placeholder="$ 2500.00"
              viewOnly={!agreementStatus && viewOnly}
            />
            <CustomField.CheckField
              form={form}
              name="agreementStatus"
              labelName="Enable manual input for total tuition fee"
              placeholder="is Active"
            />

            {semesters.length > 0 && (
              <div className="pt-10 space-y-6">
                {semesters.map((semester: SemesterInfo) => (
                  <div key={semester.semesterNumber} className="space-y-4">
                    <CustomField.Number
                      form={form}
                      name={`semester_${semester.semesterNumber}`}
                      labelName={`Semester ${semester.semesterNumber}`}
                      optional={false}
                      placeholder="$ 2500.00"
                      viewOnly={viewOnly}
                      disabled={true}
                    />

                    <div className="grid grid-cols-3 gap-4 pt-2 rounded-md bg-[#FFFFFF] p-4 border border-gray-100">
                      {semester.modules.map((module: ModuleInfo) => (
                        <div
                          key={module.id}
                          className="col-span-3 grid grid-cols-3 gap-4 items-center"
                        >
                          <CustomField.Text
                            form={form}
                            name={`module_${module.id}_title`}
                            labelName="Module Title"
                            placeholder={module.title}
                            disabled={true}
                          />
                          <CustomField.Number
                            form={form}
                            name={`module_${module.id}_credit`}
                            labelName="Credit"
                            placeholder={module.credit.toString()}
                            viewOnly={true}
                          />
                          <CustomField.Number
                            form={form}
                            name={`module_${module.id}_fee`}
                            labelName="Fee"
                            placeholder="$ 2500.00"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </>
  );
};

export default Form_field;