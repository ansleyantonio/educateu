import { showToast } from "@/components/common/TostMessage/customTostMessage";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useRouter, useSearchParams } from "next/navigation";
import { useUpdateAssessmentMutation } from "../../../_assets/utils/hooks";
import { useFormBuilderStore } from "../lib/useFormBuilderStore";
import DashedBox from "./dashedbox";

export function SubDropZone({ index, fullHeight }: { index: number; fullHeight: boolean; }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `${index}`,
    data: {
      index,
      panel: "middle",
    },
  });

  const disabled = !useFormBuilderStore((state) => state.activeId);

  return (
    <div
      ref={setNodeRef}
      className={`
        ${fullHeight && "h-full"} 
        min-h-[32px]
        mx-[24px]
        my-[4px]
        transition-all
        duration-200
        ${!disabled && isOver ? "bg-blue-200" : "bg-transparent"}
        ${!disabled ? "hover:bg-transparent" : ""}
        border-2
        ${!disabled && isOver ? "border-blue-400" : "border-transparent"}
        rounded
        flex items-center justify-center
      `}
    >
    </div>
  );
}

const MiddlePanel = ({ id }: { id: string }) => {
  const items = useFormBuilderStore((state) => state.items);
  const selectedItem = useFormBuilderStore((state) => state.selectedItem);
  const searchParams = useSearchParams()
  const router = useRouter();
  const assessmentCategory = searchParams.get("assessmentCategory")
  const status = searchParams.get(
    "status"
  ) as "DRAFT" | "PUBLISHED" | null;


  const updateAssessmentMutation = useUpdateAssessmentMutation({
    assessmentId: id,
    onSuccess: () => {
      showToast("success", "Assessment status updated successfully");
      router.push(`/admin/course-management/assessments/assessment`);
    },
    onError: (error) => {
      let errorMessage = "Failed to update assessment";
      const data = error?.response?.data || {};
      if (data?.statusCode === 400 && data?.message) {
        errorMessage = data.message;
      }

      showToast("error", errorMessage);
    },
  });


  return (
    <div className={`min-h-[calc(100vh-5.5rem)] flex flex-col flex-1 p-[24px] ${items.length && "pt-1"} bg-white relative top-[28px] shadow-[0_5px_10px_0_rgba(105,105,105,0.1)]  border border-[#CBD5E1] rounded-[10px]`}>
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <div className="h-full flex-1 flex flex-col">
          {items.map((item, index) => (
            <div key={item.id}>
              <SubDropZone fullHeight={false} index={index} />
              <DashedBox item={item} selected={selectedItem?.id === item.id} />
            </div>
          ))}
          <SubDropZone index={items.length} fullHeight={true} />
        </div>
      </SortableContext>

      {/* action */}
      {items.length > 0 && (
        <div className="w-full flex flex-row items-center justify-center gap-[24px] px-[24px]">
          <button
            onClick={() => {
              updateAssessmentMutation.mutate({
                status: status === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
              });
            }}
            disabled={updateAssessmentMutation.isPending}
            className="min-h-[40px] bg-[#2563EB] py-[8px] px-[12px] flex-1 text-white text-[14px] font-semibold rounded-[8px]">


            {status === "PUBLISHED" ? "Unpublish" : "Publish"} </button>
          <button
            onClick={() => router.push(`/admin/course-management/assessments/assessment/${id}/preview?assessmentCategory=${assessmentCategory}`)}
            className="min-h-[40px] bg-[#34657C] py-[8px] px-[12px] flex-1 text-white text-[14px] font-semibold rounded-[8px]">Preview</button>
        </div>
      )
      }
    </div >
  )
}

export default MiddlePanel;
