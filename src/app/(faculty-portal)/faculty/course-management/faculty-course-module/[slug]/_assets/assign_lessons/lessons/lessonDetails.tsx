/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { IContent } from "@/app/admin/course-management/module/_assets/types/course_types";
import DocumentView from "@/components/FileViewModal/documentView";
// import { IContent } from "../../../../types/course_types";
import { getIconByType } from "@/utils/getIconByType";

const LessonDetails = ({ lesson }: { lesson: any }) => {
  return (
    <div className="flex flex-col p-3">
      {lesson?.contents?.map((content: IContent, i: number) => (
        <div
          key={i}
          className="flex justify-between items-center p-3 mb-3 bg-white rounded-lg border border-gray-200 transition hover:bg-gray-100"
        >
          <div className="flex gap-3 items-center">
            <div className="flex justify-center items-center w-8 h-8 bg-gray-100 rounded">
              {/* {getIconByType(content.type)} */}

              <DocumentView
                // open={false}
                // onClose={() => {}}
                path={content.paths[0]}
                dataType={content.type as "video" | "image" | "pdf"}
              >
                {getIconByType(content.type)}
              </DocumentView>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {content?.title}
              </p>
              <p className="text-xs text-gray-500 line-clamp-1">
                {content?.description}
              </p>
            </div>
          </div>

          <p className="text-xs font-semibold text-muted-foreground"> 00:00</p>
        </div>
      ))}
    </div>
  );
};

export default LessonDetails;
