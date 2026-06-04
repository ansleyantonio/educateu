/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";

interface PreviewEssayProps {
    question: any;
    readonly?: boolean;
}

const PreviewEssay: React.FC<PreviewEssayProps> = ({ question, readonly = false }) => {
    const [answer, setAnswer] = useState("");

    useEffect(() => {
        if (readonly && question.answer) {
            setAnswer(question.answer);
        }
    }, [readonly, question.answer]);

    return (
        <div className="flex flex-col gap-[24px]">
            <textarea
                value={answer}
                onChange={(e) => !readonly && setAnswer(e.target.value)}
                placeholder={readonly ? "" : (question.placeholder || "Type your ESSAY here...")}
                disabled={readonly}
                rows={5}
                className={`w-full border-b bg-transparent text-[14px] outline-none resize-none pb-[8px] ${readonly ? 'cursor-not-allowed border-[#013E5B]/30 text-[#013E5B] font-semibold ' : 'border-[#CBD5E1] text-[#8C8C8C]'}`}
            />
            <div className="flex flex-row items-center justify-between">

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

export default PreviewEssay;
