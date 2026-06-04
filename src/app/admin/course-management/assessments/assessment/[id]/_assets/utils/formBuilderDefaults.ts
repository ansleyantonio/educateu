import { v4 as uuid } from "uuid";
import { FormElement, FormElementType } from "../schemas/formBuilderSchemas";

export const getDefaultElement = (type: FormElementType): FormElement => {
  console.log("type", type);
  switch (type) {
    case "MULTIPLE_CHOICE":
      const multipleChoiceOptions = [

        { id: uuid(), text: "Option 1", },
        { id: uuid(), text: "Option 2", },

      ]
      return {
        id: uuid(),
        type,
        point: 0,
        questionText: "Multiple Choice Question",
        options: multipleChoiceOptions,
        answer: multipleChoiceOptions[0].id,
      };

    case "MULTIPLE_SELECT":
      const multipleSelectOptions = [
        { id: uuid(), text: "Option 1", },
        { id: uuid(), text: "Option 2", },
        { id: uuid(), text: "Option 3", },
      ]
      return {
        id: uuid(),
        type,
        point: 0,
        questionText: "Multiple Select Question",
        options: multipleSelectOptions,
        answer: [multipleSelectOptions[0].id, multipleSelectOptions[1].id],
        partialMark: true,
      };

    case "TRUE_FALSE":
      return {
        id: uuid(),
        type,
        point: 0,
        questionText: "True or False Question",
        answer: true,
      };

    case "FILL_BLANK":
      return {
        id: uuid(),
        type,
        point: 0,
        questionText: "Fill in the Blank Question _?",
        answer: "Answer",
      };

    case "MATCHING":
      const options = {
        leftSide: [
          { id: uuid(), text: "Term 1", },
          { id: uuid(), text: "Term 2", },
        ],
        rightSide: [
          { id: uuid(), text: "Definition 2", },
          { id: uuid(), text: "Definition 1", },
        ]
      }
      return {
        id: uuid(),
        type,
        point: 0,
        questionText: "Matching Question",
        options: options,
        answer: [
          { leftSideId: options.leftSide[0].id, rightSideId: options.rightSide[1].id },
          { leftSideId: options.leftSide[1].id, rightSideId: options.rightSide[0].id },
        ],
      };

    case "NUMERICAL_ENTRY":
      return {
        id: uuid(),
        type,
        point: 0,
        questionText: "Numerical Entry Question",
        answer: { correctValue: 42, tolerance: 0.5 },
      };

    case "ORDERING":
      const defaultOptions = [
        {
          id: uuid(),
          text: "Option 1",
        }, {
          id: uuid(),
          text: "Option 2",
        }
      ]
      return {
        id: uuid(),
        type,
        point: 0,
        questionText: "Ordering Question",
        options: defaultOptions,
        answer: [defaultOptions[0].id, defaultOptions[1].id],
      };

    case "SHORT_ANSWER":
      return {
        id: uuid(),
        type,
        point: 0,
        questionText: "Short Answer Question",
        placeholder: "Type your response (1–3 sentences)...",
        submissionType: { type: "SHORT_ANSWER", maxLength: 100 },
      };

    case "ESSAY":
      return {
        id: uuid(),
        type,
        point: 0,
        questionText: "Essay Question",
        placeholder: "Write your essay here...",
        submissionType: { type: "ESSAY", maxLength: 1000 },
      };

    case "FILE_UPLOAD":
      return {
        id: uuid(),
        type,
        point: 0,
        questionText: "File Upload Question",
        submissionType: { type: "FILE_UPLOAD", maxFileSize: 10, acceptedTypes: ["pdf", "docx", "png", "jpg"] },
      };

    default:
      return {
        id: uuid(),
        type: "UNKNOWN",
        point: 0,
        questionText: `⚠ Unknown form element type: ${type}`,
      };
  }
};
