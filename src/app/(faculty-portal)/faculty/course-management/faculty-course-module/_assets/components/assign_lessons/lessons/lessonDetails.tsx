/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import DocumentView from "@/components/FileViewModal/documentView";
import {
  File,
  FileCode,
  FileDigit,
  FileImage,
  FileText,
  Video,
} from "lucide-react";

const getIconByType = (type: string) => {
  switch (type) {
    case "video":
      return <Video className="w-5 h-5 text-blue-500" />;
    case "image":
      return <FileImage className="w-5 h-5 text-pink-500" />;
    case "pdf":
      return <FileDigit className="w-5 h-5 text-red-500" />;
    case "text":
      return <FileText className="w-5 h-5 text-green-500" />;
    case "code":
      return <FileCode className="w-5 h-5 text-indigo-500" />;
    default:
      return <File className="w-5 h-5 text-gray-500" />;
  }
};

const LessonDetails = ({ lesson }: { lesson: any }) => {
  console.log("lesson-------4444", lesson);
  return (
    <div className="flex flex-col p-3">
      {lesson?.content?.map((con: any, i: number) => (
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
                path={con.paths[0]}
                dataType={con.type as "video" | "image" | "pdf"}
              >
                {getIconByType(con.type)}
              </DocumentView>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {con?.title}
              </p>
              <p className="text-xs text-gray-500 line-clamp-1">
                {con?.description}
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
