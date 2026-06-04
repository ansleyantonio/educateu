/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import PreviewEssay from "./PreviewEssay";
import PreviewFileUpload from "./PreviewFileUpload";
import PreviewFillInBlank from "./PreviewFillInBlank";
import PreviewMatching from "./PreviewMatching";
import PreviewMultipleChoice from "./PreviewMultipleChoice";
import PreviewMultipleSelect from "./PreviewMultipleSelect";
import PreviewNumericalEntry from "./PreviewNumericalEntry";
import PreviewOrdering from "./PreviewOrdering";
import PreviewShortAnswer from "./PreviewShortAnswer";
import PreviewTrueFalse from "./PreviewTrueFalse";

interface PreviewQuestionProps {
    question: any;
    questionNumber: number;
    readonly?: boolean;
}

const PreviewQuestion: React.FC<PreviewQuestionProps> = ({ question, questionNumber, readonly = false }) => {

    const renderQuestion = () => {
        switch (question?.type?.toUpperCase() || question?.submissionType?.type.toUpperCase()) {
            case "MULTIPLE_CHOICE":
                return <PreviewMultipleChoice question={question} readonly={readonly} />;
            case "MULTIPLE_SELECT":
                return <PreviewMultipleSelect question={question} readonly={readonly} />;
            case "TRUE_FALSE":
                return <PreviewTrueFalse question={question} readonly={readonly} />;
            case "FILL_BLANK":
                return <PreviewFillInBlank question={question} readonly={readonly} />;
            case "MATCHING":
                return <PreviewMatching question={question} readonly={readonly} />;
            case "SHORT_ANSWER":
                return <PreviewShortAnswer question={question} readonly={readonly} />;
            case "ESSAY":
                return <PreviewEssay question={question} readonly={readonly} />;
            case "NUMERICAL_ENTRY":
                return <PreviewNumericalEntry question={question} readonly={readonly} />;
            case "ORDERING":
                return <PreviewOrdering question={question} readonly={readonly} />;
            case "FILE_UPLOAD":
                return <PreviewFileUpload question={question} readonly={readonly} />;
            default:
                return <div>Unsupported question type {question?.type?.toUpperCase() || question?.submissionType?.type.toUpperCase()}</div>;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-6">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-base font-medium text-[#0F172A]">
                    {questionNumber}. {question.questionText}
                </h3>
                <span className="bg-[#013E5B] text-white text-xs font-semibold rounded-full py-1 px-3 whitespace-nowrap">
                    {question.point} {question.point === 1 ? "Point" : "Points"}
                </span>
            </div>
            {renderQuestion()}
        </div>
    );
};

export default PreviewQuestion;
