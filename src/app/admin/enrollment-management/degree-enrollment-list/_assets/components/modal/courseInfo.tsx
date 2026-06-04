/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

const DynamicCourseInfo = ({ data }: { data: any }) => {
  return (
    <div className="grid grid-cols-1 gap-4 p-5 mb-6 bg-white rounded-2xl border border-gray-200 shadow-sm sm:grid-cols-3">
      {[
        { label: "Awarding Body", value: data?.awardingBody },
        { label: "Year of Entry", value: data?.yearOfEntry },
        { label: "Course", value: data?.course },
      ].map((item, i) => (
        <div key={i} className="flex flex-col">
          <span className="text-sm text-gray-500">{item.label}</span>
          <span className="text-base font-semibold text-gray-800">
            {item.value || "N/A"}
          </span>
        </div>
      ))}
    </div>
  );
};

export default DynamicCourseInfo;
