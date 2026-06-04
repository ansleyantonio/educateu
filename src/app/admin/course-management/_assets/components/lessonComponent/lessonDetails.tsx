/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import DocumentView from "@/components/FileViewModal/documentView";
import { getIconByType } from "@/utils/getIconByType";

const LessonDetails = ({ contents }: { contents: any[] }) => {
  return (
    <div className="flex flex-col mt-4">
      {contents?.map(({ content }: any, i: number) => (
        <div
          key={i}
          className="flex justify-between items-center p-3 mb-3 bg-white rounded-lg border border-gray-200 transition hover:bg-gray-100"
        >
          <div className="flex gap-3 items-center">
            <DocumentView path={content?.paths[0]} dataType={content?.type}>
              <div className="flex justify-center items-center w-8 h-8 bg-gray-100 rounded">
                {getIconByType(content?.type)}
              </div>
            </DocumentView>
            <div>
              <p className="text-sm font-semibold">{content?.title}</p>
              <p className="text-xs text-gray-500 line-clamp-1">
                {content?.description}
              </p>
            </div>
          </div>
          {/* <p className="text-xs font-semibold text-muted-foreground">00:00</p> */}
        </div>
      ))}
    </div>
  );
};

export default LessonDetails;
