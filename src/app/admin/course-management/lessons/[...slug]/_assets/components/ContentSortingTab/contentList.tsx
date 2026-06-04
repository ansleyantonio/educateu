/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useSortable } from "@dnd-kit/sortable";
import { GripVertical } from "lucide-react";
import { CSS } from "@dnd-kit/utilities";
import DocumentView from "@/components/FileViewModal/documentView";
import { getIconByType } from "@/utils/getIconByType";

interface ContentListProps {
  content: any;
}

const ContentList = ({ content }: ContentListProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: content.id as string,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex gap-2 justify-between items-center py-3 px-1 mb-3 w-full bg-white rounded-md border-2 shadow-sm"
    >
      {/* Draggable Section */}
      <div
        {...listeners}
        className="flex flex-1 gap-2 items-center p-2 border-white transition-all duration-200 ease-in-out cursor-grab"
      >
        <GripVertical
          strokeWidth={2}
          size={20}
          className="text-muted-foreground"
        />
        <div className="flex flex-col">
          <p className="text-sm font-semibold">{content?.title}</p>
          <p className="text-xs text-gray-500 line-clamp-1">
            {content?.description}
          </p>
        </div>
      </div>

      {/* Icons Section */}
      <div className="flex gap-5 justify-end items-center mr-2 min-w-[100px]">
        <DocumentView path={content?.paths[0]} dataType={content?.type}>
          <div className="flex justify-center items-center w-8 h-8 bg-gray-100 rounded">
            {getIconByType(content?.type)}
          </div>
        </DocumentView>
      </div>
    </div>
  );
};

export default ContentList;
