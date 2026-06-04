/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";

interface PreviewOrderingProps {
    question: any;
    readonly?: boolean;
}

const PreviewOrdering: React.FC<PreviewOrderingProps> = ({ question, readonly = false }) => {
    const [items, setItems] = useState(question.options || []);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    useEffect(() => {
        if (readonly && question.answer && Array.isArray(question.answer) && question.options) {
            // Reorder items based on answer array
            const orderedItems = question.answer.map((id: string) =>
                question.options.find((opt: any) => opt.id === id)
            ).filter(Boolean);
            if (orderedItems.length > 0) {
                setItems(orderedItems);
            }
        }
    }, [readonly, question.answer, question.options]);

    const handleDragStart = (index: number) => {
        if (readonly) return;
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        if (readonly) return;
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newItems = [...items];
        const draggedItem = newItems[draggedIndex];
        newItems.splice(draggedIndex, 1);
        newItems.splice(index, 0, draggedItem);

        setItems(newItems);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        if (readonly) return;
        setDraggedIndex(null);
    };

    return (
        <div className="flex flex-col gap-[12px]">
            {items.map((item: any, index: number) => (
                <div
                    key={item.id}
                    draggable={!readonly}
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`border flex flex-row items-center gap-[8px] border-[#E2E8F0] rounded-md py-[8px] px-[12px] text-[14px] ${readonly ? 'bg-[#013E5B]/5 border-[#013E5B]/30 text-[#013E5B] font-semibold cursor-default' : 'text-[#8C8C8C]'}`}
                >
                    {!readonly && (
                        <div className="w-[10px] relative">
                            <img src="/assets/icons/grip-dotted-horizontal.svg" alt="" />
                        </div>
                    )}
                    <span className={`flex justify-center h-[28px] w-[28px] text-center rounded-full items-center ${readonly ? 'bg-[#013E5B]/20 text-[#013E5B]' : 'bg-[#F3F4F6]'}`}>{index + 1}</span> {item.text}
                </div>
            ))}
            {readonly && question.answer && (
                <div className="text-xs text-[#013E5B] font-medium mt-2">
                    ✓ Correct Order Displayed
                </div>
            )}
        </div>
    );
};

export default PreviewOrdering;
