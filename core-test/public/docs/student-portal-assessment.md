# Student Portal Assessment APIs

This document details the assessment-related APIs available in the student portal.

> **Important Note on Module Isolation**: Since a student may have the same assessment assigned to multiple modules within a course, all assessment endpoints now require both `studentCourseId` and `moduleId` query parameters. This ensures that submissions, results, and questions are properly isolated per module, allowing the same assessment to be taken independently in different modules.

## Table of Contents

- [Get All Student Assessments](#get-all-student-assessments)
- [Get Assessment Questions](#get-assessment-questions)
- [Start Assessment](#start-assessment)
- [Submit Assessment Answers](#submit-assessment-answers)
- [Get Assessment Results](#get-assessment-results)

## Get All Student Assessments

Retrieves all assessments for the authenticated student across all enrolled courses. Each assessment appears once per course (no deduplication), allowing students to see the same assessment in multiple courses with potentially different statuses.

### Endpoint

```
GET /student-portal/assessments
```

### Authentication

- JWT token required in Authorization header
- User must be authenticated as a student

### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
user-id: <user_id>
```

### Query Parameters

| Parameter           | Type          | Required | Default | Description                                                                                                        |
| ------------------- | ------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------ |
| **status**          | string        | No       | –       | Filter assessments by status. Accepted values: `LOCKED`, `AVAILABLE`, `OVERDUE`, `SUBMITTED`, `GRADED`, `EXPIRED`. |
| **sessionCourseId** | string (UUID) | No       | –       | Return assessments only for the given session course.                                                              |
| **page**            | number        | No       | 1       | Pagination page number (positive integer).                                                                         |
| **pageSize**        | number        | No       | 10      | Number of items per page (1-100).                                                                                  |
| **moduleId**        | string (UUID) | No       | –       | Return assessments only for the given module.                                                                      |

### Response

#### Success Response (200 OK)

```json
{
  "status": "success",
  "data": {
    "assessments": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "studentCourseId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        "sessionCourseId": "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
        "title": "Assignment 1: Introduction to AI",
        "description": "Submit your first assignment on AI basics",
        "courseId": "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
        "courseTitle": "Advanced AI for Robotics",
        "assessmentCategory": "ASSIGNMENT",
        "assessmentType": "INDIVIDUAL_ASSIGNMENT",
        "dueDate": "2024-03-15T23:59:59.000Z",
        "availableStartDate": "2024-03-01T00:00:00.000Z",
        "availableEndDate": "2024-03-15T23:59:59.000Z",
        "timeLimit": null,
        "totalPointsOrWeight": 100,
        "passingScore": 60,
        "attempts": 3,
        "maxAttempts": 3,
        "attemptCount": 1,
        "remainingAttempts": 2,
        "status": "ACTIVE",
        "assessmentStatus": "AVAILABLE",
        "submittedAt": null,
        "score": null
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "totalCount": 10,
      "totalPages": 1
    }
  }
}
```

#### Response Fields

**Assessment Object:**

| Field                 | Type                      | Description                                                                                                                                  |
| --------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                  | string (UUID)             | Unique identifier of the assessment template                                                                                                 |
| `studentCourseId`     | string (UUID)             | **Important**: Unique identifier for the student's enrollment in this specific course. Use this when submitting answers or fetching results. |
| `sessionCourseId`     | string (UUID)             | Identifier for the session/course instance                                                                                                   |
| `moduleId`            | string (UUID)             | **REQUIRED** for other endpoints - identifies which module this assessment instance belongs to                                               |
| `moduleTitle`         | string                    | Title of the module where this assessment is located                                                                                         |
| `title`               | string                    | Title of the assessment                                                                                                                      |
| `description`         | string                    | Description or instructions for the assessment                                                                                               |
| `courseId`            | string (UUID)             | Identifier of the course from the snapshot                                                                                                   |
| `courseTitle`         | string                    | Name of the course this assessment belongs to                                                                                                |
| `assessmentCategory`  | string                    | Category: `QUIZ`, `ASSIGNMENT`, `PROJECT`, `EXAM`                                                                                            |
| `assessmentType`      | string                    | Type: `INDIVIDUAL_ASSIGNMENT`, `GROUP_ASSIGNMENT`, etc.                                                                                      |
| `dueDate`             | string (ISO date) \| null | Due date for the assessment                                                                                                                  |
| `availableStartDate`  | string (ISO date)         | When the assessment becomes available                                                                                                        |
| `availableEndDate`    | string (ISO date)         | When the assessment closes                                                                                                                   |
| `timeLimit`           | number \| null            | Time limit in minutes (null for untimed)                                                                                                     |
| `totalPointsOrWeight` | number                    | Total points or weight of the assessment                                                                                                     |
| `passingScore`        | number                    | Minimum score to pass                                                                                                                        |
| `attempts`            | number                    | Number of allowed attempts (deprecated, use `maxAttempts`)                                                                                   |
| `maxAttempts`         | number                    | Maximum number of allowed attempts for this assessment                                                                                       |
| `attemptCount`        | number                    | Current number of attempts the student has made                                                                                              |
| `remainingAttempts`   | number                    | Number of attempts remaining (`maxAttempts - attemptCount`)                                                                                  |
| `status`              | string                    | Template status: `ACTIVE`, `INACTIVE`, `ARCHIVED`                                                                                            |
| `assessmentStatus`    | string                    | **Student's status**: `LOCKED`, `AVAILABLE`, `OVERDUE`, `SUBMITTED`, `GRADED`, `EXPIRED`                                                     |
| `submittedAt`         | string (ISO date) \| null | When the student submitted (if submitted)                                                                                                    |
| `score`               | number \| null            | The student's score (if graded)                                                                                                              |

#### Error Response (401 Unauthorized)

```json
{
  "status": "error",
  "errorCode": "UNAUTHORIZED",
  "message": "Student information not found in request"
}
```

### Example Request

```bash
curl -X GET \
  "http://localhost:3000/student-portal/assessments?page=1&pageSize=10" \
  -H "user-id: d8d802a5-fbb3-45fe-9709-deb2d0d579c1" \
  -H "Content-Type: application/json"
```

### Important Notes

- **Module Isolation**: The same assessment may appear multiple times in the response (once per module within each course). Each entry has unique `studentCourseId` and `moduleId`.
- **Use Both IDs**: When submitting answers or fetching results/questions, always use both `studentCourseId` and `moduleId` from the assessment list.
- **Assessment Status**: The `assessmentStatus` field shows the student's current state:
  - `LOCKED` (not yet available)
  - `AVAILABLE` (can start)
  - `EXPIRED` (started but time limit exceeded, can restart if attempts remain)
  - `OVERDUE` (past due date)
  - `SUBMITTED` (answers submitted, awaiting grading)
  - `GRADED` (score available)
- **Multiple Modules**: An assessment assigned to multiple modules will appear once for each module, allowing independent submissions per module.

---

## Get Assessment Questions

Retrieves questions for a specific assessment from a specific module in a specific course. **Requires both `studentCourseId` and `moduleId` query parameters** to identify the exact module context.

### Endpoint

```
GET /student-portal/assessments/{assessmentId}/questions?studentCourseId={studentCourseId}&moduleId={moduleId}
```

### Path Parameters

| Parameter    | Type          | Description                             |
| ------------ | ------------- | --------------------------------------- |
| assessmentId | string (UUID) | The unique identifier of the assessment |

### Query Parameters

| Parameter           | Type          | Required | Description                                                          |
| ------------------- | ------------- | -------- | -------------------------------------------------------------------- |
| **studentCourseId** | string (UUID) | **Yes**  | The student's course enrollment ID (from assessment list)            |
| **moduleId**        | string (UUID) | **Yes**  | The module ID where the assessment is located (from assessment list) |
| correctness         | string        | No       | Filter by correctness: `all`, `correct`, `incorrect`                 |

### Authentication

- JWT token required in Authorization header
- User must be authenticated as a student

### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
user-id: <user_id>
```

### Response

#### Success Response (200 OK)

```json
{
  "status": "success",
  "data": {
    "assessment": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Quiz 1: AI Fundamentals",
      "description": "Test your understanding of AI basics",
      "assessmentCategory": "QUIZ",
      "assessmentType": "INDIVIDUAL_ASSIGNMENT",
      "totalPointsOrWeight": 50,
      "questionSize": 10,
      "timeLimit": 30,
      "availableStartDate": "2024-03-01T00:00:00.000Z",
      "availableEndDate": "2024-03-15T23:59:59.000Z"
    },
    "questions": [
      {
        "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        "type": "MULTIPLE_CHOICE",
        "questionText": "What is the primary goal of machine learning?",
        "point": 5,
        "options": [
          {
            "id": "option-1",
            "text": "To write explicit programming rules",
            "isCorrect": false
          },
          {
            "id": "option-2",
            "text": "To enable computers to learn from data",
            "isCorrect": true
          }
        ],
        "submissionType": "SINGLE_SELECT",
        "rubricName": null,
        "rubricDescription": null,
        "createdAt": "2024-03-01T10:00:00.000Z",
        "updatedAt": "2024-03-01T10:00:00.000Z"
      }
    ]
  }
}
```

#### Error Response (400 Bad Request) - Missing studentCourseId

```json
{
  "status": "error",
  "errorCode": "VALIDATION_ERROR",
  "message": "Student Course ID must be a valid UUID"
}
```

#### Error Response (404 Not Found)

```json
{
  "status": "error",
  "errorCode": "ASSESSMENT_NOT_FOUND",
  "message": "Assessment not found in this course"
}
```

### Example Request

```bash
curl -X GET \
  "http://localhost:3000/student-portal/assessments/550e8400-e29b-41d4-a716-446655440000/questions?studentCourseId=6ba7b810-9dad-11d1-80b4-00c04fd430c8&moduleId=45a1e171-e020-497b-9752-235c8b721fb1" \
  -H "user-id: d8d802a5-fbb3-45fe-9709-deb2d0d579c1" \
  -H "Content-Type: application/json"
```

### Notes

- **Required Parameters**: Both `studentCourseId` and `moduleId` query parameters are **mandatory**. Without either, the API will return a validation error.
- **Module Context**: Questions are retrieved from the specific module within the course snapshot identified by the combination of `studentCourseId` and `moduleId`.
- **Question Selection**: For quizzes, questions are randomly selected and ordered each time the endpoint is called (based on `questionSize`).
- **Options**: For multiple choice questions, `isCorrect` indicates the correct answer(s) for study purposes.

---

## Start Assessment

Starts an assessment and records the start time. This is **required** for timed assessments before submitting answers. The API records when the student began the assessment and calculates the expiration time based on the assessment's time limit.

### Endpoint

```
POST /student-portal/assessments/{assessmentId}/start
```

### Path Parameters

| Parameter    | Type          | Description                             |
| ------------ | ------------- | --------------------------------------- |
| assessmentId | string (UUID) | The unique identifier of the assessment |

### Authentication

- JWT token required in Authorization header
- User must be authenticated as a student

### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
user-id: <user_id>
```

### Request Body

```json
{
  "assessmentId": "550e8400-e29b-41d4-a716-446655440000",
  "studentCourseId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "moduleId": "45a1e171-e020-497b-9752-235c8b721fb1"
}
```

### Request Body Fields

| Field           | Type          | Required | Description                                                          |
| --------------- | ------------- | -------- | -------------------------------------------------------------------- |
| assessmentId    | string (UUID) | **Yes**  | The assessment ID (must match path parameter)                        |
| studentCourseId | string (UUID) | **Yes**  | The student's course enrollment ID (from assessment list)            |
| moduleId        | string (UUID) | **Yes**  | The module ID where the assessment is located (from assessment list) |

### Response

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Assessment started successfully",
    "resultId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "startedAt": "2026-02-18T13:05:19.353Z",
    "timeLimit": 60,
    "expiresAt": "2026-02-18T14:05:19.353Z",
    "attemptCount": 1,
    "maxAttempts": 3,
    "remainingAttempts": 2
  },
  "message": "Assessment started successfully"
}
```

**Response Fields (Updated):**

| Field             | Type          | Description                                                                                  |
| ----------------- | ------------- | -------------------------------------------------------------------------------------------- |
| resultId          | string (UUID) | Unique identifier for this assessment attempt                                                |
| startedAt         | string (ISO)  | When the student started the assessment (UTC)                                                |
| timeLimit         | number        | Time limit in minutes                                                                        |
| expiresAt         | string (ISO)  | When the assessment will expire (startedAt + timeLimit)                                      |
| attemptCount      | number        | **NEW** Current attempt number (1 = first attempt, 2 = second attempt, etc.)                 |
| maxAttempts       | number        | Maximum allowed attempts                                                                     |
| remainingAttempts | number        | **NEW** Number of attempts remaining (maxAttempts - attemptCount)                            |
| message           | string        | Status message: "Assessment started successfully" or "Assessment already started - resuming" |

#### Error Response (403 Forbidden) - Time Limit Exceeded

```json
{
  "status": "error",
  "errorCode": "TIME_LIMIT_EXCEEDED",
  "message": "Time limit exceeded. Assessment submission rejected."
}
```

#### Error Response (403 Forbidden) - Max Attempts Exceeded

```json
{
  "status": "error",
  "errorCode": "MAX_ATTEMPTS_EXCEEDED",
  "message": "Maximum number of attempts exceeded for this assessment"
}
```

#### Error Response (404 Not Found)

```json
{
  "status": "error",
  "errorCode": "ASSESSMENT_NOT_FOUND",
  "message": "Assessment not found in this course"
}
```

### Example Request

```bash
curl -X POST \
  "http://localhost:3000/student-portal/assessments/550e8400-e29b-41d4-a716-446655440000/start" \
  -H "user-id: d8d802a5-fbb3-45fe-9709-deb2d0d579c1" \
  -H "Content-Type: application/json" \
  -d '{
    "assessmentId": "550e8400-e29b-41d4-a716-446655440000",
    "studentCourseId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "moduleId": "45a1e171-e020-497b-9752-235c8b721fb1"
  }'
```

### Important Notes

- **Required Before Submission**: For timed assessments, you must call this endpoint before submitting answers. The submission API will reject answers if the assessment hasn't been started.
- **Time Limit Enforcement**: Once started, the student must submit within the `timeLimit` minutes. Submissions after expiration will be rejected with `TIME_LIMIT_EXCEEDED` error.
- **Multiple Starts**: You can restart an assessment multiple times, which will update the `startedAt` timestamp and reset the timer.
- **Untimed Assessments**: Even for assessments without time limits, calling this endpoint is recommended to track when the student began.
- **Attempt Deduction**: Attempts are deducted when the student **starts** an assessment (not when they submit). This prevents question previewing before committing.
- **Resume Within Time**: If a student starts but hasn't submitted and the time hasn't expired, calling start again returns the same `startedAt` (free resume, no new attempt deducted).
- **Resume After Expiry**: If time has expired and the student calls start again, a new attempt is deducted (if attempts remain).

---

## Get Time Remaining

Retrieves the remaining time for an ongoing assessment. This endpoint allows students to check how much time is left before the assessment expires, along with other relevant status information like attempt count and whether the time limit has been exceeded.

### Endpoint

```
GET /student-portal/assessments/{assessmentId}/time-remaining?studentCourseId={studentCourseId}&moduleId={moduleId}
```

### Query Parameters

| Parameter       | Type          | Description                                              |
| --------------- | ------------- | -------------------------------------------------------- |
| studentCourseId | string (UUID) | The unique identifier of the student's course enrollment |
| moduleId        | string (UUID) | The unique identifier of the module                      |

### Response (200 OK)

```json
{
  "status": "success",
  "data": {
    "success": true,
    "assessmentId": "550e8400-e29b-41d4-a716-446655440000",
    "studentCourseId": "7cb05d66-c41f-4757-b185-fc337b713594",
    "moduleId": "45a1e171-e020-497b-9752-235c8b721fb1",
    "startedAt": "2026-02-18T10:30:00.000Z",
    "timeLimit": 60,
    "expiresAt": "2026-02-18T11:30:00.000Z",
    "minutesRemaining": 25,
    "secondsRemaining": 1500,
    "isExpired": false,
    "isStarted": true,
    "attemptCount": 1,
    "maxAttempts": 3
  }
}
```

### Response Fields

| Field            | Type    | Description                                                                |
| ---------------- | ------- | -------------------------------------------------------------------------- |
| assessmentId     | string  | The unique identifier of the assessment                                    |
| studentCourseId  | string  | The unique identifier of the student's course enrollment                   |
| moduleId         | string  | The unique identifier of the module                                        |
| startedAt        | string  | ISO timestamp when the assessment was started (null if not started)        |
| timeLimit        | number  | Time limit in minutes (0 for untimed)                                      |
| expiresAt        | string  | ISO timestamp when the assessment expires (null if not started or untimed) |
| minutesRemaining | number  | Minutes remaining before expiration (0 if expired/not started)             |
| secondsRemaining | number  | Seconds remaining before expiration (0 if expired/not started)             |
| isExpired        | boolean | Whether the time limit has been exceeded                                   |
| isStarted        | boolean | Whether the assessment has been started                                    |
| attemptCount     | number  | Number of attempts made so far                                             |
| maxAttempts      | number  | Maximum number of allowed attempts                                         |

### Error Response (404 Not Found)

```json
{
  "status": "error",
  "errorCode": "ASSESSMENT_NOT_FOUND",
  "message": "Assessment not found in this course"
}
```

### Error Response (401 Unauthorized)

```json
{
  "status": "error",
  "errorCode": "UNAUTHORIZED",
  "message": "Student information not found in request"
}
```

### Example Request

```bash
curl -X GET \
  "http://localhost:3000/student-portal/assessments/550e8400-e29b-41d4-a716-446655440000/time-remaining?studentCourseId=7cb05d66-c41f-4757-b185-fc337b713594&moduleId=45a1e171-e020-497b-9752-235c8b721fb1" \
  -H "Content-Type: application/json" \
  -H "user-id: 327f3737-dd00-4b75-af1a-e4cdf3d80be8"
```

### Use Cases

1. **Frontend Timer Display**: Frontend can poll this endpoint every 30-60 seconds to display a countdown timer to the student
2. **Warning Alerts**: When `minutesRemaining` drops below 5, show a warning to the student
3. **Auto-Submit**: When `isExpired` becomes true, automatically submit any unsaved answers
4. **Status Check**: Before allowing the student to view questions, verify `isStarted` is true

### Important Notes

- **Polling Recommended**: For best user experience, poll this endpoint every 30-60 seconds to keep the timer accurate
- **Server Time Authority**: Always use the server's time calculation (`minutesRemaining`, `secondsRemaining`) rather than calculating locally to avoid clock skew issues
- **Grace Period**: The API returns `isExpired: true` immediately when time expires - there's no grace period

---

## Submit Assessment Answers

Submits answers for a specific assessment in a specific module within a specific course. **Requires both `studentCourseId` and `moduleId` query parameters**.

> **Time Limit Enforcement**: This endpoint now validates that submissions are made within the assessment's time limit. If the assessment was started and the time limit has expired, the submission will be rejected with a `TIME_LIMIT_EXCEEDED` error.

### Endpoint

```
POST /student-portal/assessments/{assessmentId}/submit-answers?studentCourseId={studentCourseId}&moduleId={moduleId}
```

### Path Parameters

| Parameter    | Type          | Description                             |
| ------------ | ------------- | --------------------------------------- |
| assessmentId | string (UUID) | The unique identifier of the assessment |

### Query Parameters

| Parameter           | Type          | Required | Description                                                          |
| ------------------- | ------------- | -------- | -------------------------------------------------------------------- |
| **studentCourseId** | string (UUID) | **Yes**  | The student's course enrollment ID (from assessment list)            |
| **moduleId**        | string (UUID) | **Yes**  | The module ID where the assessment is located (from assessment list) |

### Authentication

- JWT token required in Authorization header
- User must be authenticated as a student

### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
user-id: <user_id>
```

### Request Body

For **QUIZ** assessments:

```json
{
  "answers": [
    {
      "questionId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "answer": "bf9b97c8-a156-4cf6-9caf-3b390e17f8ff"
    },
    {
      "questionId": "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
      "answer": ["2626744e-2aea-4f38-8074-0ec13ebf9e40", "484402e7-2efd-4c59-a3b3-ac65227f1f61"]
    },
    {
      "questionId": "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
      "answer": true
    }
  ]
}
```

For **ASSIGNMENT** assessments (answers must be an array of strings - URLs or file paths):

```json
{
  "answers": [
    {
      "questionId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "answer": [
        "https://storage.example.com/uploads/assignment1.pdf",
        "https://storage.example.com/uploads/assignment2.docx"
      ]
    }
  ]
}
```

**Answer Format by Question Type:**

| Question Type     | Answer Format      | Example                                     |
| ----------------- | ------------------ | ------------------------------------------- |
| `MULTIPLE_CHOICE` | string (option ID) | `"option-uuid"`                             |
| `MULTIPLE_SELECT` | array of strings   | `["opt1", "opt2"]`                          |
| `TRUE_FALSE`      | boolean            | `true` or `false`                           |
| `FILL_BLANK`      | string             | `"completed sentence"`                      |
| `SHORT_ANSWER`    | string             | `"brief answer"`                            |
| `ESSAY`           | string             | `"long text..."`                            |
| `MATCHING`        | array of objects   | `[{"leftSideId": "a", "rightSideId": "b"}]` |
| `ORDERING`        | array              | `["item3", "item1", "item2"]`               |
| `NUMERICAL_ENTRY` | object             | `{"correctValue": 42.5, "tolerance": 0.1}`  |

### Response

#### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Assessment answers submitted successfully",
  "data": {
    "success": true,
    "resultId": "6ba7b813-9dad-11d1-80b4-00c04fd430c8",
    "attemptCount": 1,
    "maxAttempts": 3,
    "remainingAttempts": 2
  }
}
```

**Response Fields:**

| Field               | Type    | Description                                                 |
| ------------------- | ------- | ----------------------------------------------------------- |
| `success`           | boolean | Indicates if submission was successful                      |
| `resultId`          | string  | Unique identifier for the submitted result                  |
| `attemptCount`      | number  | Current attempt number (1-based)                            |
| `maxAttempts`       | number  | Maximum allowed attempts configured for this assessment     |
| `remainingAttempts` | number  | Number of attempts remaining (`maxAttempts - attemptCount`) |

#### Error Response (400 Bad Request) - Missing studentCourseId

```json
{
  "status": "error",
  "errorCode": "VALIDATION_ERROR",
  "message": "Student Course ID must be a valid UUID"
}
```

#### Error Response (400 Bad Request) - Assignment Format Error

```json
{
  "status": "error",
  "errorCode": "INVALID_ASSIGNMENT_ANSWER_FORMAT",
  "message": "Assignment answers must be an array of strings"
}
```

#### Error Response (403 Forbidden) - Maximum Attempts Exceeded

Returned when the student has already used all allowed attempts for this assessment.

```json
{
  "status": "error",
  "errorCode": "FORBIDDEN",
  "message": "Maximum attempts exceeded. You have used 3 of 3 attempts."
}
```

#### Error Response (404 Not Found) - Assessment Not in Course

```json
{
  "status": "error",
  "errorCode": "ASSESSMENT_NOT_FOUND",
  "message": "Assessment not found in this course"
}
```

### Example Requests

**For a QUIZ assessment:**

```bash
curl -X POST \
  "http://localhost:3000/student-portal/assessments/550e8400-e29b-41d4-a716-446655440000/submit-answers?studentCourseId=6ba7b810-9dad-11d1-80b4-00c04fd430c8&moduleId=45a1e171-e020-497b-9752-235c8b721fb1" \
  -H "user-id: d8d802a5-fbb3-45fe-9709-deb2d0d579c1" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {
        "questionId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        "answer": "bf9b97c8-a156-4cf6-9caf-3b390e17f8ff"
      },
      {
        "questionId": "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
        "answer": [
          "2626744e-2aea-4f38-8074-0ec13ebf9e40",
          "484402e7-2efd-4c59-a3b3-ac65227f1f61"
        ]
      }
    ]
  }'
```

**For an ASSIGNMENT assessment:**

```bash
curl -X POST \
  "http://localhost:3000/student-portal/assessments/550e8400-e29b-41d4-a716-446655440001/submit-answers?studentCourseId=6ba7b810-9dad-11d1-80b4-00c04fd430c8&moduleId=45a1e171-e020-497b-9752-235c8b721fb1" \
  -H "user-id: d8d802a5-fbb3-45fe-9709-deb2d0d579c1" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {
        "questionId": "6ba7b810-9dad-11d1-80b4-00c04fd430c9",
        "answer": [
          "https://storage.example.com/uploads/assignment1.pdf",
          "https://storage.example.com/uploads/assignment2.docx"
        ]
      }
    ]
  }'
```

### Notes

- **Required Parameters**: Both `studentCourseId` and `moduleId` query parameters are **mandatory**.
- **Module Isolation**: Submissions are saved specifically for the module identified by the combination of `studentCourseId` and `moduleId`. This allows the same assessment to be submitted independently in different modules within the same course.
- **Assignment Format**: For assignments, answers must be arrays of strings (typically file URLs).
- **Quiz Format**: Quiz answers can be various formats depending on question type (see table above).
- **Validation**: The system validates the answer format based on the assessment category and question types.
- **Attempt Limiting**: The API enforces a maximum number of submission attempts as configured in the assessment (`attempts` field from the assessment list). When `attemptCount` equals `maxAttempts`, further submissions are blocked with a `403 FORBIDDEN` error. Use the `remainingAttempts` field in the response to show users how many attempts they have left.
- **Latest Submission Only**: Only the most recent submission is stored. Each new submission overwrites the previous one and increments the `attemptCount`.

---

## Get Assessment Results

Retrieves results for a specific assessment from a specific module within a specific course. **Requires both `studentCourseId` and `moduleId` query parameters**.

### Endpoint

```
GET /student-portal/assessments/{assessmentId}/results?studentCourseId={studentCourseId}&moduleId={moduleId}
```

### Path Parameters

| Parameter    | Type          | Description                             |
| ------------ | ------------- | --------------------------------------- |
| assessmentId | string (UUID) | The unique identifier of the assessment |

### Query Parameters

| Parameter           | Type          | Required | Description                                                          |
| ------------------- | ------------- | -------- | -------------------------------------------------------------------- |
| **studentCourseId** | string (UUID) | **Yes**  | The student's course enrollment ID (from assessment list)            |
| **moduleId**        | string (UUID) | **Yes**  | The module ID where the assessment is located (from assessment list) |

### Authentication

- JWT token required in Authorization header
- User must be authenticated as a student

### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
user-id: <user_id>
```

### Response

#### Success Response (200 OK) - Quiz Assessment

```json
{
  "status": "success",
  "data": {
    "id": "6ba7b813-9dad-11d1-80b4-00c04fd430c8",
    "studentCourseId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "assessmentId": "550e8400-e29b-41d4-a716-446655440000",
    "moduleId": "45a1e171-e020-497b-9752-235c8b721fb1",
    "status": "GRADED",
    "score": 45,
    "maxScore": 50,
    "percentage": 90,
    "submittedAt": "2024-03-10T14:30:00.000Z",
    "gradedAt": "2024-03-11T09:15:00.000Z",
    "answers": [
      {
        "questionId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        "answer": "bf9b97c8-a156-4cf6-9caf-3b390e17f8ff",
        "isCorrect": true,
        "points": 5,
        "earnedPoints": 5
      },
      {
        "questionId": "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
        "answer": ["opt1", "opt2"],
        "isCorrect": true,
        "points": 5,
        "earnedPoints": 5
      }
    ]
  }
}
```

#### Success Response (200 OK) - Assignment Assessment

```json
{
  "status": "success",
  "data": {
    "id": "6ba7b814-9dad-11d1-80b4-00c04fd430c8",
    "studentCourseId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "assessmentId": "550e8400-e29b-41d4-a716-446655440001",
    "status": "SUBMITTED",
    "score": null,
    "maxScore": null,
    "percentage": null,
    "submittedAt": "2024-03-10T14:30:00.000Z",
    "gradedAt": null,
    "answers": [
      {
        "questionId": "6ba7b810-9dad-11d1-80b4-00c04fd430c9",
        "answer": ["https://storage.example.com/uploads/assignment1.pdf"],
        "isCorrect": null,
        "points": null,
        "earnedPoints": null
      }
    ]
  }
}
```

#### Response Fields

| Field             | Type                      | Description                                   |
| ----------------- | ------------------------- | --------------------------------------------- |
| `id`              | string (UUID)             | Unique result ID                              |
| `studentCourseId` | string (UUID)             | The course enrollment this result belongs to  |
| `assessmentId`    | string (UUID)             | The assessment ID                             |
| `moduleId`        | string (UUID)             | The module ID                                 |
| `assessmentTitle` | string                    | Assessment title                              |
| `status`          | string                    | Result status: `SUBMITTED`, `GRADED`          |
| `score`           | number \| null            | Total score (null if not graded)              |
| `maxScore`        | number \| null            | Maximum possible score                        |
| `percentage`      | number \| null            | Score as percentage                           |
| `submittedAt`     | string (ISO date)         | When the submission was made                  |
| `gradedAt`        | string (ISO date) \| null | When the assignment was graded                |
| `startedAt`       | string (ISO date)         | When the assessment was started               |
| `attemptCount`    | number                    | Number of attempts used                       |
| `answers`         | array                     | Array of answer objects with correctness info |

#### Error Response (400 Bad Request) - Missing studentCourseId

```json
{
  "status": "error",
  "errorCode": "VALIDATION_ERROR",
  "message": "Student Course ID must be a valid UUID"
}
```

#### Error Response (404 Not Found) - No Result Found

```json
{
  "status": "success",
  "data": null
}
```

### Example Request

```bash
curl -X GET \
  "http://localhost:3000/student-portal/assessments/550e8400-e29b-41d4-a716-446655440000/results?studentCourseId=6ba7b810-9dad-11d1-80b4-00c04fd430c8&moduleId=45a1e171-e020-497b-9752-235c8b721fb1" \
  -H "user-id: d8d802a5-fbb3-45fe-9709-deb2d0d579c1" \
  -H "Content-Type: application/json"
```

### Notes

- **Required Parameters**: Both `studentCourseId` and `moduleId` query parameters are **mandatory**.
- **Module Isolation**: Results are fetched only for the specific module identified by the combination of `studentCourseId` and `moduleId`. Using a different `moduleId` will return no result, even if the assessment was submitted in a different module.
- **Quiz Results**: Include `isCorrect`, `points`, and `earnedPoints` for each answer.
- **Assignment Results**: Typically show `status: "SUBMITTED"` with `score: null` until manually graded.
- **No Result**: Returns `data: null` if the assessment has not been submitted for this course.

---

## Summary of Changes

### What's New (2026-02-25)

1. **Attempt Deduction on Start**: Attempts are now deducted when a student **starts** an assessment (not when they submit). This prevents question previewing before committing to an attempt.

2. **EXPIRED Status**: New assessment status for when a student starts but doesn't submit within the time limit. They can restart if attempts remain.

3. **New Response Fields**: All assessment endpoints now return:

   - `attemptCount` - Number of attempts used
   - `remainingAttempts` - Attempts remaining

4. **Resume Behavior**:

   - If time hasn't expired: resuming is free (no new attempt deducted)
   - If time expired: starting again deducts a new attempt (if attempts remain)

5. **Time Limit Enforcement**: New `POST /assessments/{id}/start` endpoint records when a student begins an assessment. Submissions are now validated against the time limit and rejected if expired.

6. **Module Isolation**: All assessment endpoints now support multiple modules within courses. The same assessment can exist in different modules with separate submissions and results.

7. **Required Query Parameters**: Both `studentCourseId` and `moduleId` are now **required** for:

   - `GET /assessments/{id}/questions`
   - `POST /assessments/{id}/start`
   - `POST /assessments/{id}/submit-answers`
   - `GET /assessments/{id}/results`

8. **Assessment List**: Returns assessments without deduplication. Each assessment appears once per module within each course, with its own `studentCourseId` and `moduleId`.

9. **New Response Fields**: Assessment objects now include:
   - `timeLimit` (time limit in minutes)
   - `studentCourseId` (required for subsequent calls)
   - `moduleId` (required for subsequent calls)
   - `moduleTitle` (to identify which module)
   - `sessionCourseId`
   - `courseTitle` (to identify which course)

### Migration Guide for Frontend

**Old Flow:**

```
1. GET /assessments → Get list
2. User clicks assessment
3. GET /assessments/{id}/questions → Get questions
4. POST /assessments/{id}/submit-answers → Submit
5. GET /assessments/{id}/results → Get results
```

**New Flow (with Time Limit Support):**

```
1. GET /assessments → Get list (each has studentCourseId and moduleId)
2. User clicks assessment → Save both the studentCourseId and moduleId
3. POST /assessments/{id}/start → Start assessment (records startedAt, required for timed assessments)
4. GET /assessments/{id}/questions?studentCourseId=XXX&moduleId=YYY → Get questions
5. POST /assessments/{id}/submit-answers?studentCourseId=XXX&moduleId=YYY → Submit (validates time limit)
6. GET /assessments/{id}/results?studentCourseId=XXX&moduleId=YYY → Get results
```

> **Important**: For timed assessments (where `timeLimit` is not null), Step 3 (Start Assessment) is **required**. The submission will be rejected if the assessment wasn't started or if the time limit has expired.

**Key Point:** Always use both `studentCourseId` and `moduleId` from the assessment list when making subsequent calls. This ensures proper module isolation.
