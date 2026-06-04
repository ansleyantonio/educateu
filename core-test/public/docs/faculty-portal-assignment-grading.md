# Faculty Portal Assignment Grading APIs

This document details the assignment grading APIs available in the faculty portal. These endpoints allow faculty members to view and grade student assignment submissions using a 4-level hierarchical flow.

## Table of Contents

- [List Assignments](#list-assignments)
- [List Assignment Submissions](#list-assignment-submissions)
- [List Submission Questions](#list-submission-questions)
- [Get Question Details](#get-question-details)
- [Grade Question](#grade-question)

---

## List Assignments

Retrieves all assignments that have submissions across all courses taught by the authenticated faculty.

### Endpoint

```
GET /faculty-assessment/assignments
```

### Authentication

- JWT token required in Authorization header
- User must be authenticated as faculty

### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Query Parameters

| Parameter    | Type   | Required | Default | Description                      |
| ------------ | ------ | -------- | ------- | -------------------------------- |
| **page**     | number | No       | 1       | Pagination page number           |
| **pageSize** | number | No       | 10      | Number of items per page (1-100) |

### Response

#### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Assignments fetched successfully",
  "data": {
    "assignments": [
      {
        "assessmentId": "uuid",
        "assessmentTitle": "Assignment Name",
        "courseId": "uuid",
        "courseTitle": "Course Name",
        "sessionId": "uuid",
        "sessionName": "Spring 2026",
        "totalSubmissions": 21,
        "gradedCount": 3,
        "ungradedCount": 18
      }
    ],
    "pagination": {
      "count": 10,
      "total": 10,
      "page": 1,
      "perPage": 10,
      "totalPages": 1
    }
  }
}
```

#### Response Fields

| Field                | Type          | Description                         |
| -------------------- | ------------- | ----------------------------------- |
| **assessmentId**     | string (UUID) | Unique identifier of the assessment |
| **assessmentTitle**  | string        | Title of the assignment             |
| **courseId**         | string (UUID) | Course identifier                   |
| **courseTitle**      | string        | Course name                         |
| **sessionId**        | string (UUID) | Session identifier                  |
| **sessionName**      | string        | Session name (e.g., "Spring 2026")  |
| **totalSubmissions** | number        | Total number of submissions         |
| **gradedCount**      | number        | Number of graded submissions        |
| **ungradedCount**    | number        | Number of ungraded submissions      |

---

## List Assignment Submissions

Retrieves all submissions for a specific assignment.

### Endpoint

```
GET /faculty-assessment/assignments/:assessmentId/submissions
```

### Authentication

- JWT token required in Authorization header
- User must be authenticated as faculty

### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Path Parameters

| Parameter        | Type          | Required | Description                               |
| ---------------- | ------------- | -------- | ----------------------------------------- |
| **assessmentId** | string (UUID) | Yes      | The assessment ID (from Level 1 response) |

### Response

#### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Submissions fetched successfully",
  "data": {
    "assessmentId": "uuid",
    "submissions": [
      {
        "resultId": "uuid",
        "student": {
          "id": "uuid",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@example.com"
        },
        "course": {
          "id": "uuid",
          "title": "Course Name"
        },
        "session": {
          "id": "uuid",
          "name": "Spring 2026"
        },
        "submittedAt": "2026-03-14T06:32:40.532Z",
        "score": {
          "s": 1,
          "e": 0,
          "d": [16]
        },
        "maxScore": {
          "s": 1,
          "e": 1,
          "d": [30]
        },
        "isGraded": false,
        "gradedQuestions": 2
      }
    ],
    "totalSubmissions": 21
  }
}
```

#### Response Fields

| Field                 | Type                  | Description                              |
| --------------------- | --------------------- | ---------------------------------------- |
| **resultId**          | string (UUID)         | Unique submission/result identifier      |
| **student**           | object                | Student information                      |
| **student.id**        | string (UUID)         | Student user ID                          |
| **student.firstName** | string                | Student's first name                     |
| **student.lastName**  | string                | Student's last name                      |
| **student.email**     | string                | Student's email                          |
| **course**            | object                | Course information                       |
| **course.id**         | string (UUID)         | Course ID                                |
| **course.title**      | string                | Course title                             |
| **session**           | object                | Session information                      |
| **session.id**        | string (UUID)         | Session ID                               |
| **session.name**      | string                | Session name                             |
| **submittedAt**       | string (ISO DateTime) | Submission timestamp (if submitted)      |
| **score**             | object                | Decimal score (JSON serialized)          |
| **maxScore**          | object                | Maximum possible score (JSON serialized) |
| **isGraded**          | boolean               | Whether the submission is fully graded   |
| **gradedQuestions**   | number                | Number of questions graded               |

---

## List Submission Questions

Retrieves all questions for a specific submission.

### Endpoint

```
GET /faculty-assessment/assignments/:assessmentId/submissions/:resultId/questions
```

### Authentication

- JWT token required in Authorization header
- User must be authenticated as faculty

### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Path Parameters

| Parameter        | Type          | Required | Description                                      |
| ---------------- | ------------- | -------- | ------------------------------------------------ |
| **assessmentId** | string (UUID) | Yes      | The assessment ID                                |
| **resultId**     | string (UUID) | Yes      | The submission/result ID (from Level 2 response) |

### Response

#### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Questions fetched successfully",
  "data": {
    "resultId": "uuid",
    "assessmentId": "uuid",
    "assessmentTitle": "Assignment Name",
    "questions": [
      {
        "id": "uuid",
        "questionText": "Question content here",
        "point": 5,
        "submissionType": {
          "type": "SHORT_ANSWER",
          "maxLength": 100
        },
        "rubricName": "Rubric Name",
        "rubricDescription": "Rubric description",
        "isGraded": false
      }
    ]
  }
}
```

#### Response Fields

| Field                            | Type          | Description                               |
| -------------------------------- | ------------- | ----------------------------------------- |
| **id**                           | string (UUID) | Question ID                               |
| **questionText**                 | string        | The question content                      |
| **point**                        | number        | Points assigned to this question          |
| **submissionType**               | object        | Submission type details                   |
| **submissionType.type**          | string        | Type: SHORT_ANSWER, ESSAY, FILE_UPLOAD    |
| **submissionType.maxLength**     | number        | Maximum character length (for text types) |
| **submissionType.maxFileSize**   | number        | Maximum file size in MB (for file upload) |
| **submissionType.acceptedTypes** | string[]      | Accepted file extensions                  |
| **rubricName**                   | string        | Name of the rubric for this question      |
| **rubricDescription**            | string        | Rubric description                        |
| **isGraded**                     | boolean       | Whether this question has been graded     |

---

## Get Question Details

Retrieves detailed information about a specific question including rubric criteria.

### Endpoint

```
GET /faculty-assessment/assignments/:assessmentId/submissions/:resultId/questions/:questionId
```

### Authentication

- JWT token required in Authorization header
- User must be authenticated as faculty

### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Path Parameters

| Parameter        | Type          | Required | Description                             |
| ---------------- | ------------- | -------- | --------------------------------------- |
| **assessmentId** | string (UUID) | Yes      | The assessment ID                       |
| **resultId**     | string (UUID) | Yes      | The submission/result ID                |
| **questionId**   | string (UUID) | Yes      | The question ID (from Level 3 response) |

### Response

#### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Question details fetched successfully",
  "data": {
    "resultId": "uuid",
    "assessmentId": "uuid",
    "question": {
      "id": "uuid",
      "questionText": "Question content here",
      "point": 5,
      "submissionType": {
        "type": "SHORT_ANSWER",
        "maxLength": 100
      },
      "rubricName": "Rubric Name",
      "rubricDescription": "Rubric description",
      "rubricCriteria": [
        {
          "id": "uuid",
          "criteria": "Excellent",
          "points": 5,
          "description": "Full marks description"
        }
      ]
    }
  }
}
```

#### Response Fields

| Field                            | Type          | Description              |
| -------------------------------- | ------------- | ------------------------ |
| **question.id**                  | string (UUID) | Question ID              |
| **question.questionText**        | string        | Question content         |
| **question.point**               | number        | Points for this question |
| **question.submissionType**      | object        | Submission type details  |
| **question.rubricName**          | string        | Rubric name              |
| **question.rubricDescription**   | string        | Rubric description       |
| **question.rubricCriteria**      | array         | Array of rubric criteria |
| **rubricCriteria[].id**          | string (UUID) | Criteria ID              |
| **rubricCriteria[].criteria**    | string        | Criteria name/level      |
| **rubricCriteria[].points**      | number        | Points for this criteria |
| **rubricCriteria[].description** | string        | Criteria description     |

---

## Grade Question

Grades a specific question in a student submission.

### Endpoint

```
POST /faculty-assessment/assignments/:assessmentId/submissions/:resultId/questions/:questionId/grade
```

### Authentication

- JWT token required in Authorization header
- User must be authenticated as faculty

### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Path Parameters

| Parameter        | Type          | Required | Description              |
| ---------------- | ------------- | -------- | ------------------------ |
| **assessmentId** | string (UUID) | Yes      | The assessment ID        |
| **resultId**     | string (UUID) | Yes      | The submission/result ID |
| **questionId**   | string (UUID) | Yes      | The question ID          |

### Request Body

| Parameter        | Type   | Required | Description                             |
| ---------------- | ------ | -------- | --------------------------------------- |
| **rubricGrades** | array  | Yes      | Array of rubric criteria grades (min 1) |
| **feedback**     | string | No       | Overall feedback for the student        |

#### Rubric Grades Object

| Parameter      | Type          | Required | Description                         |
| -------------- | ------------- | -------- | ----------------------------------- |
| **criteriaId** | string (UUID) | Yes      | The rubric criteria ID              |
| **score**      | number        | Yes      | Score for this criteria (0 to max)  |
| **feedback**   | string        | No       | Feedback for this specific criteria |

#### Example Request

```json
{
  "rubricGrades": [
    {
      "criteriaId": "d7c17582-1709-4469-92bc-da10338334d0",
      "score": 4,
      "feedback": "Excellent content quality"
    },
    {
      "criteriaId": "4d7fc35d-138e-4416-81a6-51c232c2eee5",
      "score": 5,
      "feedback": "Perfect structure"
    }
  ],
  "feedback": "Great overall work!"
}
```

### Response

#### Success Response (200 OK)

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Question graded successfully",
  "data": {
    "resultId": "uuid",
    "questionId": "uuid",
    "rubricGrades": [
      {
        "criteriaId": "d7c17582-1709-4469-92bc-da10338334d0",
        "score": 4,
        "feedback": "Excellent content quality"
      }
    ],
    "totalScore": 9,
    "maxScore": 20,
    "percentage": 45,
    "isFullyGraded": false
  }
}
```

#### Response Fields

| Field             | Type          | Description                                  |
| ----------------- | ------------- | -------------------------------------------- |
| **resultId**      | string (UUID) | The submission ID                            |
| **questionId**    | string (UUID) | The question that was graded                 |
| **rubricGrades**  | array         | Array of graded rubric criteria              |
| **totalScore**    | number        | Cumulative score across all graded questions |
| **maxScore**      | number        | Maximum possible score                       |
| **percentage**    | number        | Percentage score                             |
| **isFullyGraded** | boolean       | Whether all questions are now graded         |

#### Error Responses

##### 400 Bad Request (Invalid score)

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Score for criteria must be between 0 and {maxPoints}",
  "error": {
    "code": "BAD_REQUEST"
  }
}
```

##### 400 Bad Request (Empty rubricGrades)

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "rubricGrades: Value is too small. Minimum allowed is 1.",
  "error": {
    "code": "BAD_REQUEST"
  }
}
```

##### 400 Bad Request (Total score exceeds question points)

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Total rubric score (10) must be between 0 and 5",
  "error": {
    "code": "BAD_REQUEST"
  }
}
```

##### 404 Not Found (Invalid criteria)

```json
{
  "status": "error",
  "statusCode": 404,
  "message": "Rubric criteria {criteriaId} not found for this question",
  "error": {
    "code": "NOT_FOUND"
  }
}
```

##### 404 Not Found

```json
{
  "status": "error",
  "statusCode": 404,
  "message": "Submission or question not found",
  "error": {
    "code": "NOT_FOUND"
  }
}
```

---

## Grading Flow Summary

The recommended workflow for grading assignments:

1. **Level 1**: Call `GET /faculty-assessment/assignments` to see all assignments with submission counts
2. **Level 2**: Call `GET /assignments/:assessmentId/submissions` to see student submissions
3. **Level 3**: Call `GET /assignments/:assessmentId/submissions/:resultId/questions` to see questions
4. **Level 4**: Call `GET /assignments/:assessmentId/submissions/:resultId/questions/:questionId` for detailed view
5. **Grade**: Call `POST /assignments/:assessmentId/submissions/:resultId/questions/:questionId/grade` to submit grade

---

## Notes

- The score fields use Decimal type from PostgreSQL, serialized as JSON objects with `s` (sign), `e` (exponent), and `d` (digits) properties
- Each question can be graded independently - partial grading is supported
- The `isFullyGraded` field indicates when all questions in a submission have been graded
