# Student Portal API Documentation - Dashboard APIs

## Base URL

All API endpoints are relative to: `http://localhost:3000`

This module provides APIs for the student dashboard in the system. Each API serves a specific function within the student portal workflow.

---

# Get Student Courses API

## Endpoint

`GET /student-portal/courses`

## Description

Retrieves a list of courses for the authenticated student. This endpoint returns all courses the student is enrolled in, along with their enrollment details and session information.

## Request

### Query Parameters

| Parameter | Type   | Required | Description                                                                                                                                   |
| --------- | ------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| status    | string | No       | Filter courses by status. Valid values are "COMPLETED" or "IN_COMPLETE". If not provided, all courses are returned.                           |
| search    | string | No       | Search courses by title. Case-insensitive partial matching is performed on the course title. If not provided, no search filtering is applied. |

### Example Request

```bash
curl -H "user-id: ace4a91e-1370-44af-be8c-d141acad9d05" "http://localhost:3000/student-portal/courses"
```

### Example Request with Status Filter

```bash
curl -H "user-id: ace4a91e-1370-44af-be8c-d141acad9d05" "http://localhost:3000/student-portal/courses?status=COMPLETED"
```

### Example Request with Search Filter

```bash
curl -H "user-id: ace4a91e-1370-44af-be8c-d141acad9d05" "http://localhost:3000/student-portal/courses?search=Computer Science"
```

### Example Request with Both Filters

```bash
curl -H "user-id: ace4a91e-1370-44af-be8c-d141acad9d05" "http://localhost:3000/student-portal/courses?status=INCOMPLETE&search=programming"
```

## Response

### Success Response

- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body

| Field                             | Type              | Description                                                                                       |
| --------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------- |
| status                            | string            | "success"                                                                                         |
| statusCode                        | number            | 200                                                                                               |
| message                           | string            | "Student courses retrieved successfully"                                                          |
| data.courses                      | array             | Array of course objects                                                                           |
| data.courses[].studentCourseId    | string            | Unique identifier of the student-course relationship                                              |
| data.courses[].sessionCourseId    | string            | Unique identifier of the session-course relationship                                              |
| data.courses[].courseType         | string            | Type of the course (e.g., "DEGREE_COURSE", "DIPLOMA_COURSE", "CPD_COURSE", "PROFESSIONAL_COURSE") |
| data.courses[].title              | string            | Title of the course                                                                               |
| data.courses[].code               | string            | Code of the course                                                                                |
| data.courses[].status             | string            | Status of the course                                                                              |
| data.courses[].courseDescription  | string            | Description of the course (optional)                                                              |
| data.courses[].studyModes         | array             | Array of study modes available for the course                                                     |
| data.courses[].durationLength     | number            | Duration length of the course                                                                     |
| data.courses[].totalCredits       | number            | Total credits for the course                                                                      |
| data.courses[].startDate          | string (datetime) | Start date of the course                                                                          |
| data.courses[].endDate            | string (datetime) | End date of the course                                                                            |
| data.courses[].sessionId          | string            | Unique identifier of the session                                                                  |
| data.courses[].sessionName        | string            | Name of the session                                                                               |
| data.courses[].sessionStartDate   | string (datetime) | Start date of the session                                                                         |
| data.courses[].sessionEndDate     | string (datetime) | End date of the session                                                                           |
| data.courses[].enrolledAt         | string (datetime) | Date when the student enrolled                                                                    |
| data.courses[].updatedAt          | string (datetime) | Date when the enrollment was last updated                                                         |
| data.courses[].progressPercentage | number            | Percentage of lessons completed in the course (0-100)                                             |
| data.courses[].totalLessons       | number            | Total number of lessons in the course                                                             |
| data.courses[].completedLessons   | number            | Number of lessons completed by the student                                                        |
| data.courses[].totalStudents      | number            | Total number of students enrolled in the course                                                   |
| data.courses[].semesterName       | string            | Name of the semester/session for the course                                                       |

### Example Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Student courses retrieved successfully",
  "data": {
    "courses": [
      {
        "studentCourseId": "7e1282a7-680a-434b-ad3d-846a5d437a1c",
        "sessionCourseId": "94a85135-0f29-46be-a0d1-098cfc069aec",
        "courseType": "DEGREE_COURSE",
        "title": "Bachelor of Science in Computer Science",
        "code": "BSC-CS-2024",
        "status": "PUBLISHED",
        "courseDescription": "A comprehensive undergraduate program covering fundamental and advanced topics in computer science, including programming, algorithms, data structures, software engineering, artificial intelligence, and cybersecurity. Students will gain practical experience through laboratory work, projects, and internships.",
        "studyModes": ["INSTRUCTOR_LED", "COHORT_BASED", "BLENDED_OR_HYBRID_LEARNING"],
        "durationLength": 3,
        "totalCredits": 360,
        "startDate": "2024-09-15T00:00:00.000Z",
        "endDate": "2027-06-30T00:00:00.000Z",
        "sessionId": "7c212546-d436-413d-afa7-03c6e14fec28",
        "sessionName": "Fall 2024 Semester",
        "sessionStartDate": "2024-09-01T00:00:00.000Z",
        "sessionEndDate": "2024-12-31T23:59:59.000Z",
        "enrolledAt": "2026-01-15T08:34:43.415Z",
        "updatedAt": "2026-01-15T07:39:54.491Z",
        "progressPercentage": 75,
        "totalLessons": 20,
        "completedLessons": 15
      }
    ]
  }
}
```

### Error Responses

| Status Code | Error Message                              | Description                                            |
| ----------- | ------------------------------------------ | ------------------------------------------------------ |
| 401         | "Student information not found in request" | When no student information is attached to the request |
| 500         | Server error messages                      | When there's an internal server error                  |

## Usage

This endpoint is used to retrieve all courses for the authenticated student. It's particularly useful when you need to:

1. Display the student's enrolled courses on the dashboard
2. Show course details including session information
3. Provide an overview of the student's academic journey
4. Allow students to navigate to their specific courses

---

# Get Dashboard Stats API

## Endpoint

`GET /student-portal/dashboard-stats`

## Description

Retrieves dashboard statistics for the authenticated student. This endpoint returns summary data for dashboard cards including enrolled courses count, average grade, overall progress percentage, and pending tasks count.

## Request

### Headers

- `user-id`: [Student UUID] (Required)

### Example Request

```bash
curl -H "user-id: ace4a91e-1370-44af-be8c-d141acad9d05" "http://localhost:3000/student-portal/dashboard-stats"
```

## Response

### Success Response

- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body

| Field                | Type   | Description                                                                 |
| -------------------- | ------ | --------------------------------------------------------------------------- |
| status               | string | "success"                                                                   |
| statusCode           | number | 200                                                                         |
| message              | string | "All Dashboard Cards retrieved successfully"                                |
| data.enrolledCourses | number | Total number of courses the student is enrolled in                          |
| data.averageGrade    | number | Average grade percentage across all graded assessments (0-100, 2 decimals)  |
| data.overallProgress | number | Overall progress percentage based on completed vs total assessments (0-100) |
| data.pendingTasks    | number | Number of assessments not yet completed                                     |

### Example Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "All Dashboard Cards retrieved successfully",
  "data": {
    "enrolledCourses": 3,
    "averageGrade": 85.5,
    "overallProgress": 42.75,
    "pendingTasks": 12
  }
}
```

### Error Responses

| Status Code | Error Message                              | Description                                            |
| ----------- | ------------------------------------------ | ------------------------------------------------------ |
| 401         | "Student information not found in request" | When no student information is attached to the request |
| 500         | Server error messages                      | When there's an internal server error                  |

## Usage

This endpoint is used to retrieve dashboard statistics for the authenticated student. It's particularly useful when you need to:

1. Display dashboard cards showing enrolled courses count
2. Show the student's average grade across all courses
3. Display overall learning progress percentage
4. Show count of pending tasks/assessments

---

# Get Upcoming Assessments API

## Endpoint

`GET /student-portal/upcoming-assessments`

## Description

Retrieves a list of upcoming assessments for the authenticated student. This endpoint returns assessments that are either:

- **AVAILABLE**: Can be started now (current date >= availableStartDate)
- **LOCKED**: Coming soon (current date < availableStartDate)

Excludes assessments that are OVERDUE, SUBMITTED, or GRADED. Results are sorted by due date (soonest first), then by available start date.

> **Important**: This API reads from the course snapshot, ensuring enrolled students see consistent assessment data even if the original templates are modified.

## Request

### Headers

- `user-id`: [Student UUID] (Required)

### Example Request

```bash
curl -H "user-id: ace4a91e-1370-44af-be8c-d141acad9d05" "http://localhost:3000/student-portal/upcoming-assessments"
```

## Response

### Success Response

- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body

| Field                                  | Type              | Description                                                 |
| -------------------------------------- | ----------------- | ----------------------------------------------------------- |
| status                                 | string            | "success"                                                   |
| statusCode                             | number            | 200                                                         |
| message                                | string            | "Upcoming assessments retrieved successfully"               |
| data.assessments                       | array             | Array of upcoming assessment objects                        |
| data.assessments[].id                  | string (UUID)     | Unique identifier of the assessment                         |
| data.assessments[].studentCourseId     | string (UUID)     | Student's enrollment ID for this course                     |
| data.assessments[].sessionCourseId     | string (UUID)     | Session course ID                                           |
| data.assessments[].moduleId            | string (UUID)     | Module unique identifier                                    |
| data.assessments[].moduleTitle         | string            | Human-readable module name                                  |
| data.assessments[].title               | string            | Title of the assessment                                     |
| data.assessments[].description         | string            | Description of the assessment (optional)                    |
| data.assessments[].dueDate             | string (datetime) | Due date of the assessment (nullable)                       |
| data.assessments[].courseId            | string (UUID)     | Unique identifier of the course                             |
| data.assessments[].courseTitle         | string            | Title of the course                                         |
| data.assessments[].assessmentCategory  | string            | Category: "QUIZ" or "ASSIGNMENT"                            |
| data.assessments[].assessmentType      | string            | Type: "DEGREE", "CPD", etc.                                 |
| data.assessments[].availableStartDate  | string (datetime) | When assessment becomes available                           |
| data.assessments[].availableEndDate    | string (datetime) | When assessment closes                                      |
| data.assessments[].timeLimit           | number            | Duration in minutes                                         |
| data.assessments[].totalPointsOrWeight | number            | Assessment weight/points                                    |
| data.assessments[].passingScore        | number            | Minimum score to pass (nullable)                            |
| data.assessments[].attempts            | number            | Number of allowed attempts (deprecated, use `maxAttempts`)  |
| data.assessments[].maxAttempts         | number            | Maximum number of allowed attempts for this assessment      |
| data.assessments[].attemptCount        | number            | Current number of attempts the student has made             |
| data.assessments[].remainingAttempts   | number            | Number of attempts remaining (`maxAttempts - attemptCount`) |
| data.assessments[].status              | string            | Template status (e.g., "PUBLISHED")                         |
| data.assessments[].assessmentStatus    | string            | Student status: "AVAILABLE" or "LOCKED"                     |

### Example Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Upcoming assessments retrieved successfully",
  "data": {
    "assessments": [
      {
        "id": "3a3b9eff-6561-4c4c-841f-ef8af73ef9a6",
        "studentCourseId": "7cb05d66-c41f-4757-b185-fc337b713594",
        "sessionCourseId": "e8ea7390-c484-41c4-bfea-77611a457914",
        "moduleId": "d6f862e3-e441-470c-ac54-57cbce60aad1",
        "moduleTitle": "Module wih assessment 4",
        "title": "Quiz Arpita",
        "description": "defhgbszrdfthgb sghsrfgythnbsrfthgbsrftg rfshsrthgnbsrtbzrthbsrhgbndfrjgn",
        "dueDate": null,
        "courseId": "70228778-a832-4080-8d33-ab4b19589178",
        "courseTitle": "Degree course with different Assessment",
        "assessmentCategory": "QUIZ",
        "assessmentType": "DEGREE",
        "availableStartDate": "2026-02-01T18:00:00.000Z",
        "availableEndDate": "2026-03-24T17:59:59.000Z",
        "timeLimit": 30,
        "totalPointsOrWeight": 30,
        "attempts": 2,
        "maxAttempts": 2,
        "attemptCount": 0,
        "remainingAttempts": 2,
        "status": "PUBLISHED",
        "assessmentStatus": "AVAILABLE"
      },
      {
        "id": "e1b3c38c-0cf4-4ced-9861-0a0b5186a5c7",
        "studentCourseId": "7cb05d66-c41f-4757-b185-fc337b713594",
        "sessionCourseId": "e8ea7390-c484-41c4-bfea-77611a457914",
        "moduleId": "b533bd6a-1a3c-4fcf-9fef-e6ba6a072e6b",
        "moduleTitle": "Module with assessment 1",
        "title": "Assignment Arpita",
        "description": "fsxfs adsva xdfbcfgg tyyyyyyyrecewfxv fhnvjujnmkni rsdfxdzqazf",
        "dueDate": null,
        "courseId": "70228778-a832-4080-8d33-ab4b19589178",
        "courseTitle": "Degree course with different Assessment",
        "assessmentCategory": "ASSIGNMENT",
        "assessmentType": "DEGREE",
        "availableStartDate": "2026-02-04T18:00:00.000Z",
        "availableEndDate": "2026-03-19T17:59:59.000Z",
        "timeLimit": 20,
        "totalPointsOrWeight": 20,
        "attempts": 1,
        "status": "PUBLISHED",
        "assessmentStatus": "AVAILABLE"
      }
    ]
  }
}
```

### Error Responses

| Status Code | Error Message                              | Description                                            |
| ----------- | ------------------------------------------ | ------------------------------------------------------ |
| 401         | "Student information not found in request" | When no student information is attached to the request |
| 500         | Server error messages                      | When there's an internal server error                  |

## Usage

This endpoint is used to retrieve upcoming assessments for the authenticated student. It's particularly useful when you need to:

1. **Dashboard Widget**: Show students their immediate upcoming tasks at a glance
2. **Study Planning**: Help students plan their study schedule with time limits and attempt counts
3. **Priority Queue**: Display assessments sorted by urgency (due date first)
4. **Quick Actions**: Provide direct access to start AVAILABLE assessments or see when LOCKED ones unlock

## Key Differences from "Get All Assessments"

| Feature        | Upcoming Assessments        | All Assessments            |
| -------------- | --------------------------- | -------------------------- |
| **Statuses**   | Only AVAILABLE & LOCKED     | All 5 statuses             |
| **Sorting**    | By due date (soonest first) | Unsorted                   |
| **Pagination** | No                          | Yes                        |
| **Use Case**   | Dashboard preview           | Full assessment management |

Use **Upcoming Assessments** for dashboard widgets and quick overviews. Use **All Assessments** when students need to browse, filter, or manage all their assessments including overdue and completed ones.

---

# Create Support Request API

## Endpoint

`POST /student-portal/support-requests`

## Description

Creates a new support request for the authenticated student. This endpoint allows students to submit support tickets for various issues related to their courses or the platform.

## Request

### Headers

- `Content-Type: application/json`

### Request Body

| Field           | Type          | Required | Description                                                                   |
| --------------- | ------------- | -------- | ----------------------------------------------------------------------------- |
| studentCourseId | string (UUID) | Yes      | The unique identifier of the student course related to the support request    |
| moduleId        | string (UUID) | No       | The unique identifier of the module related to the support request (optional) |
| subject         | string        | Yes      | The subject of the support request (1-100 characters)                         |
| message         | string        | Yes      | The support request message (1-1000 characters)                               |

### Example Request

```bash
curl -X POST -H "user-id: ace4a91e-1370-44af-be8c-d141acad9d05" -H "Content-Type: application/json" "http://localhost:3000/student-portal/support-requests" -d '{
  "studentCourseId": "7e1282a7-680a-434b-ad3d-846a5d437a1c",
  "moduleId": "12345678-1234-1234-1234-123456789abc",
  "subject": "Need help with assignment",
  "message": "Need help with my course materials"
}'
```

## Response

### Success Response

- Status Code: `201 Created`
- Content-Type: `application/json`

### Success Response Body

| Field                               | Type              | Description                                                                   |
| ----------------------------------- | ----------------- | ----------------------------------------------------------------------------- |
| status                              | string            | "success"                                                                     |
| statusCode                          | number            | 201                                                                           |
| message                             | string            | "Support request created successfully"                                        |
| data.supportRequest.id              | string            | Unique identifier of the created support request                              |
| data.supportRequest.message         | string            | The support request message                                                   |
| data.supportRequest.studentCourseId | string            | The unique identifier of the student course related to the support request    |
| data.supportRequest.moduleId        | string            | The unique identifier of the module related to the support request (optional) |
| data.supportRequest.subject         | string            | The subject of the support request                                            |
| data.supportRequest.createdAt       | string (datetime) | Creation timestamp of the support request                                     |
| data.supportRequest.updatedAt       | string (datetime) | Last update timestamp of the support request                                  |

### Example Success Response

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Support request created successfully",
  "data": {
    "supportRequest": {
      "id": "afb013a2-bc4a-4941-99ab-9bbe5f9ba99e",
      "message": "Need help with my course materials",
      "studentCourseId": "7e1282a7-680a-434b-ad3d-846a5d437a1c",
      "moduleId": "12345678-1234-1234-1234-123456789abc",
      "subject": "Need help with assignment",
      "createdAt": "2026-01-15T09:15:48.211Z",
      "updatedAt": "2026-01-15T09:15:48.211Z"
    }
  }
}
```

### Error Responses

| Status Code | Error Message                                                              | Description                                                                                                       |
| ----------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 400         | Validation error messages                                                  | When request body doesn't meet validation criteria (e.g., message too long, invalid UUID, subject too long/short) |
| 401         | "Student information not found in request"                                 | When no student information is attached to the request                                                            |
| 404         | "Student course not found or does not belong to the authenticated student" | When the student course doesn't exist or doesn't belong to the authenticated student                              |
| 500         | Server error messages                                                      | When there's an internal server error                                                                             |

## Usage

This endpoint is used to create support requests for the authenticated student. It's particularly useful when you need to:

1. Allow students to report issues with courses or the platform
2. Create a ticketing system for student support
3. Track and manage student inquiries and problems
4. Provide a way for students to get help with their academic challenges
5. Associate support requests with specific modules for better categorization

---

# Get FAQs API

## Endpoint

`GET /student-portal/faqs`

## Description

Retrieves a list of frequently asked questions (FAQs) for students. This endpoint returns commonly asked questions and their answers to help students find information without contacting support.

## Request

### Example Request

```bash
curl -H "user-id: ace4a91e-1370-44af-be8c-d141acad9d05" "http://localhost:3000/student-portal/faqs"
```

## Response

### Success Response

- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body

| Field                 | Type              | Description                      |
| --------------------- | ----------------- | -------------------------------- |
| status                | string            | "success"                        |
| statusCode            | number            | 200                              |
| message               | string            | "FAQs retrieved successfully"    |
| data.faqs             | array             | Array of FAQ objects             |
| data.faqs[].id        | string            | Unique identifier of the FAQ     |
| data.faqs[].question  | string            | The frequently asked question    |
| data.faqs[].answer    | string            | The answer to the question       |
| data.faqs[].createdAt | string (datetime) | Creation timestamp of the FAQ    |
| data.faqs[].updatedAt | string (datetime) | Last update timestamp of the FAQ |

### Example Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "FAQs retrieved successfully",
  "data": {
    "faqs": []
  }
}
```

### Error Responses

| Status Code | Error Message         | Description                           |
| ----------- | --------------------- | ------------------------------------- |
| 500         | Server error messages | When there's an internal server error |

## Usage

This endpoint is used to retrieve FAQs for students. It's particularly useful when you need to:

1. Provide students with quick answers to common questions
2. Reduce the load on support staff by offering self-service information
3. Improve the student experience by making information easily accessible
4. Maintain a knowledge base of common student inquiries
