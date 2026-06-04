# Assessment Module API Documentation - Assignment Questions

## Base URL
All API endpoints are relative to: `http://18.171.208.170:4040`

This module provides APIs for managing assignment questions in the system. Each API serves a specific function within the assessment management workflow.

---

# Create Assignment Question API

## Endpoint
`POST /assessments/:assessmentId/assignment-questions`

## Description
Creates a new assignment question and adds it to the specified assessment. This endpoint only works with assessments that have the category "ASSIGNMENT". The question will be inserted at the specified position in the assignment sequence.

## Request

### Headers
- `Content-Type: application/json`

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| assessmentId | string (UUID) | Yes | The unique identifier of the assessment to add the assignment question to |

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| index | number | Yes | The position index where the question should be inserted in the assignment sequence (0-based, non-negative integer) |

### Validation Rules
1. `index` must be a non-negative integer
2. `index` must not be greater than the total number of existing assignment questions
3. The assessment category must be "ASSIGNMENT" (not "QUIZ")

### Example Request
```bash
curl -X POST "http://18.171.208.170:4040/assessments/3492126e-7d82-4184-88f2-606b9549b5a2/assignment-questions" \
  -H "Content-Type: application/json" \
  -d '{
    "index": 0
  }'
```

## Response

### Success Response
- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body
| Field | Type | Description |
|-------|------|-------------|
| status | string | "success" |
| statusCode | number | 200 |
| message | string | "Request was successful" |
| data.assignmentQuestion.id | string | Unique identifier of the created assignment question |
| data.assignmentQuestion.assessment.id | string | Unique identifier of the associated assessment |

### Example Success Response
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "assignmentQuestion": {
      "id": "90927c79-3297-41f8-9e41-c365a7c8d83f",
      "assessment": {
        "id": "3492126e-7d82-4184-88f2-606b9549b5a2"
      }
    }
  }
}
```

### Error Responses
| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 400 | "Assignment questions can only be created for assessments with category ASSIGNMENT" | When attempting to add an assignment question to an assessment that is not of category "ASSIGNMENT" |
| 400 | "Index cannot be greater than X" | When the specified index is greater than the number of existing assignment questions |
| 404 | "Assessment not found" | When no assessment exists with the provided ID |

## Usage

This endpoint is used to add new assignment questions to an existing assessment. It's particularly useful when you need to:

1. Build an assignment by adding questions one by one
2. Insert questions at specific positions in the assignment sequence
3. Support assignment-type questions in your assessment system

Note: The index parameter allows you to control the order of questions in the assignment. When inserting a question at a specific index, existing questions at that index and beyond will be shifted to subsequent positions.

---

# Update Assignment Question API

## Endpoint
`PUT /assessments/assignment-questions/:assignmentQuestionId`

## Description
Updates an existing assignment question with the provided details. Only the fields provided in the request body will be updated, other fields remain unchanged. This allows for partial updates of assignment question information.

## Request

### Headers
- `Content-Type: application/json`

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| assignmentQuestionId | string (UUID) | Yes | The unique identifier of the assignment question to update |

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| questionText | string | No | The text content of the assignment question (min 1 character if provided) |
| submissionType | any | No | The submission type configuration for the assignment (can be any JSON structure) |
| point | number | No | The point value of the assignment (non-negative integer if provided) |
| rubricName | string | No | Name of the rubric template associated with this assignment |
| rubricDescription | string | No | Description of the rubric template associated with this assignment |

### Validation Rules
1. If `questionText` is provided, it must be at least 1 character long
2. If `point` is provided, it must be a non-negative integer
3. The assignment question must exist

### Example Request
```bash
curl -X PUT "http://18.171.208.170:4040/assessments/assignment-questions/90927c79-3297-41f8-9e41-c365a7c8d83f" \
  -H "Content-Type: application/json" \
  -d '{
    "questionText": "Write a research paper on modern web development frameworks",
    "point": 100,
    "submissionType": {
      "type": "file-upload",
      "maxFileSize": 10,
      "acceptedTypes": ["pdf", "docx"]
    },
    "rubricName": "Research Paper Rubric",
    "rubricDescription": "Rubric for evaluating research papers"
  }'
```

## Response

### Success Response
- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body
| Field | Type | Description |
|-------|------|-------------|
| status | string | "success" |
| statusCode | number | 200 |
| message | string | "Request was successful" |
| data.assignmentQuestion.id | string | Unique identifier of the updated assignment question |
| data.assignmentQuestion.questionText | string | Updated question text (if provided) |
| data.assignmentQuestion.submissionType | any | Updated submission type configuration (if provided) |
| data.assignmentQuestion.point | number | Updated point value (if provided) |
| data.assignmentQuestion.rubricName | string | Updated rubric name (if provided) |
| data.assignmentQuestion.rubricDescription | string | Updated rubric description (if provided) |
| data.assignmentQuestion.assessment.id | string | Unique identifier of the associated assessment |

### Example Success Response
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "assignmentQuestion": {
      "id": "90927c79-3297-41f8-9e41-c365a7c8d83f",
      "questionText": "Write a research paper on modern web development frameworks",
      "submissionType": {
        "type": "file-upload",
        "maxFileSize": 10,
        "acceptedTypes": ["pdf", "docx"]
      },
      "point": 100,
      "rubricName": "Research Paper Rubric",
      "rubricDescription": "Rubric for evaluating research papers",
      "assessment": {
        "id": "3492126e-7d82-4184-88f2-606b9549b5a2"
      }
    }
  }
}
```

### Error Responses
| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 400 | "Question text is required" | When questionText is provided but is empty |
| 400 | "Point value must be a non-negative integer" | When point is provided but is negative |
| 404 | "Assignment question not found" | When no assignment question exists with the provided ID |
| 404 | "Associated assessment not found" | When the assignment question exists but its associated assessment does not |

## Usage

This endpoint is used to update specific fields of an existing assignment question. It's particularly useful when you need to:

1. Modify assignment question text or parameters
2. Update submission type configurations
3. Adjust point values for assignments
4. Add or update rubric information for the assignment

Note: The endpoint supports partial updates, so only the fields provided in the request body will be updated.

---

# Update Assignment Question Index API

## Endpoint
`PUT /assessments/assignment-questions/:assignmentQuestionId/index`

## Description
Updates the position index of a specific assignment question within an assessment. When an assignment question's index is changed, the assessment's assignmentQuestionsOrder is automatically updated to reflect the new position, and other assignment questions are reindexed accordingly to maintain sequential ordering.

## Request

### Headers
- `Content-Type: application/json`

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| assignmentQuestionId | string (UUID) | Yes | The unique identifier of the assignment question to reposition |

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| index | number | Yes | The new position index for the assignment question (0-based, non-negative integer). Must not exceed the total number of assignment questions minus 1. |

### Validation Rules
1. `index` must be a non-negative integer
2. `index` must not be greater than the total number of assignment questions in the assessment minus 1
3. The assignment question must exist in the assessment's current order list

### Example Request
```bash
curl -X PUT "http://18.171.208.170:4040/assessments/assignment-questions/90927c79-3297-41f8-9e41-c365a7c8d83f/index" \
  -H "Content-Type: application/json" \
  -d '{
    "index": 2
  }'
```

## Response

### Success Response
- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body
| Field | Type | Description |
|-------|------|-------------|
| status | string | "success" |
| statusCode | number | 200 |
| message | string | "Request was successful" |
| data.assessment.id | string | Unique identifier of the updated assessment |
| data.assessment.nameOrTitle | string | Name or title of the assessment |
| data.assessment.assessmentCode | string | Code of the assessment |
| data.assessment.assessmentCategory | string | Category of the assessment |
| data.assessment.assessmentType | string | Type of the assessment |
| data.assessment.questionSize | number | Number of questions in the assessment (if applicable) |
| data.assessment.descriptionOrInstructions | string | Description or instructions for the assessment |
| data.assessment.status | string | Status of the assessment |
| data.assessment.availableStartDate | string (date) | Start date when the assessment becomes available |
| data.assessment.availableEndDate | string (date) | End date when the assessment is no longer available |
| data.assessment.timeLimit | number | Time limit for the assessment in minutes |
| data.assessment.totalPointsOrWeight | number | Total points or weight of the assessment |
| data.assessment.passingScore | number | Minimum score required to pass the assessment (optional) |
| data.assessment.attempts | number | Number of allowed attempts for the assessment |
| data.assessment.lateSubmissions | boolean | Whether late submissions are allowed |
| data.assessment.assignmentQuestionsOrder | array | Array of objects showing the new order of assignment questions |
| data.assessment.assignmentQuestionsOrder[].index | number | The position index of the assignment question |
| data.assessment.assignmentQuestionsOrder[].assignmentQuestionId | string | The unique identifier of the assignment question at that position |

### Example Success Response
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "assessment": {
      "id": "3492126e-7d82-4184-88f2-606b9549b5a2",
      "nameOrTitle": "Portfolio Assignment",
      "assessmentCode": "PA001",
      "assessmentCategory": "ASSIGNMENT",
      "assessmentType": "CPD",
      "questionSize": null,
      "descriptionOrInstructions": "Portfolio submission for continuing professional development",
      "status": "DRAFT",
      "availableStartDate": "2025-11-01T00:00:00.000Z",
      "availableEndDate": "2025-12-31T23:59:59.000Z",
      "timeLimit": 0,
      "totalPointsOrWeight": 250,
      "passingScore": 175,
      "attempts": 1,
      "lateSubmissions": true,
      "assignmentQuestionsOrder": [
        {
          "index": 0,
          "assignmentQuestionId": "90927c79-3297-41f8-9e41-c365a7c8d83f"
        }
      ]
    }
  }
}
```

### Error Responses
| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 400 | "Index must be a non-negative integer" | When the provided index is negative or not an integer |
| 400 | "Index cannot be greater than X" | When the provided index exceeds the number of assignment questions minus 1 |
| 404 | "Assignment question not found" | When no assignment question exists with the provided ID |
| 404 | "Associated assessment not found" | When the assignment question exists but its associated assessment does not |
| 404 | "Assignment question not found in order list" | When the assignment question doesn't exist in the assessment's current order list |

## Usage

This endpoint is used to change the position of an assignment question within an assessment. It's particularly useful when you need to:

1. Reorder assignment questions for better flow or logical sequence
2. Move important questions to more prominent positions
3. Adjust the order of questions after adding or removing questions
4. Organize questions by difficulty level or topic

Note: When a question's index changes, all other questions in the assessment are automatically repositioned to maintain sequential ordering starting from 0.

---

# Get Assignment Questions for Assessment API

## Endpoint
`GET /assessments/:assessmentId/assignment-questions`

## Description
Retrieves all assignment questions associated with a specific assessment. The questions are returned in the order specified by the assessment's assignmentQuestionsOrder property, with pagination support.

## Request

### Headers
- `Content-Type: application/json`

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| assessmentId | string (UUID) | Yes | The unique identifier of the assessment whose assignment questions are being retrieved |

### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | number | No | 1 | Page number for pagination (must be a positive integer) |
| pageSize | number | No | 10 | Number of items per page (minimum 1, maximum 100) |

## Response

### Success Response
- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body
| Field | Type | Description |
|-------|------|-------------|
| status | string | "success" |
| statusCode | number | 200 |
| message | string | "Request was successful" |
| data.assignmentQuestions | array | Array of assignment question objects |
| data.assignmentQuestions[].id | string | Unique identifier of the assignment question |
| data.assignmentQuestions[].questionText | string | The text content of the assignment question |
| data.assignmentQuestions[].submissionType | any | The submission type configuration for the assignment (can be any JSON structure) |
| data.assignmentQuestions[].point | number | The point value of the assignment |
| data.assignmentQuestions[].rubricName | string | Name of the rubric template associated with this assignment (optional) |
| data.assignmentQuestions[].rubricDescription | string | Description of the rubric template associated with this assignment (optional) |
| pagination | object | Pagination information |
| pagination.count | number | Number of items in the current response |
| pagination.total | number | Total number of items matching the query |
| pagination.page | number | Current page number |
| pagination.perPage | number | Number of items per page |
| pagination.totalPages | number | Total number of pages |

### Example Request
```bash
curl -X GET "http://18.171.208.170:4040/assessments/3492126e-7d82-4184-88f2-606b9549b5a2/assignment-questions?page=1&pageSize=5"
```

### Example Success Response
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "assignmentQuestions": [
      {
        "id": "90927c79-3297-41f8-9e41-c365a7c8d83f",
        "questionText": "Write a research paper on modern web development frameworks",
        "submissionType": {
          "type": "file-upload",
          "maxFileSize": 10,
          "acceptedTypes": ["pdf", "docx"]
        },
        "point": 100
      }
    ]
  },
  "pagination": {
    "count": 1,
    "total": 1,
    "page": 1,
    "perPage": 5,
    "totalPages": 1
  }
}
```

### Error Responses
| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 404 | "Assessment not found" | When no assessment exists with the provided ID |

## Usage

This endpoint is used to retrieve all assignment questions for a specific assessment in their proper order. It's particularly useful when you need to:

1. Display assignment questions to students for a particular assessment
2. Show an instructor the current questions in their assignment
3. Paginate through large numbers of assignment questions
4. Present questions in the correct sequence as defined by the assessment's order settings

Note: The endpoint maintains the correct ordering of questions as specified in the assessment's assignmentQuestionsOrder property, ensuring questions appear in the intended sequence.

---

# Get Assignment Question by ID API

## Endpoint
`GET /assessments/assignment-questions/:assignmentQuestionId`

## Description
Retrieves a specific assignment question by its unique identifier. Returns the complete question data including content, submission type, point value, and associated assessment information.

## Request

### Headers
- `Content-Type: application/json`

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| assignmentQuestionId | string (UUID) | Yes | The unique identifier of the assignment question to retrieve |

## Response

### Success Response
- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body
| Field | Type | Description |
|-------|------|-------------|
| status | string | "success" |
| statusCode | number | 200 |
| message | string | "Request was successful" |
| data.assignmentQuestion.id | string | Unique identifier of the assignment question |
| data.assignmentQuestion.questionText | string | The text content of the assignment question |
| data.assignmentQuestion.submissionType | any | The submission type configuration for the assignment (can be any JSON structure) |
| data.assignmentQuestion.point | number | The point value of the assignment |
| data.assignmentQuestion.rubricName | string | Name of the rubric template associated with this assignment (optional) |
| data.assignmentQuestion.rubricDescription | string | Description of the rubric template associated with this assignment (optional) |
| data.assignmentQuestion.assessment.id | string | The ID of the associated assessment |

### Example Request
```bash
curl -X GET "http://18.171.208.170:4040/assessments/assignment-questions/90927c79-3297-41f8-9e41-c365a7c8d83f"
```

### Example Success Response
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "assignmentQuestion": {
      "id": "90927c79-3297-41f8-9e41-c365a7c8d83f",
      "questionText": "Write a research paper on modern web development frameworks",
      "submissionType": {
        "type": "file-upload",
        "maxFileSize": 10,
        "acceptedTypes": ["pdf", "docx"]
      },
      "point": 100,
      "assessment": {
        "id": "3492126e-7d82-4184-88f2-606b9549b5a2"
      }
    }
  }
}
```

### Error Responses
| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 404 | "Assignment question not found" | When no assignment question exists with the provided ID |
| 404 | "Associated assessment not found" | When the assignment question exists but its associated assessment does not |

## Usage

This endpoint is used to retrieve a specific assignment question when you know its unique ID. It's particularly useful when you need to:

1. Load a specific question for editing or review
2. Display a single question to a student or instructor
3. Fetch question details for a specific question ID
4. Check the content of a particular assignment question without fetching all questions

Note: The endpoint returns the complete question data including its associated assessment information.

---

# Delete Assignment Question API

## Endpoint
`DELETE /assessments/assignment-questions/:assignmentQuestionId`

## Description
Deletes a specific assignment question by its unique identifier. When an assignment question is deleted, the assessment's assignmentQuestionsOrder is automatically updated to remove the question and reindex the remaining questions to maintain sequential ordering.

## Request

### Headers
- `Content-Type: application/json`

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| assignmentQuestionId | string (UUID) | Yes | The unique identifier of the assignment question to delete |

## Response

### Success Response
- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body
| Field | Type | Description |
|-------|------|-------------|
| status | string | "success" |
| statusCode | number | 200 |
| message | string | "Request was successful" |
| data.message | string | "Assignment question deleted successfully" |

### Example Request
```bash
curl -X DELETE "http://18.171.208.170:4040/assessments/assignment-questions/90927c79-3297-41f8-9e41-c365a7c8d83f"
```

### Example Success Response
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "message": "Assignment question deleted successfully"
  }
}
```

### Error Responses
| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 404 | "Assignment question not found" | When no assignment question exists with the provided ID |
| 404 | "Associated assessment not found" | When the assignment question exists but its associated assessment does not |

## Usage

This endpoint is used to permanently remove an assignment question from an assessment. It's particularly useful when you need to:

1. Remove unwanted or incorrect questions from an assessment
2. Clean up test questions or duplicates
3. Update assessment content by removing outdated questions
4. Manage assessment structure by removing specific questions

Note: When a question is deleted, the system automatically maintains the proper ordering of remaining questions by reindexing the assignmentQuestionsOrder array in the associated assessment.