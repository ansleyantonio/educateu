/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";

interface PreviewMultipleChoiceProps {
    question: any;
    readonly?: boolean;
}

const PreviewMultipleChoice: React.FC<PreviewMultipleChoiceProps> = ({ question, readonly = false }) => {
    const [selectedOption, setSelectedOption] = useState<string>("");

    useEffect(() => {
        if (readonly && question.answer) {
            setSelectedOption(question.answer);
        }
    }, [readonly, question.answer]);

    return (
        <div className="space-y-3">
            {question.options?.map((option: any) => {
                const isSelected = selectedOption === option.id;
                const isCorrectAnswer = readonly && question.answer === option.id;
                return (
                    <label
                        key={option.id}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all ${readonly ? 'cursor-default' : 'cursor-pointer'} ${isSelected
                            ? 'bg-[#013E5B]/10 border border-[#013E5B]/30'
                            : 'border border-[#E2E8F0]'
                            } ${!readonly && !isSelected ? 'hover:bg-[#F8FAFC]' : ''} }`}
                    >
                        <input
                            type="radio"
                            name={question.id}
                            value={option.id}
                            checked={isSelected}
                            onChange={(e) => !readonly && setSelectedOption(e.target.value)}
                            disabled={readonly}
                            className="w-4 h-4 accent-[#013E5B] border-[#CBD5E1] focus:ring-[#013E5B]"
                        />
                        <span className={`text-sm ${isSelected
                            ? 'text-[#013E5B] font-semibold'
                            : 'text-[#0F172A]'
                            }`}>{option.text}</span>
                        {readonly && isCorrectAnswer && (
                            <span className="ml-auto text-xs text-[#013E5B] font-medium">✓ Correct Answer</span>
                        )}
                    </label>
                );
            })}
        </div>
    );
};

export default PreviewMultipleChoice;
