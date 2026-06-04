/* eslint-disable @typescript-eslint/no-explicit-any */
import { SquareCheck } from "lucide-react";
import React, { useEffect, useState } from "react";

interface PreviewMultipleSelectProps {
    question: any;
    readonly?: boolean;
}

const PreviewMultipleSelect: React.FC<PreviewMultipleSelectProps> = ({ question, readonly = false }) => {
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

    useEffect(() => {
        if (readonly && question.answer && Array.isArray(question.answer)) {
            setSelectedOptions(question.answer);
        }
    }, [readonly, question.answer]);

    const handleToggle = (optionId: string) => {
        if (readonly) return;
        setSelectedOptions((prev) =>
            prev.includes(optionId)
                ? prev.filter((id) => id !== optionId)
                : [...prev, optionId]
        );
    };

    return (
        <div className="flex flex-col gap-[12px]">
            {question.options?.map((option: any) => {
                const isSelected = selectedOptions.includes(option.id);
                const isCorrectAnswer = readonly && question.answer && Array.isArray(question.answer) && question.answer.includes(option.id);
                return (
                    <label
                        key={option.id}
                        htmlFor={`checkbox-${question.id}-${option.id}`}
                        className={`flex flex-row items-center gap-3 p-2 rounded-md transition-all ${readonly ? 'cursor-default' : 'cursor-pointer'} ${isSelected
                            ? 'bg-[#013E5B]/10  '
                            : ''
                            } ${!readonly && !isSelected ? 'hover:bg-[#F8FAFC]' : ''} }`}
                    >
                        <input
                            type="checkbox"
                            id={`checkbox-${question.id}-${option.id}`}
                            checked={isSelected}
                            onChange={() => handleToggle(option.id)}
                            disabled={readonly}
                            className="sr-only"
                        />
                        <div className={`w-[20px] h-[20px] flex items-center justify-center rounded border-2 transition-colors flex-shrink-0 ${isSelected
                            ? 'bg-[#013E5B]  shadow-sm'
                            : 'border-[#013E5B]'
                            }`}>
                            {isSelected && (
                                <SquareCheck size={16} className="text-[#013E5B]" strokeWidth={3} />
                            )}
                        </div>
                        <span className={`text-[14px] ${isSelected
                            ? 'text-[#013E5B] font-semibold'
                            : ''
                            }`}>{option.text}</span>
                        {readonly && isCorrectAnswer && (
                            <span className="ml-auto text-xs text-[#013E5B] font-medium">✓ Correct</span>
                        )}
                    </label>
                );
            })}
        </div>
    );
};

export default PreviewMultipleSelect;
