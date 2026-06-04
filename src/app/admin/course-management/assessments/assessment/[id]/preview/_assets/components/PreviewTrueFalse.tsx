/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";

interface PreviewTrueFalseProps {
    question: any;
    readonly?: boolean;
}

const PreviewTrueFalse: React.FC<PreviewTrueFalseProps> = ({ question, readonly = false }) => {
    const [selectedOption, setSelectedOption] = useState<boolean | null>(null);

    useEffect(() => {
        if (readonly && question.answer !== undefined && question.answer !== null) {
            setSelectedOption(question.answer);
        }
    }, [readonly, question.answer]);

    return (
        <div className="space-y-3">
            {["True", "False"].map((option) => {
                const optionValue = option === "True";
                const isSelected = (selectedOption === true && option === "True") || (selectedOption === false && option === "False");
                const isCorrectAnswer = readonly && question.answer === optionValue;
                return (
                    <label
                        key={option}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all ${readonly ? 'cursor-default' : 'cursor-pointer'} ${isSelected
                            ? 'bg-[#013E5B]/10 border border-[#013E5B]/30'
                            : 'border border-[#E2E8F0]'
                            } ${!readonly && !isSelected ? 'hover:bg-[#F8FAFC]' : ''} ${isCorrectAnswer ? 'ring-2 ring-[#013E5B] ring-offset-2' : ''}`}
                    >
                        <input
                            type="radio"
                            name={question.id}
                            value={option}
                            checked={isSelected}
                            onChange={() => !readonly && setSelectedOption(optionValue)}
                            disabled={readonly}
                            className="w-4 h-4 accent-[#013E5B] border-[#CBD5E1] focus:ring-[#013E5B]"
                        />
                        <span className={`text-sm ${isSelected
                            ? 'text-[#013E5B] font-semibold'
                            : 'text-[#0F172A]'
                            }`}>{option}</span>
                        {readonly && isCorrectAnswer && (
                            <span className="ml-auto text-xs text-[#013E5B] font-medium">✓ Correct Answer</span>
                        )}
                    </label>
                );
            })}
        </div>
    );
};

export default PreviewTrueFalse;
