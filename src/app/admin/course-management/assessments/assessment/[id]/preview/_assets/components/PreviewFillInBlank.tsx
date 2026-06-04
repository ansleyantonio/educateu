/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";

interface PreviewFillInBlankProps {
    question: any;
    readonly?: boolean;
}

const PreviewFillInBlank: React.FC<PreviewFillInBlankProps> = ({ question, readonly = false }) => {
    const [answer, setAnswer] = useState("");
    const parts = question.questionText.split("_");

    useEffect(() => {
        if (readonly && question.answer) {
            setAnswer(question.answer);
        }
    }, [readonly, question.answer]);

    return (
        <div className="flex flex-col gap-[24px]">
            <div className="flex items-center gap-2 flex-wrap text-[14px] text-[#64748B]">
                <span>{parts[0]}</span>
                <input
                    type="text"
                    value={answer}
                    onChange={(e) => !readonly && setAnswer(e.target.value)}
                    placeholder="Write here the answer"
                    disabled={readonly}
                    className={`py-[4px] rounded-[6px] px-[12px] border outline-none min-w-[150px] ${readonly ? 'bg-[#F8FAFC] border-[#013E5B]/30 text-[#013E5B] font-semibold cursor-not-allowed' : 'bg-[#F3F3F5] focus:border-[#013E5B]'}`}
                />
                <span>{parts[1]}</span>
            </div>
            {readonly && question.answer && (
                <div className="text-xs text-[#013E5B] font-medium mt-2">
                    ✓ Correct Answer: {question.answer}
                </div>
            )}
        </div>
    );
};

export default PreviewFillInBlank;
