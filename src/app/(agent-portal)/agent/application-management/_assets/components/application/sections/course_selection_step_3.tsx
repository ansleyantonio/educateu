/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { CustomField } from "@/components/common/fields/cusInputField";
import { Input } from "@/components/ui/input";
import DataFetcher from "@/hooks/fetchDataCollection/hooksExport";
import { useEffect, useState } from "react";

const Course_selection_step_3 = ({ form, viewOnly = false }: any) => {
  const [searchTerms, setSearchTerms] = useState({
    awardingBody: "",
    session: "",
    course: "",
  });
  const selectedSessionId = form.watch("courseSelection.sessionId");
  const awardingBodyId = form.watch("courseSelection.awardingBodyId");
  const courseId = form.watch("courseSelection.course");

  /**
   * -----------------------------
   * Sessions
   * -----------------------------
   */
  const { options: sessionOptions, isLoading: sessionLoading } =
    DataFetcher.fetchAcademicSessions({
      path: "application-management/session",
      filter: {
        search: searchTerms.session,
        status: ["UPCOMING", "ACTIVE", "TEMPORARILY_ACTIVE"],
        pageSize: 50,
      },
    });
  // ensure selected session is always included
  // Always call hook to fetch selected session separately (by ID)
  const { options: selectedSessionOption } = DataFetcher.fetchAcademicSessions({
    path: "application-management/session",
    filter: selectedSessionId
      ? {
          search: selectedSessionId, // fetch that exact session
          status: ["UPCOMING", "ACTIVE", "TEMPORARILY_ACTIVE"],
          pageSize: 50,
        }
      : { pageSize: 50 },
  });
  const finalSessionOptions = [
    ...(sessionOptions || []),
    ...(selectedSessionOption || []),
  ].filter(
    (item, index, self) =>
      index === self.findIndex((s) => s.value === item.value)
  );

  /**
   * -----------------------------
   * Awarding Body
   * -----------------------------
   */
  const { options: awardingBodyOptions, isLoading: awardingBodyLoading } =
    DataFetcher.fetchMatchAwardingBodiesBySessionId({
      sessionId: selectedSessionId,
      path: `application-management/session/${selectedSessionId}/matching-awarding-bodies`,
      filter: {
        search: searchTerms.awardingBody || undefined,
        // search: searchTerms.awardingBody
        //   ? searchTerms.awardingBody
        //   : awardingBodyId,
        pageSize: 50,
      },
    });

  const { options: selectedAwardingBodyOption } =
    DataFetcher.fetchMatchAwardingBodiesBySessionId({
      sessionId: selectedSessionId,
      path: `application-management/session/${selectedSessionId}/matching-awarding-bodies`,

      filter: awardingBodyId
        ? {
            search: awardingBodyId,
            pageSize: 1,
          }
        : { pageSize: 50 },
    });

  const finalAwardingBodyOptions = [
    ...(awardingBodyOptions || []),
    ...(selectedAwardingBodyOption || []),
  ].filter(
    (item, index, self) =>
      index === self.findIndex((s) => s.value === item.value)
  );

  /**
   * -----------------------------
   * Courses
   * -----------------------------
   */
  const { options: courseOptions, isLoading: courseLoading } =
    DataFetcher.fetchCursesBySessionIdWithAwardingBodies({
      sessionId: selectedSessionId,
      path: `application-management/session/${selectedSessionId}/courses`,
      filter: {
        awardingBodyId: awardingBodyId,
        searchTerms: searchTerms.course || undefined,
        // searchTerm: searchTerms.course ? searchTerms.course : courseId,
        pageSize: 10,
      },
    });

  const { options: selectedCourseOption } =
    DataFetcher.fetchCursesBySessionIdWithAwardingBodies({
      sessionId: selectedSessionId,
      path: `application-management/session/${selectedSessionId}/courses`,

      filter: courseId
        ? {
            awardingBodyId,
            searchTerm: courseId,
            pageSize: 1,
          }
        : { pageSize: 50 },
    });

  const finalCourseOptions = [
    ...(courseOptions || []),
    ...(selectedCourseOption || []),
  ].filter(
    (item, index, self) =>
      index === self.findIndex((s) => s.value === item.value)
  );

  useEffect(() => {
    const selectedSession = sessionOptions?.find(
      (item: any) => item.value === selectedSessionId
    );
    if (selectedSession?.startDate) {
      // const year = selectedSession.startDate;
      const year = new Date(selectedSession.startDate).getFullYear().toString();

      form.setValue("courseSelection.yearOfCourse", year);
    } else {
      form.setValue("courseSelection.yearOfCourse", "");
    }
  }, [selectedSessionId, sessionOptions, form]);

  return (
    <div className="w-full grid grid-cols-1 items-top gap-x-4 gap-y-5 lg:grid-cols-2">
      <CustomField.SelectField
        name="courseSelection.sessionId"
        labelName="Session"
        placeholder="Select Session"
        options={finalSessionOptions}
        form={form}
        onSearch={(value) =>
          setSearchTerms((prev) => ({ ...prev, session: value }))
        }
        isLoading={sessionLoading}
        optional={false}
        viewOnly={viewOnly}
      />
      <CustomField.SelectField
        name="courseSelection.awardingBodyId"
        labelName="Awarding Body"
        placeholder="Select Awarding Body"
        options={finalAwardingBodyOptions}
        onSearch={(value) =>
          setSearchTerms((prev) => ({ ...prev, awardingBody: value }))
        }
        disabled={selectedSessionId ? false : true}
        isLoading={awardingBodyLoading}
        optional={false}
        form={form}
        viewOnly={viewOnly}
      />

      <CustomField.SelectField
        name="courseSelection.course"
        labelName="Course"
        placeholder="Select Course"
        options={finalCourseOptions}
        onSearch={(value) =>
          setSearchTerms((prev) => ({ ...prev, course: value }))
        }
        optional={false}
        form={form}
        disabled={selectedSessionId && awardingBodyId ? false : true}
        isLoading={courseLoading}
        viewOnly={viewOnly}
      />

      {/* Awarding Body Code */}
      {/* <CustomField.Text
        form={form}
        name="courseSelection.yearOfCourse"
        labelName="Year of Course"
        placeholder=" Year of Course"
        viewOnly={true}
      /> */}

      <div className="flex flex-col space-y-3">
        <label className="text-sm font-semibold text-[#272E35]">
          Year of Course
        </label>
        <Input
          form={form}
          name="courseSelection.yearOfCourse"
          className="py-2 px-3 text-sm text-gray-900 bg-white rounded-md border border-gray-200 outline-none focus:outline-none min-h-[40px]"
          readOnly={true}
          value={
            sessionOptions?.find((item: any) => item.value == selectedSessionId)
              ?.startDate
              ? new Date(
                  sessionOptions.find(
                    (item: any) => item.value == selectedSessionId
                  ).startDate
                )
                  .getFullYear()
                  .toString()
              : ""
          }
          // value={
          //   sessionOptions
          //     ?.find((item: any) => item.value == selectedSessionId)
          //     ?.startDate?.split("T")[0] ?? ""
          // }
          placeholder="Year of Course"
        />
      </div>
    </div>
  );
};

export default Course_selection_step_3;
