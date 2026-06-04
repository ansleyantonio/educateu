"use client";

import useFetchData from "@/app/hook/TanstackQueries/useFetchData";
import { useParams } from "next/navigation";
import { useState } from "react";
import PreviewQuestion from "./PreviewQuestion";


// Mock data - replace with actual data fetching
const mockQuestions = [
    {
        "id": "59184cf0-2cfa-48c9-ac70-95a1df0250df",
        "type": "multiple_choice",
        "points": 1,
        "questionText": "Multiple Choice Question333333",
        "options": [
            {
                "id": "8c9ded7b-e870-465b-9b93-0492ebc09c26",
                "text": "Option 1"
            },
            {
                "id": "c593017e-d0b3-4322-a7ad-e68785ab51f4",
                "text": "Option 2"
            }
        ],
        "answer": "c593017e-d0b3-4322-a7ad-e68785ab51f4"
    },
    {
        "id": "48bc8941-b66b-4cf0-99e5-6d79bf9d757b",
        "type": "multiple_select",
        "points": 2,
        "questionText": "Multiple Select Question",
        "options": [
            {
                "id": "01206c00-f985-4b4d-9a4b-d7cc3dae07e8",
                "text": "Option 1"
            },
            {
                "id": "f31b3dd0-510e-44e3-86ae-0acca8a6c923",
                "text": "Option 2"
            },
            {
                "id": "4c08fc0c-7e7c-4347-8350-2698ed94d57f",
                "text": "Option 3"
            }
        ],
        "answer": [],
        "partialMark": true
    },
    {
        "id": "f55d6ea4-dfa6-4e5e-b37a-a4ce08377c9f",
        "type": "fill_in_blank",
        "points": 2,
        "questionText": "Fill in the Blank Question _?",
        "answer": "Answer"
    },
    {
        "id": "929aa152-893c-45f0-9384-6c05547c34ca",
        "type": "matching",
        "points": 7,
        "questionText": "Match Programming Concepts with Their Definitions",
        "options": {
            "leftSide": [
                {
                    "id": "22568d4e-3fda-44fd-807b-8fee0221f93d",
                    "text": "Variable"
                },
                {
                    "id": "7b2d336b-2cae-413e-9fa9-734835d2a3cc",
                    "text": "Function"
                },
                {
                    "id": "1df00cdb-1344-43c3-8967-7d30225405d3",
                    "text": "Array"
                },
                {
                    "id": "4a8f2c1d-9e7b-4d5a-8c3f-1b6e9a2d4f7c",
                    "text": "Loop"
                },
                {
                    "id": "5b9e3d2c-8f6a-4e5b-9d4e-2c7f8a3e5b6d",
                    "text": "Object"
                },
                {
                    "id": "6c8f4e3d-7g5b-4f6c-8e5d-3d8g9b4f6c7e",
                    "text": "Class"
                },
                {
                    "id": "7d9g5f4e-8h6c-5g7d-9f6e-4e9h8c5g7d8f",
                    "text": "Promise"
                }
            ],
            "rightSide": [
                {
                    "id": "74b8cad4-2c2c-46d4-8ed0-7599704418e6",
                    "text": "A container that stores a value"
                },
                {
                    "id": "8d2044ff-78f5-4782-b92c-609847af937f",
                    "text": "A reusable block of code"
                },
                {
                    "id": "33832c96-e41b-44bb-8628-4748fcebeac5",
                    "text": "An ordered list of values"
                },
                {
                    "id": "9e3f5a6b-7c8d-4e9f-8a7b-5d9e7c8f6a9b",
                    "text": "A control structure for repetition"
                },
                {
                    "id": "8f4g6b7c-8d9e-5f8g-9b8c-6e8f9d7g8b9c",
                    "text": "A collection of key-value pairs"
                },
                {
                    "id": "9g5h7c8d-9e8f-6g9h-8c9d-7f9g8e8h9c8d",
                    "text": "A blueprint for creating objects"
                },
                {
                    "id": "8h6i8d9e-8f9g-7h8i-9d8e-8g8h9f9i8d9e",
                    "text": "An object representing async operations"
                }
            ]
        },
        "answer": [
            {
                "leftSideId": "22568d4e-3fda-44fd-807b-8fee0221f93d",
                "rightSideId": "74b8cad4-2c2c-46d4-8ed0-7599704418e6"
            },
            {
                "leftSideId": "7b2d336b-2cae-413e-9fa9-734835d2a3cc",
                "rightSideId": "8d2044ff-78f5-4782-b92c-609847af937f"
            },
            {
                "leftSideId": "1df00cdb-1344-43c3-8967-7d30225405d3",
                "rightSideId": "33832c96-e41b-44bb-8628-4748fcebeac5"
            },
            {
                "leftSideId": "4a8f2c1d-9e7b-4d5a-8c3f-1b6e9a2d4f7c",
                "rightSideId": "9e3f5a6b-7c8d-4e9f-8a7b-5d9e7c8f6a9b"
            },
            {
                "leftSideId": "5b9e3d2c-8f6a-4e5b-9d4e-2c7f8a3e5b6d",
                "rightSideId": "8f4g6b7c-8d9e-5f8g-9b8c-6e8f9d7g8b9c"
            },
            {
                "leftSideId": "6c8f4e3d-7g5b-4f6c-8e5d-3d8g9b4f6c7e",
                "rightSideId": "9g5h7c8d-9e8f-6g9h-8c9d-7f9g8e8h9c8d"
            },
            {
                "leftSideId": "7d9g5f4e-8h6c-5g7d-9f6e-4e9h8c5g7d8f",
                "rightSideId": "8h6i8d9e-8f9g-7h8i-9d8e-8g8h9f9i8d9e"
            }
        ]
    },
    {
        "id": "902da85a-d3b4-43e9-ba7e-dd39c48971c2",
        "type": "short_answer",
        "points": 3,
        "questionText": "Short Answer Question",
        "placeholder": "Type your response (1–3 sentences)...",
        "maxLength": 300
    },
    {
        "id": "7a74f75e-a7dd-4fc1-a861-ba1f4271119b",
        "type": "essay",
        "points": 5,
        "questionText": "Essay Question",
        "placeholder": "Write your essay here...",
        "rubricCriteria": [
            "Content Quality",
            "Organization",
            "Creativity"
        ],
        "wordLimit": 1000
    },
    {
        "id": "834903d2-ba2a-4e80-8e83-47b51b29b269",
        "type": "numerical_entry",
        "points": 2,
        "questionText": "Numerical Entry Question",
        "answer": {
            "correctValue": 42,
            "tolerance": 0.5
        }
    },
    {
        "id": "dca81e19-3f06-4183-a0c5-4c26d40f544a",
        "type": "ordering",
        "points": 3,
        "questionText": "Ordering Question",
        "options": [
            {
                "id": "37ff0575-4217-475f-8147-e149d6d0fabc",
                "text": "Option 1"
            },
            {
                "id": "654d50a0-4fec-4145-ae8c-dbdd52139205",
                "text": "Option 2"
            }
        ],
        "answer": [
            "37ff0575-4217-475f-8147-e149d6d0fabc",
            "654d50a0-4fec-4145-ae8c-dbdd52139205"
        ]
    },
    {
        "id": "5acf5450-4099-4bd3-b1a6-5f49ce996df3",
        "type": "file_upload",
        "points": 5,
        "questionText": "File Upload Question",
        "maxFiles": 1,
        "maxSizeMB": 10,
        "fileTypes": [
            "pdf",
            "docx",
            "png",
            "jpg"
        ]
    }
];
export default function PreviewQuestionPage({ params }: { params: { id: string } }) {
    const [questions] = useState(mockQuestions);
    const { id } = useParams()


    const { data, isLoading, refetch } = useFetchData({
        path: `/assessments/:assessmentId/quiz-questions`,
        method: "GET",
        queryKey: "fetch-list-of-assessments",

    });


    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-[#E2E8F0] p-8 mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <h1 className="text-2xl font-bold text-[#0F172A]">Fall Camping Trip!</h1>
                        <div className="text-right">
                            <p className="text-sm text-[#64748B]">Total Points: {totalPoints}</p>
                            <p className="text-sm text-[#64748B]">Time: 2 Hour</p>
                        </div>
                    </div>
                    <p className="text-[#64748B] text-sm">
                        Please read each question carefully and select the best answer.
                    </p>
                </div>

                {/* Questions */}
                <div className="space-y-6">
                    {questions.map((question, index) => (
                        <PreviewQuestion
                            key={question.id}
                            question={question}
                            questionNumber={index + 1}
                        />
                    ))}
                </div>

                {/* Footer Actions */}
                <div className="mt-8 flex justify-end gap-4">
                    <button className="px-6 py-2 border border-[#CBD5E1] text-[#64748B] rounded-lg hover:bg-gray-50">
                        Cancel
                    </button>
                    <button className="px-6 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1E40AF]">
                        Published Question Template
                    </button>
                </div>
            </div>
        </div>
    );
}
