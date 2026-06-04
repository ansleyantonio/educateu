/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";

interface PreviewShortAnswerProps {
    question: any;
    readonly?: boolean;
}

const PreviewShortAnswer: React.FC<PreviewShortAnswerProps> = ({ question, readonly = false }) => {
    const [answer, setAnswer] = useState("");

    useEffect(() => {
        if (readonly && question.answer) {
            setAnswer(question.answer);
        }
    }, [readonly, question.answer]);

    return (
        <div className="flex flex-col gap-[24px]">
            <input
                type="text"
                value={answer}
                onChange={(e) => !readonly && setAnswer(e.target.value)}
                placeholder={readonly ? "" : (question.placeholder || "Short answer text")}
                disabled={readonly}
                className={`border-b w-full pb-[4px] text-[14px] bg-transparent outline-none ${readonly ? 'border-[#013E5B]/30 text-[#013E5B] font-semibold cursor-not-allowed' : 'border-[#CBD5E1] text-[#8C8C8C]'}`}
            />
            <div className="flex flex-row items-center justify-between">
                <div></div>
                {question.rubricCriteria && question.rubricCriteria.length > 0 && (
                    <p className="text-[12px] text-[#0F172A] font-medium">With Rubric</p>
                )}
            </div>
            {readonly && question.answer && (
                <div className="text-xs text-[#013E5B] font-medium mt-2">
                    ✓ Sample Answer: {question.answer}
                </div>
            )}
        </div>
    );
};

export default PreviewShortAnswer;
