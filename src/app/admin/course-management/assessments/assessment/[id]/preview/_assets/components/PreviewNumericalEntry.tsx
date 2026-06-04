/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";

interface PreviewNumericalEntryProps {
    question: any;
    readonly?: boolean;
}

const PreviewNumericalEntry: React.FC<PreviewNumericalEntryProps> = ({ question, readonly = false }) => {
    const [answer, setAnswer] = useState("");

    useEffect(() => {
        if (readonly && question.answer?.correctValue !== undefined) {
            setAnswer(question.answer.correctValue.toString());
        }
    }, [readonly, question.answer]);

    return (
        <div className="flex flex-col gap-[24px]">
            <input
                type="text"
                value={answer}
                onChange={(e) => !readonly && setAnswer(e.target.value)}
                placeholder={readonly ? "" : "Write your answer here"}
                disabled={readonly}
                className={`border-b w-full pb-[4px] text-[14px] bg-transparent outline-none ${readonly ? 'border-[#013E5B]/30 text-[#013E5B] font-semibold' : 'border-[#CBD5E1] text-[#8C8C8C]'}`}
            />
            {readonly && question.answer?.correctValue !== undefined && (
                <div className="text-xs text-[#013E5B] font-medium mt-2">
                    ✓ Correct Answer: {question.answer.correctValue}
                    {question.answer.tolerance && ` (±${question.answer.tolerance})`}
                </div>
            )}
        </div>
    );
};

export default PreviewNumericalEntry;
