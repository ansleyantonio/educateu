# Assessment Module API Documentation - Quiz Questions

## Base URL

All API endpoints are relative to: `http://18.171.208.170:4040`

This module provides APIs for managing quiz questions in the system. Each API serves a specific function within the assessment management workflow.

---

# Create Quiz Question API

## Endpoint

`POST /assessments/:assessmentId/quiz-questions`

## Description

Creates a new quiz question and adds it to the specified assessment. This endpoint only works with assessments that have the category "QUIZ". The question will be inserted at the specified position in the quiz sequence. Supports all auto-graded question types: MULTIPLE_CHOICE, MULTIPLE_SELECT, FILL_BLANK, TRUE_FALSE, MATCHING, NUMERICAL_ENTRY, and ORDERING.

## Request

### Headers

- `Content-Type: application/json`

### Path Parameters

| Parameter    | Type          | Required | Description                                                         |
| ------------ | ------------- | -------- | ------------------------------------------------------------------- |
| assessmentId | string (UUID) | Yes      | The unique identifier of the assessment to add the quiz question to |

### Request Body

| Field | Type   | Required | Description                                                                                                                                                      |
| ----- | ------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| type  | string | Yes      | The type of quiz question to create. Must be one of: "MULTIPLE_CHOICE", "MULTIPLE_SELECT", "FILL_BLANK", "TRUE_FALSE", "MATCHING", "NUMERICAL_ENTRY", "ORDERING" |
| index | number | Yes      | The position index where the question should be inserted in the quiz sequence (0-based)                                                                          |

### Example Request (MULTIPLE_CHOICE)

```bash
curl -X POST "http://18.171.208.170:4040/assessments/0fd665e1-43a2-4a9a-b26a-410a64b96928/quiz-questions" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "MULTIPLE_CHOICE",
    "index": 0
  }'
```

## Response

### Success Response

- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body

| Field                  | Type   | Description                                    |
| ---------------------- | ------ | ---------------------------------------------- |
| status                 | string | "success"                                      |
| statusCode             | number | 200                                            |
| message                | string | "Request was successful"                       |
| data.quizQuestion.id   | string | Unique identifier of the created quiz question |
| data.quizQuestion.type | string | Type of the created quiz question              |

### Example Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "quizQuestion": {
      "id": "8c20aaa5-6c4c-46c1-a681-7f8d25634e90",
      "type": "MULTIPLE_CHOICE"
    }
  }
}
```

### Error Responses

| Status Code | Error Message                                                           | Description                                                                            |
| ----------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 400         | "Quiz questions can only be created for assessments with category QUIZ" | When attempting to add a quiz question to an assessment that is not of category "QUIZ" |
| 400         | "Index cannot be greater than X"                                        | When the specified index is greater than the number of existing quiz questions + 1     |
| 404         | "Assessment not found"                                                  | When no assessment exists with the provided ID                                         |

## Usage

This endpoint is used to add new quiz questions to an existing assessment. It's particularly useful when you need to:

1. Build a quiz by adding questions one by one
2. Insert questions at specific positions in the quiz sequence
3. Support various auto-graded question types in your assessment system

Note: The index parameter allows you to control the order of questions in the quiz. When inserting a question at a specific index, existing questions at that index and beyond will be shifted to subsequent positions.

---

# Update Quiz Question API

## Endpoint

`PUT /assessments/quiz-questions/:quizQuestionId`

## Description

Updates an existing quiz question with the provided details. This endpoint validates the answer and options based on the question type to ensure data integrity. Supports all auto-graded question types: MULTIPLE_CHOICE, MULTIPLE_SELECT, FILL_BLANK, TRUE_FALSE, MATCHING, NUMERICAL_ENTRY, and ORDERING.

## Request

### Headers

- `Content-Type: application/json`

### Path Parameters

| Parameter      | Type          | Required | Description                                          |
| -------------- | ------------- | -------- | ---------------------------------------------------- |
| quizQuestionId | string (UUID) | Yes      | The unique identifier of the quiz question to update |

### Request Body

| Field        | Type    | Required | Description                                                                                                                                                                 |
| ------------ | ------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| questionText | string  | No       | The text content of the question                                                                                                                                            |
| point        | number  | No       | The point value of the question (non-negative integer)                                                                                                                      |
| options      | any     | No       | The options for the question, format depends on question type                                                                                                               |
| answer       | any     | No       | The correct answer for the question, format depends on question type                                                                                                        |
| partialMark  | boolean | No       | For MULTI_SELECT questions only: determines if partial credit should be awarded for partially correct answers. This field is required when updating MULTI_SELECT questions. |

### Type-Specific Validation Rules

#### MULTIPLE_CHOICE

- **options** (optional): Array of choice objects, each with id and text properties (no indication of correct answer in options)
- **answer** (optional): String (option ID) or number (option index) indicating the correct choice

#### MULTIPLE_SELECT

- **options** (optional): Array of choice objects, each with id and text properties (no indication of correct answer in options)
- **answer** (optional): Array of strings (option IDs) or numbers (option indices) indicating the correct choices
- **partialMark** (required when updating): Boolean indicating whether partial credit should be awarded for partially correct answers (required when updating MULTI_SELECT questions)

#### TRUE_FALSE

- **answer** (optional): Boolean value (true or false) indicating the correct response

#### FILL_BLANK

- **answer** (optional): String (single answer) or array of strings (multiple acceptable answers)

#### MATCHING

- **options** (optional): Array of item objects to match (no indication of correct matches in options)
- **answer** (optional): Array of objects with leftSideId and rightSideId properties showing correct matches

#### NUMERICAL_ENTRY

- **answer** (optional): Object with correctValue (number) and optional tolerance (number) properties

#### ORDERING

- **options** (optional): Array of item objects to be ordered (no indication of correct order in options)
- **answer** (optional): Array of strings (item IDs) or numbers (item indices) showing the correct order

### Example Request (MULTIPLE_CHOICE)

```bash
curl -X PUT "http://18.171.208.170:4040/assessments/quiz-questions/8c20aaa5-6c4c-46c1-a681-7f8d25634e90" \
  -H "Content-Type: application/json" \
  -d '{
    "questionText": "What is the capital of France?",
    "options": [
      {"id": "a", "text": "London"},
      {"id": "b", "text": "Paris"},
      {"id": "c", "text": "Berlin"},
      {"id": "d", "text": "Madrid"}
    ],
    "answer": "b"
  }'
```

### Example Request (MULTIPLE_SELECT)

```bash
curl -X PUT "http://18.171.208.170:4040/assessments/quiz-questions/f580d3c5-ffe9-4157-ad3c-b686f5782ca9" \
  -H "Content-Type: application/json" \
  -d '{
    "questionText": "Select all even numbers:",
    "options": [
      {"id": "a", "text": "2"},
      {"id": "b", "text": "3"},
      {"id": "c", "text": "4"},
      {"id": "d", "text": "5"}
    ],
    "answer": ["a", "c"]
  }'
```

### Example Request (TRUE_FALSE)

```bash
curl -X PUT "http://18.171.208.170:4040/assessments/quiz-questions/9f351205-a696-4f23-a642-69a738eea14e" \
  -H "Content-Type: application/json" \
  -d '{
    "questionText": "The sky is blue.",
    "answer": true
  }'
```

### Example Request (FILL_BLANK)

```bash
curl -X PUT "http://18.171.208.170:4040/assessments/quiz-questions/bcdf009f-ca2a-4ada-98ff-d62fcaeb6afc" \
  -H "Content-Type: application/json" \
  -d '{
    "questionText": "The color of grass is _____.",
    "answer": "green"
  }'
```

### Example Request (NUMERICAL_ENTRY)

```bash
curl -X PUT "http://18.171.208.170:4040/assessments/quiz-questions/ef1b58df-7247-4037-bc7d-c4f1c3df19f8" \
  -H "Content-Type: application/json" \
  -d '{
    "questionText": "What is the value of PI to one decimal?",
    "answer": {"correctValue": 3.1, "tolerance": 0.05}
  }'
```

### Example Request (MATCHING)

```bash
curl -X PUT "http://18.171.208.170:4040/assessments/quiz-questions/14c7958b-c25b-4e6b-9dc4-f78c802fa04c" \
  -H "Content-Type: application/json" \
  -d '{
    "questionText": "Match the countries with their capitals:",
    "options": {
      "leftSide": [
        {"id": "fr", "text": "France"},
        {"id": "de", "text": "Germany"},
        {"id": "it", "text": "Italy"}
      ],
      "rightSide": [
        {"id": "paris", "text": "Paris"},
        {"id": "berlin", "text": "Berlin"},
        {"id": "rome", "text": "Rome"}
      ]
    },
    "answer": [
      {"leftSideId": "fr", "rightSideId": "paris"},
      {"leftSideId": "de", "rightSideId": "berlin"},
      {"leftSideId": "it", "rightSideId": "rome"}
    ]
  }'
```

### Example Request (ORDERING)

```bash
curl -X PUT "http://18.171.208.170:4040/assessments/quiz-questions/f1a04949-0070-43a8-a52a-a2a654a5f2c2" \
  -H "Content-Type: application/json" \
  -d '{
    "questionText": "Arrange the numbers in ascending order:",
    "options": [
      {"id": "num1", "text": "3"},
      {"id": "num2", "text": "1"},
      {"id": "num3", "text": "2"}
    ],
    "answer": ["num2", "num3", "num1"]
  }'
```

## Response

### Success Response

- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body

| Field                          | Type    | Description                                                                                                  |
| ------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------ |
| status                         | string  | "success"                                                                                                    |
| statusCode                     | number  | 200                                                                                                          |
| message                        | string  | "Request was successful"                                                                                     |
| data.quizQuestion.id           | string  | Unique identifier of the updated quiz question                                                               |
| data.quizQuestion.type         | string  | Type of the quiz question                                                                                    |
| data.quizQuestion.questionText | string  | Updated question text (if provided)                                                                          |
| data.quizQuestion.point        | number  | Updated point value (if provided)                                                                            |
| data.quizQuestion.options      | any     | Updated options (if provided)                                                                                |
| data.quizQuestion.answer       | any     | Updated answer (if provided)                                                                                 |
| data.quizQuestion.partialMark  | boolean | For MULTI_SELECT questions only: indicates if partial credit should be awarded for partially correct answers |

### Example Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "quizQuestion": {
      "id": "8c20aaa5-6c4c-46c1-a681-7f8d25634e90",
      "type": "MULTIPLE_CHOICE",
      "questionText": "What is the capital of France?",
      "point": 5,
      "options": [
        { "id": "a", "text": "London" },
        { "id": "b", "text": "Paris" },
        { "id": "c", "text": "Berlin" },
        { "id": "d", "text": "Madrid" }
      ],
      "answer": "b"
    }
  }
}
```

### Example Success Response (MULTIPLE_SELECT)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "quizQuestion": {
      "id": "f580d3c5-ffe9-4157-ad3c-b686f5782ca9",
      "type": "MULTIPLE_SELECT",
      "questionText": "Select all even numbers:",
      "point": 5,
      "options": [
        { "id": "a", "text": "2" },
        { "id": "b", "text": "3" },
        { "id": "c", "text": "4" },
        { "id": "d", "text": "5" }
      ],
      "answer": ["a", "c"],
      "partialMark": true
    }
  }
}
```

### Error Responses

| Status Code | Error Message                                                                       | Description                                                                   |
| ----------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 400         | "For MULTIPLE_CHOICE, answer must be a string (option ID) or number (option index)" | When providing an invalid answer format for a MULTIPLE_CHOICE question        |
| 400         | "For TRUE_FALSE, answer must be a boolean value"                                    | When providing a non-boolean answer for a TRUE_FALSE question                 |
| 400         | "For NUMERICAL_ENTRY, answer must be an object with correctValue"                   | When providing an invalid answer format for a NUMERICAL_ENTRY question        |
| 400         | "For ORDERING, answer must be an array defining the correct order"                  | When providing an invalid answer format for an ORDERING question              |
| 400         | "For FILL_BLANK, answer must be a string or array of acceptable answers"            | When providing an invalid answer format for a FILL_BLANK question             |
| 400         | "For MULTIPLE_SELECT, answer must be an array of selected option IDs or indices"    | When providing an invalid answer format for a MULTIPLE_SELECT question        |
| 400         | "partialMark field is required for MULTI_SELECT questions"                          | When updating a MULTI_SELECT question without providing the partialMark field |
| 400         | "For MATCHING, answer must be an array of matching pairs"                           | When providing an invalid answer format for a MATCHING question               |
| 400         | "For MATCHING, options must be an object with leftSide and rightSide arrays"        | When providing an invalid options format for a MATCHING question              |
| 400         | "For MATCHING, both leftSide and rightSide must be arrays"                          | When leftSide or rightSide is not an array in a MATCHING question             |
| 400         | "For MATCHING, each leftSide item must have string id and text properties"          | When a leftSide item has invalid structure in a MATCHING question             |
| 400         | "For MATCHING, each rightSide item must have string id and text properties"         | When a rightSide item has invalid structure in a MATCHING question            |
| 404         | "Quiz question not found"                                                           | When no quiz question exists with the provided ID                             |

## Usage

This endpoint is used to update quiz question content while ensuring data integrity through type-specific validation. It's particularly useful when you need to:

1. Update question text or parameters without changing the question type
2. Modify answer formats to match the question type requirements
3. Ensure that answer and options formats are appropriate for each question type
4. Maintain consistency across different auto-graded question types

Note: The validation system ensures that only appropriate data formats are accepted for each question type, preventing data integrity issues.

---

# Get Quiz Questions for Assessment API

## Endpoint

`GET /assessments/:assessmentId/quiz-questions`

## Description

Retrieves all quiz questions associated with a specific assessment. The questions are returned in the order specified by the assessment's quizQuestionsOrder property, with pagination support. Each quiz question includes its type, content, options, and answer data based on the question type.

## Request

### Headers

- `Content-Type: application/json`

### Path Parameters

| Parameter    | Type          | Required | Description                                                                      |
| ------------ | ------------- | -------- | -------------------------------------------------------------------------------- |
| assessmentId | string (UUID) | Yes      | The unique identifier of the assessment whose quiz questions are being retrieved |

### Query Parameters

| Parameter | Type   | Required | Default | Description                                             |
| --------- | ------ | -------- | ------- | ------------------------------------------------------- |
| page      | number | No       | 1       | Page number for pagination (must be a positive integer) |
| pageSize  | number | No       | 10      | Number of items per page (minimum 1, maximum 100)       |

## Response

### Success Response

- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body

| Field                             | Type    | Description                                                                                                               |
| --------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------- |
| status                            | string  | "success"                                                                                                                 |
| statusCode                        | number  | 200                                                                                                                       |
| message                           | string  | "Request was successful"                                                                                                  |
| data.quizQuestions                | array   | Array of quiz question objects                                                                                            |
| data.quizQuestions[].id           | string  | Unique identifier of the quiz question                                                                                    |
| data.quizQuestions[].type         | string  | Type of the quiz question (MULTIPLE_CHOICE, MULTIPLE_SELECT, FILL_BLANK, TRUE_FALSE, MATCHING, NUMERICAL_ENTRY, ORDERING) |
| data.quizQuestions[].questionText | string  | The text content of the question                                                                                          |
| data.quizQuestions[].point        | number  | The point value of the question                                                                                           |
| data.quizQuestions[].options      | any     | The options for the question (format depends on question type)                                                            |
| data.quizQuestions[].answer       | any     | The correct answer for the question (format depends on question type)                                                     |
| data.quizQuestions[].partialMark  | boolean | For MULTI_SELECT questions only: indicates if partial credit should be awarded for partially correct answers              |
| pagination                        | object  | Pagination information                                                                                                    |
| pagination.count                  | number  | Number of items in the current response                                                                                   |
| pagination.total                  | number  | Total number of items matching the query                                                                                  |
| pagination.page                   | number  | Current page number                                                                                                       |
| pagination.perPage                | number  | Number of items per page                                                                                                  |
| pagination.totalPages             | number  | Total number of pages                                                                                                     |

### Example Request

```bash
curl -X GET "http://18.171.208.170:4040/assessments/0fd665e1-43a2-4a9a-b26a-410a64b96928/quiz-questions?page=1&pageSize=5"
```

### Example Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "quizQuestions": [
      {
        "id": "8c20aaa5-6c4c-46c1-a681-7f8d25634e90",
        "type": "MULTIPLE_CHOICE",
        "questionText": "What is the capital of France?",
        "point": 5,
        "options": [
          { "id": "a", "text": "London" },
          { "id": "b", "text": "Paris" },
          { "id": "c", "text": "Berlin" },
          { "id": "d", "text": "Madrid" }
        ],
        "answer": "b"
      },
      {
        "id": "f580d3c5-ffe9-4157-ad3c-b686f5782ca9",
        "type": "MULTIPLE_SELECT",
        "questionText": "Select all programming languages:",
        "point": 5,
        "options": [
          { "id": "a", "text": "JavaScript" },
          { "id": "b", "text": "HTML" },
          { "id": "c", "text": "Python" },
          { "id": "d", "text": "CSS" }
        ],
        "answer": ["a", "c"],
        "partialMark": true
      },
      {
        "id": "9f351205-a696-4f23-a642-69a738eea14e",
        "type": "TRUE_FALSE",
        "questionText": "The sky is blue.",
        "answer": true
      }
    ]
  },
  "pagination": {
    "count": 3,
    "total": 13,
    "page": 1,
    "perPage": 5,
    "totalPages": 3
  }
}
```

### Error Responses

| Status Code | Error Message          | Description                                    |
| ----------- | ---------------------- | ---------------------------------------------- |
| 404         | "Assessment not found" | When no assessment exists with the provided ID |

## Usage

This endpoint is used to retrieve all quiz questions for a specific assessment in their proper order. It's particularly useful when you need to:

1. Display quiz questions to students for a particular assessment
2. Show an instructor the current questions in their assessment
3. Paginate through large numbers of quiz questions
4. Present questions in the correct sequence as defined by the assessment's order settings

Note: The endpoint maintains the correct ordering of questions as specified in the assessment's quizQuestionsOrder property, ensuring questions appear in the intended sequence.

---

# Get Quiz Question by ID API

## Endpoint

`GET /assessments/quiz-questions/:quizQuestionId`

## Description

Retrieves a specific quiz question by its unique identifier. Returns the complete question data including type, content, options, and answer based on the question type.

## Request

### Headers

- `Content-Type: application/json`

### Path Parameters

| Parameter      | Type          | Required | Description                                            |
| -------------- | ------------- | -------- | ------------------------------------------------------ |
| quizQuestionId | string (UUID) | Yes      | The unique identifier of the quiz question to retrieve |

## Response

### Success Response

- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body

| Field                           | Type    | Description                                                                                                               |
| ------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------- |
| status                          | string  | "success"                                                                                                                 |
| statusCode                      | number  | 200                                                                                                                       |
| message                         | string  | "Request was successful"                                                                                                  |
| data.quizQuestion.id            | string  | Unique identifier of the quiz question                                                                                    |
| data.quizQuestion.type          | string  | Type of the quiz question (MULTIPLE_CHOICE, MULTIPLE_SELECT, FILL_BLANK, TRUE_FALSE, MATCHING, NUMERICAL_ENTRY, ORDERING) |
| data.quizQuestion.questionText  | string  | The text content of the question                                                                                          |
| data.quizQuestion.point         | number  | The point value of the question                                                                                           |
| data.quizQuestion.options       | any     | The options for the question (format depends on question type)                                                            |
| data.quizQuestion.answer        | any     | The correct answer for the question (format depends on question type)                                                     |
| data.quizQuestion.partialMark   | boolean | For MULTI_SELECT questions only: indicates if partial credit should be awarded for partially correct answers              |
| data.quizQuestion.assessment.id | string  | The ID of the associated assessment                                                                                       |

### Example Request

```bash
curl -X GET "http://18.171.208.170:4040/assessments/quiz-questions/8c20aaa5-6c4c-46c1-a681-7f8d25634e90"
```

### Example Success Response (MULTIPLE_CHOICE)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "quizQuestion": {
      "id": "8c20aaa5-6c4c-46c1-a681-7f8d25634e90",
      "type": "MULTIPLE_CHOICE",
      "questionText": "What is the capital of France?",
      "point": 5,
      "options": [
        { "id": "a", "text": "London" },
        { "id": "b", "text": "Paris" },
        { "id": "c", "text": "Berlin" },
        { "id": "d", "text": "Madrid" }
      ],
      "answer": "b",
      "assessment": {
        "id": "0fd665e1-43a2-4a9a-b26a-410a64b96928"
      }
    }
  }
}
```

### Example Success Response (MULTIPLE_SELECT)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "quizQuestion": {
      "id": "f580d3c5-ffe9-4157-ad3c-b686f5782ca9",
      "type": "MULTIPLE_SELECT",
      "questionText": "Select all programming languages:",
      "point": 5,
      "options": [
        { "id": "a", "text": "JavaScript" },
        { "id": "b", "text": "HTML" },
        { "id": "c", "text": "Python" },
        { "id": "d", "text": "CSS" }
      ],
      "answer": ["a", "c"],
      "partialMark": true,
      "assessment": {
        "id": "0fd665e1-43a2-4a9a-b26a-410a64b96928"
      }
    }
  }
}
```

### Error Responses

| Status Code | Error Message                     | Description                                                          |
| ----------- | --------------------------------- | -------------------------------------------------------------------- |
| 404         | "Quiz question not found"         | When no quiz question exists with the provided ID                    |
| 404         | "Associated assessment not found" | When the quiz question exists but its associated assessment does not |

## Usage

This endpoint is used to retrieve a specific quiz question when you know its unique ID. It's particularly useful when you need to:

1. Load a specific question for editing or review
2. Display a single question to a student or instructor
3. Fetch question details for a specific question ID
4. Check the content of a particular quiz question without fetching all questions

Note: The endpoint returns the complete question data including its associated assessment information.

---

# Delete Quiz Question API

## Endpoint

`DELETE /assessments/quiz-questions/:quizQuestionId`

## Description

Deletes a specific quiz question by its unique identifier. When a quiz question is deleted, the assessment's quizQuestionsOrder is automatically updated to remove the question and reindex the remaining questions to maintain sequential ordering.

## Request

### Headers

- `Content-Type: application/json`

### Path Parameters

| Parameter      | Type          | Required | Description                                          |
| -------------- | ------------- | -------- | ---------------------------------------------------- |
| quizQuestionId | string (UUID) | Yes      | The unique identifier of the quiz question to delete |

## Response

### Success Response

- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body

| Field        | Type   | Description                          |
| ------------ | ------ | ------------------------------------ |
| status       | string | "success"                            |
| statusCode   | number | 200                                  |
| message      | string | "Request was successful"             |
| data.message | string | "Quiz question deleted successfully" |

### Example Request

```bash
curl -X DELETE "http://18.171.208.170:4040/assessments/quiz-questions/8c20aaa5-6c4c-46c1-a681-7f8d25634e90"
```

### Example Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "message": "Quiz question deleted successfully"
  }
}
```

### Error Responses

| Status Code | Error Message                     | Description                                                          |
| ----------- | --------------------------------- | -------------------------------------------------------------------- |
| 404         | "Quiz question not found"         | When no quiz question exists with the provided ID                    |
| 404         | "Associated assessment not found" | When the quiz question exists but its associated assessment does not |

## Usage

This endpoint is used to permanently remove a quiz question from an assessment. It's particularly useful when you need to:

1. Remove unwanted or incorrect questions from an assessment
2. Clean up test questions or duplicates
3. Update assessment content by removing outdated questions
4. Manage assessment structure by removing specific questions

Note: When a question is deleted, the system automatically maintains the proper ordering of remaining questions by reindexing the quizQuestionsOrder array in the associated assessment.

---

# Update Quiz Question Index API

## Endpoint

`PUT /assessments/quiz-questions/:quizQuestionId/index`

## Description

Updates the position index of a specific quiz question within an assessment. When a quiz question's index is changed, the assessment's quizQuestionsOrder is automatically updated to reflect the new position, and other quiz questions are reindexed accordingly to maintain sequential ordering.

## Request

### Headers

- `Content-Type: application/json`

### Path Parameters

| Parameter      | Type          | Required | Description                                              |
| -------------- | ------------- | -------- | -------------------------------------------------------- |
| quizQuestionId | string (UUID) | Yes      | The unique identifier of the quiz question to reposition |

### Request Body

| Field | Type   | Required | Description                                                                                                                               |
| ----- | ------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| index | number | Yes      | The new position index for the quiz question (0-based, non-negative integer). Must not exceed the total number of quiz questions minus 1. |

### Validation Rules

1. `index` must be a non-negative integer
2. `index` must not be greater than the total number of quiz questions in the assessment minus 1
3. The quiz question must exist in the assessment's current order list

### Example Request

```bash
curl -X PUT "http://18.171.208.170:4040/assessments/quiz-questions/8c20aaa5-6c4c-46c1-a681-7f8d25634e90/index" \
  -H "Content-Type: application/json" \
  -d '{
    "index": 5
  }'
```

## Response

### Success Response

- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body

| Field                                               | Type          | Description                                                 |
| --------------------------------------------------- | ------------- | ----------------------------------------------------------- |
| status                                              | string        | "success"                                                   |
| statusCode                                          | number        | 200                                                         |
| message                                             | string        | "Request was successful"                                    |
| data.assessment.id                                  | string        | Unique identifier of the updated assessment                 |
| data.assessment.nameOrTitle                         | string        | Name or title of the assessment                             |
| data.assessment.assessmentCode                      | string        | Code of the assessment                                      |
| data.assessment.assessmentCategory                  | string        | Category of the assessment                                  |
| data.assessment.assessmentType                      | string        | Type of the assessment                                      |
| data.assessment.questionSize                        | number        | Number of questions in the assessment (if applicable)       |
| data.assessment.descriptionOrInstructions           | string        | Description or instructions for the assessment              |
| data.assessment.status                              | string        | Status of the assessment                                    |
| data.assessment.availableStartDate                  | string (date) | Start date when the assessment becomes available            |
| data.assessment.availableEndDate                    | string (date) | End date when the assessment is no longer available         |
| data.assessment.timeLimit                           | number        | Time limit for the assessment in minutes                    |
| data.assessment.totalPointsOrWeight                 | number        | Total points or weight of the assessment                    |
| data.assessment.passingScore                        | number        | Minimum score required to pass the assessment (optional)    |
| data.assessment.attempts                            | number        | Number of allowed attempts for the assessment               |
| data.assessment.lateSubmissions                     | boolean       | Whether late submissions are allowed                        |
| data.assessment.quizQuestionsOrder                  | array         | Array of objects showing the new order of quiz questions    |
| data.assessment.quizQuestionsOrder[].index          | number        | The position index of the quiz question                     |
| data.assessment.quizQuestionsOrder[].quizQuestionId | string        | The unique identifier of the quiz question at that position |

### Example Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "assessment": {
      "id": "0fd665e1-43a2-4a9a-b26a-410a64b96928",
      "nameOrTitle": "Sample Assessment",
      "assessmentCode": "SA003",
      "assessmentCategory": "QUIZ",
      "assessmentType": "CPD",
      "questionSize": 10,
      "descriptionOrInstructions": "Sample assessment for testing",
      "status": "DRAFT",
      "availableStartDate": "2025-01-01T00:00:00.000Z",
      "availableEndDate": "2025-12-31T00:00:00.000Z",
      "timeLimit": 60,
      "totalPointsOrWeight": 100,
      "passingScore": 50,
      "attempts": 1,
      "lateSubmissions": false,
      "quizQuestionsOrder": [
        {
          "index": 0,
          "quizQuestionId": "8c20aaa5-6c4c-46c1-a681-7f8d25634e90"
        },
        {
          "index": 1,
          "quizQuestionId": "77d65e66-d5e9-481f-82c1-236e8ea3ef00"
        }
      ]
    }
  }
}
```

### Error Responses

| Status Code | Error Message                           | Description                                                                 |
| ----------- | --------------------------------------- | --------------------------------------------------------------------------- |
| 400         | "Index must be a non-negative integer"  | When the provided index is negative or not an integer                       |
| 400         | "Index cannot be greater than X"        | When the provided index exceeds the number of quiz questions minus 1        |
| 404         | "Quiz question not found"               | When no quiz question exists with the provided ID                           |
| 404         | "Associated assessment not found"       | When the quiz question exists but its associated assessment does not        |
| 404         | "Quiz question not found in order list" | When the quiz question doesn't exist in the assessment's current order list |

## Usage

This endpoint is used to change the position of a quiz question within an assessment. It's particularly useful when you need to:

1. Reorder quiz questions for better flow or logical sequence
2. Move important questions to more prominent positions
3. Adjust the order of questions after adding or removing questions
4. Organize questions by difficulty level or topic

Note: When a question's index changes, all other questions in the assessment are automatically repositioned to maintain sequential ordering starting from 0.

