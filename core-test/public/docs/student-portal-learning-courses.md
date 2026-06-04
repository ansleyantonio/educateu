# Student Portal API Documentation - Learning Courses APIs

## Base URL

All API endpoints are relative to: `http://localhost:3000`

This module provides APIs for managing learning courses in the student portal system. Each API serves a specific function within the student learning workflow.

---

# Get Student Course by ID API

## Endpoint

`GET /student-portal/my-learning-courses/:studentCourseId`

## Description

Retrieves detailed information about a specific student course by its unique identifier. This endpoint returns comprehensive details about the course including its structure, session information, and enrollment status.

## Request

### Path Parameters

| Parameter       | Type          | Required | Description                                             |
| --------------- | ------------- | -------- | ------------------------------------------------------- |
| studentCourseId | string (UUID) | Yes      | The unique identifier of the student course to retrieve |

### Example Request

```bash
curl -H "user-id: ace4a91e-1370-44af-be8c-d141acad9d05" "http://localhost:3000/student-portal/my-learning-courses/7e1282a7-680a-434b-ad3d-846a5d437a1c"
```

## Response

### Success Response

- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body

| Field                        | Type              | Description                                                                                       |
| ---------------------------- | ----------------- | ------------------------------------------------------------------------------------------------- |
| status                       | string            | "success"                                                                                         |
| statusCode                   | number            | 200                                                                                               |
| message                      | string            | "Student course retrieved successfully"                                                           |
| data.course.studentCourseId  | string            | Unique identifier of the student-course relationship                                              |
| data.course.courseType       | string            | Type of the course (e.g., "DEGREE_COURSE", "DIPLOMA_COURSE", "CPD_COURSE", "PROFESSIONAL_COURSE") |
| data.course.title            | string            | Title of the course                                                                               |
| data.course.code             | string            | Code of the course                                                                                |
| data.course.status           | string            | Status of the course                                                                              |
| data.course.studyModes       | array             | Array of study modes available for the course                                                     |
| data.course.durationLength   | number            | Duration length of the course                                                                     |
| data.course.totalCredits     | number            | Total credits for the course                                                                      |
| data.course.startDate        | string (datetime) | Start date of the course                                                                          |
| data.course.endDate          | string (datetime) | End date of the course                                                                            |
| data.course.sessionId        | string            | Unique identifier of the session                                                                  |
| data.course.sessionName      | string            | Name of the session                                                                               |
| data.course.sessionStartDate | string (datetime) | Start date of the session                                                                         |
| data.course.sessionEndDate   | string (datetime) | End date of the session                                                                           |
| data.course.enrolledAt       | string (datetime) | Date when the student enrolled                                                                    |
| data.course.updatedAt        | string (datetime) | Date when the enrollment was last updated                                                         |

### Example Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Student course retrieved successfully",
  "data": {
    "course": {
      "studentCourseId": "7e1282a7-680a-434b-ad3d-846a5d437a1c",
      "courseType": "DEGREE_COURSE",
      "title": "Bachelor of Science in Computer Science",
      "code": "BSC-CS-2024",
      "status": "ACTIVE",
      "studyModes": ["INSTRUCTOR_LED", "COHORT_BASED", "BLENDED_OR_HYBRID_LEARNING"],
      "durationLength": 3,
      "totalCredits": 360,
      "startDate": "2024-09-01T00:00:00.000Z",
      "endDate": "2024-12-31T23:59:59.000Z",
      "sessionId": "7c212546-d436-413d-afa7-03c6e14fec28",
      "sessionName": "Fall 2024 Semester",
      "sessionStartDate": "2024-09-01T00:00:00.000Z",
      "sessionEndDate": "2024-12-31T23:59:59.000Z",
      "enrolledAt": "2026-01-15T08:34:43.415Z",
      "updatedAt": "2026-01-15T08:43:37.344Z"
    }
  }
}
```

### Error Responses

| Status Code | Error Message                              | Description                                            |
| ----------- | ------------------------------------------ | ------------------------------------------------------ |
| 401         | "Student information not found in request" | When no student information is attached to the request |
| 404         | "Student course not found"                 | When no student course exists with the provided ID     |
| 500         | Server error messages                      | When there's an internal server error                  |

## Usage

This endpoint is used to retrieve detailed information about a specific student course. It's particularly useful when you need to:

1. Display detailed course information to the student
2. Show course structure and timeline
3. Provide enrollment status and session details
4. Access course-specific information for further operations

---

# Get Course Modules by Semester API

## Endpoint

`GET /student-portal/my-learning-courses/:studentCourseId/modules-by-semester`

## Description

Retrieves all modules for a specific student course organized by semester. This endpoint returns the course structure broken down by semesters and the modules within each semester.

## Request

### Path Parameters

| Parameter       | Type          | Required | Description                                                         |
| --------------- | ------------- | -------- | ------------------------------------------------------------------- |
| studentCourseId | string (UUID) | Yes      | The unique identifier of the student course to retrieve modules for |

### Example Request

```bash
curl -H "user-id: ace4a91e-1370-44af-be8c-d141acad9d05" "http://localhost:3000/student-portal/my-learning-courses/7e1282a7-680a-434b-ad3d-846a5d437a1c/modules-by-semester"
```

## Response

### Success Response

- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body

| Field                                           | Type   | Description                                                       |
| ----------------------------------------------- | ------ | ----------------------------------------------------------------- |
| status                                          | string | "success"                                                         |
| statusCode                                      | number | 200                                                               |
| message                                         | string | "Course modules by semester retrieved successfully"               |
| data.course.id                                  | string | Unique identifier of the course                                   |
| data.course.title                               | string | Title of the course                                               |
| data.course.code                                | string | Code of the course                                                |
| data.paidSemesters                              | object | Object with semester numbers as keys and payment status as values |
| data.semesters                                  | array  | Array of semester objects                                         |
| data.semesters[].semesterNumber                 | number | The semester number                                               |
| data.semesters[].moduleCount                    | number | Total number of modules in the semester                           |
| data.semesters[].lessonCount                    | number | Total number of lessons in the semester                           |
| data.semesters[].assessmentCount                | number | Total number of assessments in the semester                       |
| data.semesters[].modules                        | array  | Array of module objects for the semester                          |
| data.semesters[].modules[].id                   | string | Unique identifier of the module                                   |
| data.semesters[].modules[].title                | string | Title of the module                                               |
| data.semesters[].modules[].code                 | string | Code of the module                                                |
| data.semesters[].modules[].credits              | number | Credits for the module                                            |
| data.semesters[].modules[].semester             | number | The semester number the module belongs to                         |
| data.semesters[].modules[].order                | number | Order of the module within the semester                           |
| data.semesters[].modules[].prerequisites        | array  | Array of prerequisite information for the module                  |
| data.semesters[].modules[].totalLessons         | number | Total number of lessons in the module                             |
| data.semesters[].modules[].completedLessons     | number | Number of completed lessons in the module                         |
| data.semesters[].modules[].incompleteLessons    | number | Number of incomplete lessons in the module                        |
| data.semesters[].modules[].completionPercentage | number | Percentage of lessons completed (0-100)                           |

### Example Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Course modules by semester retrieved successfully",
  "data": {
    "paidSemesters": {
      "1": true,
      "2": true,
      "3": false
    },
    "course": {
      "id": "cfff0960-f344-4a34-99f2-e22fedf0bd80",
      "title": "Bachelor of Science in Computer Science",
      "code": "BSC-CS-2024"
    },
    "semesters": [
      {
        "semesterNumber": 1,
        "moduleCount": 2,
        "lessonCount": 5,
        "assessmentCount": 2,
        "modules": [
          {
            "id": "2ed30ea4-625e-40b9-be6d-837142a69b36",
            "title": "Introduction to Programming",
            "code": "CS101",
            "credits": 120,
            "semester": 1,
            "order": 1,
            "prerequisites": [],
            "totalLessons": 3,
            "completedLessons": 2,
            "incompleteLessons": 1,
            "completionPercentage": 67
          },
          {
            "id": "3d79b51a-0ce0-48c1-9af8-9bb2aa13b54c",
            "title": "Data Structures and Algorithms",
            "code": "CS201",
            "credits": 120,
            "semester": 1,
            "order": 2,
            "prerequisites": [],
            "totalLessons": 2,
            "completedLessons": 0,
            "incompleteLessons": 2,
            "completionPercentage": 0
          }
        ]
      },
      {
        "semesterNumber": 2,
        "moduleCount": 1,
        "lessonCount": 4,
        "assessmentCount": 1,
        "modules": [
          {
            "id": "f99e3198-258e-4e9a-95a4-2e28fe278cf6",
            "title": "Database Systems",
            "code": "CS301",
            "credits": 120,
            "semester": 2,
            "order": 1,
            "prerequisites": [],
            "totalLessons": 4,
            "completedLessons": 4,
            "incompleteLessons": 0,
            "completionPercentage": 100
          }
        ]
      }
    ]
  }
}
```

### Error Responses

| Status Code | Error Message                              | Description                                            |
| ----------- | ------------------------------------------ | ------------------------------------------------------ |
| 401         | "Student information not found in request" | When no student information is attached to the request |
| 404         | "Student course not found"                 | When no student course exists with the provided ID     |
| 500         | Server error messages                      | When there's an internal server error                  |

## Usage

This endpoint is used to retrieve course modules organized by semester. It's particularly useful when you need to:

1. Display the course structure to students
2. Show modules organized by semester for better planning
3. Provide an overview of the academic progression
4. Allow students to navigate to specific modules within semesters

---

# Get Module Contents API

## Endpoint

`GET /student-portal/my-learning-courses/:studentCourseId/modules/:moduleId/contents`

## Description

Retrieves all contents (lessons and assessments) for a specific module within a student course. This endpoint returns the learning materials available for the module including lessons, videos, documents, and assessments.

## Request

### Path Parameters

| Parameter       | Type          | Required | Description                                                  |
| --------------- | ------------- | -------- | ------------------------------------------------------------ |
| studentCourseId | string (UUID) | Yes      | The unique identifier of the student course                  |
| moduleId        | string (UUID) | Yes      | The unique identifier of the module to retrieve contents for |

### Example Request

```bash
curl -H "user-id: ace4a91e-1370-44af-be8c-d141acad9d05" "http://localhost:3000/student-portal/my-learning-courses/7e1282a7-680a-434b-ad3d-846a5d437a1c/modules/2ed30ea4-625e-40b9-be6d-837142a69b36/contents"
```

## Response

### Success Response

- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body

| Field                                         | Type              | Description                                                                              |
| --------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------- |
| success                                       | boolean           | true                                                                                     |
| message                                       | string            | "Module contents retrieved successfully"                                                 |
| data.module.id                                | string            | Unique identifier of the module                                                          |
| data.module.title                             | string            | Title of the module                                                                      |
| data.module.code                              | string            | Code of the module                                                                       |
| data.module.isCompleted                       | boolean           | true if all lessons in the module are completed                                          |
| data.module.completedLessons                  | number            | Number of completed lessons in the module                                                |
| data.module.totalLessons                      | number            | Total number of lessons in the module                                                    |
| data.lessons                                  | array             | Array of lesson objects                                                                  |
| data.lessons[].id                             | string            | Unique identifier of the lesson                                                          |
| data.lessons[].title                          | string            | Title of the lesson                                                                      |
| data.lessons[].isCompleted                    | boolean           | true if all contents in the lesson are completed                                         |
| data.lessons[].completedContents              | number            | Number of completed contents in the lesson                                               |
| data.lessons[].totalContents                  | number            | Total number of contents in the lesson                                                   |
| data.lessons[].contents                       | array             | Array of content objects                                                                 |
| data.lessons[].contents[].id                  | string            | Unique identifier of the content                                                         |
| data.lessons[].contents[].title               | string            | Title of the content                                                                     |
| data.lessons[].contents[].type                | string            | Type of the content ("LESSON" or "ASSESSMENT")                                           |
| data.lessons[].contents[].contentType         | string            | Type of content (e.g., "DEGREE", "DIPLOMA", "CPD", "PROFESSIONAL")                       |
| data.lessons[].contents[].lessonContentType   | string            | Type of lesson content (e.g., "VIDEO", "PDF", "TEXT", "IMAGE", "AUDIO", "HTML", "OTHER") |
| data.lessons[].contents[].assessmentType      | string            | Type of assessment (e.g., "QUIZ", "ASSIGNMENT", "EXAM", "PROJECT", "PRACTICAL", "OTHER") |
| data.lessons[].contents[].description         | string            | Description of the content (optional)                                                    |
| data.lessons[].contents[].duration            | number            | Duration of the content in minutes (optional)                                            |
| data.lessons[].contents[].fileSize            | number            | Size of the content file in bytes (optional)                                             |
| data.lessons[].contents[].paths               | array             | Array of file paths for the content (optional)                                           |
| data.lessons[].contents[].isCompleted         | boolean           | true if the content has been completed by the student                                    |
| data.lessons[].contents[].lastPosition        | number            | Video playback position in seconds (only for VIDEO content type, 0 if not set)           |
| data.lessons[].contents[].dueDate             | string (datetime) | Due date for assessments (optional)                                                      |
| data.lessons[].contents[].passingScore        | number            | Minimum score required to pass assessments (optional)                                    |
| data.lessons[].contents[].totalPointsOrWeight | number            | Total points for the assessment (optional)                                               |
| data.lessons[].contents[].questionSize        | number            | Number of questions in the assessment (optional)                                         |

### Example Success Response

```json
{
  "success": true,
  "message": "Module contents retrieved successfully",
  "data": {
    "module": {
      "id": "2ed30ea4-625e-40b9-be6d-837142a69b36",
      "title": "Introduction to Programming",
      "code": "CS101",
      "isCompleted": false,
      "completedLessons": 1,
      "totalLessons": 2
    },
    "lessons": [
      {
        "id": "d30b3078-d471-4baa-b693-b197c8171493",
        "title": "Variables and Data Types",
        "isCompleted": true,
        "completedContents": 3,
        "totalContents": 3,
        "contents": [
          {
            "id": "5ecccc4b-4fce-45bf-a1f2-48c38087071c",
            "title": "Variables and Data Types",
            "type": "LESSON",
            "contentType": "lesson",
            "lessonContentType": "VIDEO",
            "description": "Students will understand variables and different data types in programming",
            "duration": 40,
            "paths": ["/content/variables-and-data-types.mp4"],
            "isCompleted": true,
            "lastPosition": 125
          },
          {
            "id": "18e4189a-0d9e-47f9-a42c-ce387fe4cfec",
            "title": "Variables and Data Types - PDF Notes",
            "type": "LESSON",
            "contentType": "lesson",
            "lessonContentType": "PDF",
            "description": "PDF notes for variables and data types",
            "duration": 20,
            "paths": ["/content/variables-and-data-types.pdf"],
            "isCompleted": true
          },
          {
            "id": "7499c4de-2dfd-4569-b5b8-d3f305e66792",
            "title": "Variables and Data Types - Quiz",
            "type": "LESSON",
            "contentType": "lesson",
            "lessonContentType": "TEXT",
            "description": "Practice quiz for variables and data types",
            "duration": 15,
            "paths": [],
            "isCompleted": true
          }
        ]
      },
      {
        "id": "5d3b02bc-e858-4e90-a4b4-acb5a42a66f6",
        "title": "Control Structures",
        "isCompleted": false,
        "completedContents": 1,
        "totalContents": 3,
        "contents": [
          {
            "id": "08133252-0e6b-4b8c-bb91-10c9dc9d2638",
            "title": "Control Structures",
            "type": "LESSON",
            "contentType": "lesson",
            "lessonContentType": "VIDEO",
            "description": "Students will understand conditional statements and loops in programming",
            "duration": 40,
            "paths": ["/content/control-structures.mp4"],
            "isCompleted": true,
            "lastPosition": 0
          },
          {
            "id": "3ec00914-9f7b-4dfb-b0b4-c1e774efbdbd",
            "title": "Control Structures - PDF Notes",
            "type": "LESSON",
            "contentType": "lesson",
            "lessonContentType": "PDF",
            "description": "PDF notes for control structures",
            "duration": 20,
            "paths": ["/content/control-structures.pdf"],
            "isCompleted": false
          },
          {
            "id": "7724aba5-ded8-4847-a76b-6defd08b6d4c",
            "title": "Control Structures - Quiz",
            "type": "LESSON",
            "contentType": "lesson",
            "lessonContentType": "TEXT",
            "description": "Practice quiz for control structures",
            "duration": 15,
            "paths": [],
            "isCompleted": false
          }
        ]
      }
    ]
  }
}
```

### Error Responses

| Status Code | Error Message                              | Description                                            |
| ----------- | ------------------------------------------ | ------------------------------------------------------ |
| 401         | "Student information not found in request" | When no student information is attached to the request |
| 404         | "Student course not found"                 | When no student course exists with the provided ID     |
| 404         | "Module not found"                         | When no module exists with the provided ID             |
| 500         | Server error messages                      | When there's an internal server error                  |

## Usage

This endpoint is used to retrieve module contents for a student course. It's particularly useful when you need to:

1. Display learning materials for a specific module
2. Show lessons and assessments available to the student
3. Provide access to course content organized by module
4. Enable students to navigate through course materials

---

# Create Lesson Note API

## Endpoint

`POST /student-portal/my-learning-courses/:studentCourseId/modules/:moduleId/lesson-notes`

## Description

Creates a new lesson note for a specific lesson within a module of a student course. This endpoint allows students to take notes on specific lessons for future reference.

## Request

### Headers

- `Content-Type: application/json`

### Path Parameters

| Parameter       | Type          | Required | Description                                 |
| --------------- | ------------- | -------- | ------------------------------------------- |
| studentCourseId | string (UUID) | Yes      | The unique identifier of the student course |
| moduleId        | string (UUID) | Yes      | The unique identifier of the module         |

### Request Body

| Field     | Type          | Required | Description                                                |
| --------- | ------------- | -------- | ---------------------------------------------------------- |
| lessonId  | string (UUID) | Yes      | The unique identifier of the lesson to create a note for   |
| note      | string        | Yes      | The note content (1-5000 characters)                       |
| timestamp | number        | No       | Optional timestamp for video content (non-negative number) |

### Example Request

```bash
curl -X POST -H "user-id: ace4a91e-1370-44af-be8c-d141acad9d05" -H "Content-Type: application/json" "http://localhost:3000/student-portal/my-learning-courses/7e1282a7-680a-434b-ad3d-846a5d437a1c/modules/2ed30ea4-625e-40b9-be6d-837142a69b36/lesson-notes" -d '{
  "lessonId": "5ecccc4b-4fce-45bf-a1f2-48c38087071c",
  "note": "This is a sample lesson note",
  "timestamp": 120
}'
```

## Response

### Success Response

- Status Code: `201 Created`
- Content-Type: `application/json`

### Success Response Body

| Field                     | Type              | Description                                         |
| ------------------------- | ----------------- | --------------------------------------------------- |
| status                    | string            | "success"                                           |
| statusCode                | number            | 201                                                 |
| message                   | string            | "Lesson note created successfully"                  |
| data.success              | boolean           | Indicates if the operation was successful           |
| data.message              | string            | Confirmation message                                |
| data.lessonNote.id        | string            | Unique identifier of the created lesson note        |
| data.lessonNote.lessonId  | string            | The unique identifier of the lesson the note is for |
| data.lessonNote.note      | string            | The content of the note                             |
| data.lessonNote.timestamp | number            | Timestamp for video content (if provided)           |
| data.lessonNote.createdAt | string (datetime) | Creation timestamp of the lesson note               |

### Example Success Response

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Lesson note created successfully",
  "data": {
    "success": true,
    "message": "Lesson note created successfully",
    "lessonNote": {
      "id": "6e537b51-09b0-4891-9fad-a5399fa28cf4",
      "lessonId": "5ecccc4b-4fce-45bf-a1f2-48c38087071c",
      "note": "This is a sample lesson note",
      "timestamp": 120,
      "createdAt": "2026-01-15T09:16:24.620Z"
    }
  }
}
```

### Error Responses

| Status Code | Error Message                              | Description                                                                            |
| ----------- | ------------------------------------------ | -------------------------------------------------------------------------------------- |
| 400         | Validation error messages                  | When request body doesn't meet validation criteria (e.g., note too long, invalid UUID) |
| 401         | "Student information not found in request" | When no student information is attached to the request                                 |
| 404         | "Student course not found"                 | When no student course exists with the provided ID                                     |
| 404         | "Module not found"                         | When no module exists with the provided ID                                             |
| 404         | "Lesson not found"                         | When no lesson exists with the provided ID                                             |
| 500         | Server error messages                      | When there's an internal server error                                                  |

## Usage

This endpoint is used to create lesson notes for students. It's particularly useful when you need to:

1. Allow students to take notes on specific lessons
2. Store student annotations for future reference
3. Enable timestamped notes for video content
4. Provide a personal learning aid for students

---

# Get Lesson Notes API

## Endpoint

`GET /student-portal/my-learning-courses/:studentCourseId/lesson-notes`

## Description

Retrieves all lesson notes for a specific student course, optionally filtered by lesson ID. This endpoint returns the notes the student has taken for lessons within the course.

## Request

### Path Parameters

| Parameter       | Type          | Required | Description                                                       |
| --------------- | ------------- | -------- | ----------------------------------------------------------------- |
| studentCourseId | string (UUID) | Yes      | The unique identifier of the student course to retrieve notes for |

### Query Parameters

| Parameter | Type          | Required | Description                                                  |
| --------- | ------------- | -------- | ------------------------------------------------------------ |
| lessonId  | string (UUID) | No       | Optional filter to retrieve notes for a specific lesson only |

### Example Request

```bash
curl -H "user-id: ace4a91e-1370-44af-be8c-d141acad9d05" "http://localhost:3000/student-portal/my-learning-courses/7e1282a7-680a-434b-ad3d-846a5d437a1c/lesson-notes?lessonId=5ecccc4b-4fce-45bf-a1f2-48c38087071c"
```

## Response

### Success Response

- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body

| Field                        | Type              | Description                                         |
| ---------------------------- | ----------------- | --------------------------------------------------- |
| status                       | string            | "success"                                           |
| statusCode                   | number            | 200                                                 |
| message                      | string            | "Lesson notes retrieved successfully"               |
| data.lessonNotes             | array             | Array of lesson note objects                        |
| data.lessonNotes[].id        | string            | Unique identifier of the lesson note                |
| data.lessonNotes[].lessonId  | string            | The unique identifier of the lesson the note is for |
| data.lessonNotes[].note      | string            | The content of the note                             |
| data.lessonNotes[].timestamp | number            | Timestamp for video content (if provided)           |
| data.lessonNotes[].createdAt | string (datetime) | Creation timestamp of the lesson note               |

### Example Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Lesson notes retrieved successfully",
  "data": {
    "lessonNotes": [
      {
        "id": "b28bf0cd-f59e-49b1-8110-43498a93afb5",
        "lessonId": "5ecccc4b-4fce-45bf-a1f2-48c38087071c",
        "note": "This is a test lesson note about variables and data types.",
        "createdAt": "2026-01-15T08:43:37.343Z"
      },
      {
        "id": "850d5610-b98b-4c7c-a559-97fa941ee134",
        "lessonId": "5ecccc4b-4fce-45bf-a1f2-48c38087071c",
        "note": "This is a comprehensive test lesson note about variables and data types.",
        "createdAt": "2026-01-15T08:59:50.836Z"
      },
      {
        "id": "6e537b51-09b0-4891-9fad-a5399fa28cf4",
        "lessonId": "5ecccc4b-4fce-45bf-a1f2-48c38087071c",
        "note": "This is a sample lesson note",
        "timestamp": 120,
        "createdAt": "2026-01-15T09:16:24.620Z"
      }
    ]
  }
}
```

### Error Responses

| Status Code | Error Message                              | Description                                            |
| ----------- | ------------------------------------------ | ------------------------------------------------------ |
| 401         | "Student information not found in request" | When no student information is attached to the request |
| 404         | "Student course not found"                 | When no student course exists with the provided ID     |
| 500         | Server error messages                      | When there's an internal server error                  |

## Usage

This endpoint is used to retrieve lesson notes for a student course. It's particularly useful when you need to:

1. Display all notes a student has taken for a course
2. Filter notes by specific lessons
3. Allow students to review their personal annotations
4. Provide access to student-created learning aids

---

# Update Lesson Note API

## Endpoint

`PATCH /student-portal/my-learning-courses/:studentCourseId/lesson-notes/:noteId`

## Description

Updates an existing lesson note for a specific student course. This endpoint allows students to modify the content and timestamp of their previously created lesson notes.

## Request

### Headers

- `Content-Type: application/json`

### Path Parameters

| Parameter       | Type          | Required | Description                                        |
| --------------- | ------------- | -------- | -------------------------------------------------- |
| studentCourseId | string (UUID) | Yes      | The unique identifier of the student course        |
| noteId          | string (UUID) | Yes      | The unique identifier of the lesson note to update |

### Request Body

| Field     | Type   | Required | Description                                                |
| --------- | ------ | -------- | ---------------------------------------------------------- |
| note      | string | Yes      | The updated note content (1-5000 characters)               |
| timestamp | number | No       | Optional timestamp for video content (non-negative number) |

### Example Request

```bash
curl -X PATCH -H "user-id: ace4a91e-1370-44af-be8c-d141acad9d05" -H "Content-Type: application/json" "http://localhost:3000/student-portal/my-learning-courses/7e1282a7-680a-434b-ad3d-846a5d437a1c/lesson-notes/b28bf0cd-f59e-49b1-8110-43498a93afb5" -d '{
  "note": "This is the updated lesson note content",
  "timestamp": 150
}'
```

## Response

### Success Response

- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body

| Field                     | Type              | Description                                         |
| ------------------------- | ----------------- | --------------------------------------------------- |
| status                    | string            | "success"                                           |
| statusCode                | number            | 200                                                 |
| message                   | string            | "Lesson note updated successfully"                  |
| data.success              | boolean           | Indicates if the operation was successful           |
| data.message              | string            | Confirmation message                                |
| data.lessonNote.id        | string            | Unique identifier of the updated lesson note        |
| data.lessonNote.lessonId  | string            | The unique identifier of the lesson the note is for |
| data.lessonNote.note      | string            | The updated content of the note                     |
| data.lessonNote.timestamp | number            | Timestamp for video content (if provided)           |
| data.lessonNote.createdAt | string (datetime) | Original creation timestamp of the lesson note      |
| data.lessonNote.updatedAt | string (datetime) | Timestamp when the note was last updated            |

### Example Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Lesson note updated successfully",
  "data": {
    "success": true,
    "message": "Lesson note updated successfully",
    "lessonNote": {
      "id": "b28bf0cd-f59e-49b1-8110-43498a93afb5",
      "lessonId": "5ecccc4b-4fce-45bf-a1f2-48c38087071c",
      "note": "This is the updated lesson note content",
      "timestamp": 150,
      "createdAt": "2026-01-15T08:43:37.343Z",
      "updatedAt": "2026-01-15T10:30:00.000Z"
    }
  }
}
```

### Error Responses

| Status Code | Error Code               | Description                                                                            |
| ----------- | ------------------------ | -------------------------------------------------------------------------------------- |
| 400         | BAD_REQUEST              | When request body doesn't meet validation criteria (e.g., note too long, invalid UUID) |
| 401         | UNAUTHORIZED             | When no student information is attached to the request                                 |
| 403         | UNAUTHORIZED             | When student tries to update a note they don't own                                     |
| 404         | STUDENT_COURSE_NOT_FOUND | When no student course exists with the provided ID                                     |
| 404         | NOTE_NOT_FOUND           | When no note exists with the provided ID                                               |
| 500         | Server error             | When there's an internal server error                                                  |

## Usage

This endpoint is used to update existing lesson notes for students. It's particularly useful when you need to:

1. Allow students to edit their previously created notes
2. Update timestamps for video content
3. Correct or expand on existing notes
4. Maintain a history of note revisions (via updatedAt timestamp)

---

# Get Course Progress API

## Endpoint

`GET /student-portal/course-progress`

## Description

Retrieves course progress information for the authenticated student across all enrolled courses, including quiz and assignment completion status. This endpoint returns detailed progress data showing how many quizzes and assignments have been completed versus the total number available.

## Request

### Headers

- `user-id`: [Student UUID] (Required)

### Example Request

```bash
curl -H "user-id: ace4a91e-1370-44af-be8c-d141acad9d05" "http://localhost:3000/student-portal/course-progress"
```

## Response

### Success Response

- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body

| Field                                        | Type   | Description                                                |
| -------------------------------------------- | ------ | ---------------------------------------------------------- |
| status                                       | string | "success"                                                  |
| statusCode                                   | number | 200                                                        |
| message                                      | string | "Course progress retrieved successfully"                   |
| data.progress                                | array  | Array of progress objects for each course                  |
| data.progress[].studentCourseId              | string | Unique identifier of the student course enrollment         |
| data.progress[].sessionCourseId              | string | Unique identifier of the session course                    |
| data.progress[].courseTitle                  | string | Title of the course                                        |
| data.progress[].quizProgress.completed       | number | Number of quizzes completed                                |
| data.progress[].quizProgress.total           | number | Total number of quizzes in the course                      |
| data.progress[].quizProgress.progress        | string | Progress string in format "completed/total" (e.g., "2/10") |
| data.progress[].assignmentProgress.completed | number | Number of assignments completed                            |
| data.progress[].assignmentProgress.total     | number | Total number of assignments in the course                  |
| data.progress[].assignmentProgress.progress  | string | Progress string in format "completed/total" (e.g., "3/10") |
| data.progress[].overallProgress.completed    | number | Total completed assessments (quizzes + assignments)        |
| data.progress[].overallProgress.total        | number | Total assessments (quizzes + assignments) in the course    |
| data.progress[].overallProgress.percentage   | number | Overall completion percentage (0-100)                      |

### Example Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Course progress retrieved successfully",
  "data": {
    "progress": [
      {
        "studentCourseId": "7cb05d66-c41f-4757-b185-fc337b713594",
        "sessionCourseId": "e8ea7390-c484-41c4-bfea-77611a457914",
        "courseTitle": "Degree course with different Assessment",
        "quizProgress": {
          "completed": 1,
          "total": 3,
          "progress": "1/3"
        },
        "assignmentProgress": {
          "completed": 1,
          "total": 2,
          "progress": "1/2"
        },
        "overallProgress": {
          "completed": 2,
          "total": 5,
          "percentage": 40
        }
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

This endpoint is used to retrieve course progress for the authenticated student across all enrolled courses. It's particularly useful when you need to:

1. Display overall progress for all courses
2. Show quiz completion status (e.g., "5/8")
3. Show assignment completion status (e.g., "3/5")
4. Provide a comprehensive view of student progress across all courses

---

# Get Individual Course Progress API

## Endpoint

`GET /student-portal/course-progress/:studentCourseId`

## Description

Retrieves course progress information for a specific course by student course ID. This endpoint returns detailed progress data for a single course including quiz and assignment completion status.

## Request

### Headers

- `user-id`: [Student UUID] (Required)

### Path Parameters

| Parameter       | Type          | Required | Description                                 |
| --------------- | ------------- | -------- | ------------------------------------------- |
| studentCourseId | string (UUID) | Yes      | The unique identifier of the student course |

### Example Request

```bash
curl -H "user-id: ace4a91e-1370-44af-be8c-d141acad9d05" "http://localhost:3000/student-portal/course-progress/7cb05d66-c41f-4757-b185-fc337b713594"
```

## Response

### Success Response

- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body

| Field                             | Type   | Description                                                |
| --------------------------------- | ------ | ---------------------------------------------------------- |
| status                            | string | "success"                                                  |
| statusCode                        | number | 200                                                        |
| message                           | string | "Course progress retrieved successfully"                   |
| data.studentCourseId              | string | Unique identifier of the student course enrollment         |
| data.sessionCourseId              | string | Unique identifier of the session course                    |
| data.courseTitle                  | string | Title of the course                                        |
| data.quizProgress.completed       | number | Number of quizzes completed                                |
| data.quizProgress.total           | number | Total number of quizzes in the course                      |
| data.quizProgress.progress        | string | Progress string in format "completed/total" (e.g., "2/10") |
| data.assignmentProgress.completed | number | Number of assignments completed                            |
| data.assignmentProgress.total     | number | Total number of assignments in the course                  |
| data.assignmentProgress.progress  | string | Progress string in format "completed/total" (e.g., "3/10") |
| data.overallProgress.completed    | number | Total completed assessments (quizzes + assignments)        |
| data.overallProgress.total        | number | Total assessments (quizzes + assignments) in the course    |
| data.overallProgress.percentage   | number | Overall completion percentage (0-100)                      |

### Example Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Course progress retrieved successfully",
  "data": {
    "studentCourseId": "7cb05d66-c41f-4757-b185-fc337b713594",
    "sessionCourseId": "e8ea7390-c484-41c4-bfea-77611a457914",
    "courseTitle": "Degree course with different Assessment",
    "quizProgress": {
      "completed": 1,
      "total": 3,
      "progress": "1/3"
    },
    "assignmentProgress": {
      "completed": 1,
      "total": 2,
      "progress": "1/2"
    },
    "overallProgress": {
      "completed": 2,
      "total": 5,
      "percentage": 40
    }
  }
}
```

### Error Responses

| Status Code | Error Code   | Error Message                              | Description                                              |
| ----------- | ------------ | ------------------------------------------ | -------------------------------------------------------- |
| 400         | BAD_REQUEST  | Validation error messages                  | When studentCourseId is not a valid UUID                 |
| 401         | UNAUTHORIZED | "Student information not found in request" | When no student information is attached to the request   |
| 404         | NOT_FOUND    | "Course not found"                         | When the course is not found or not owned by the student |
| 500         | Server error | Server error messages                      | When there's an internal server error                    |

## Usage

This endpoint is used to retrieve progress for a specific course. It's particularly useful when you need to:

1. Display detailed progress for a single course
2. Show quiz and assignment completion status for a specific course
3. Navigate to a specific course's progress page
4. Provide course-specific progress information in the student portal

---

# Complete Content API

## Endpoint

`POST /student-portal/my-learning-courses/:studentCourseId/contents/:contentId/complete`

## Description

Marks a specific content (video, PDF, etc.) as completed for the authenticated student. This endpoint automatically tracks completion at the content, lesson, and module level through a cascade mechanism.

**Cascade Logic:**

1. Marks the content as completed
2. If all contents in a lesson are completed → lesson is automatically marked as completed
3. If all lessons in a module are completed → module is automatically marked as completed

## Request

### Headers

- `user-id`: [Student UUID] (Required)
- `Content-Type: application/json`

### Path Parameters

| Parameter       | Type          | Required | Description                                               |
| --------------- | ------------- | -------- | --------------------------------------------------------- |
| studentCourseId | string (UUID) | Yes      | The unique identifier of the student course               |
| contentId       | string (UUID) | Yes      | The unique identifier of the content to mark as completed |

### Example Request

```bash
curl -X POST -H "user-id: ace4a91e-1370-44af-be8c-d141acad9d05" "http://localhost:3000/student-portal/my-learning-courses/7e1282a7-680a-434b-ad3d-846a5d437a1c/contents/5ecccc4b-4fce-45bf-a1f2-48c38087071c/complete"
```

## Response

### Success Response

- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body

| Field                                   | Type              | Description                                                  |
| --------------------------------------- | ----------------- | ------------------------------------------------------------ |
| success                                 | boolean           | true                                                         |
| message                                 | string            | "Content marked as complete"                                 |
| data.contentId                          | string            | Unique identifier of the completed content                   |
| data.isCompleted                        | boolean           | true (always true after successful completion)               |
| data.completedAt                        | string (datetime) | Timestamp when the content was marked complete               |
| data.lessonCompletion                   | object            | Lesson completion status after this content completion       |
| data.lessonCompletion.lessonId          | string            | Unique identifier of the parent lesson                       |
| data.lessonCompletion.isCompleted       | boolean           | true if all contents in lesson are completed                 |
| data.lessonCompletion.completedContents | number            | Number of completed contents in this lesson                  |
| data.lessonCompletion.totalContents     | number            | Total number of contents in this lesson                      |
| data.moduleCompletion                   | object            | Module completion status (only if lesson was just completed) |
| data.moduleCompletion.moduleId          | string            | Unique identifier of the parent module                       |
| data.moduleCompletion.isCompleted       | boolean           | true if all lessons in module are completed                  |
| data.moduleCompletion.completedLessons  | number            | Number of completed lessons in this module                   |
| data.moduleCompletion.totalLessons      | number            | Total number of lessons in this module                       |

### Example Success Response

```json
{
  "success": true,
  "message": "Content marked as complete",
  "data": {
    "contentId": "5ecccc4b-4fce-45bf-a1f2-48c38087071c",
    "isCompleted": true,
    "completedAt": "2026-02-20T10:30:00.000Z",
    "lessonCompletion": {
      "lessonId": "d30b3078-d471-4baa-b693-b197c8171493",
      "isCompleted": false,
      "completedContents": 2,
      "totalContents": 3
    }
  }
}
```

### Example Success Response (with Module Completion Cascade)

```json
{
  "success": true,
  "message": "Content marked as complete",
  "data": {
    "contentId": "7724aba5-ded8-4847-a76b-6defd08b6d4c",
    "isCompleted": true,
    "completedAt": "2026-02-20T10:35:00.000Z",
    "lessonCompletion": {
      "lessonId": "5d3b02bc-e858-4e90-a4b4-acb5a42a66f6",
      "isCompleted": true,
      "completedContents": 3,
      "totalContents": 3
    },
    "moduleCompletion": {
      "moduleId": "4d815d07-5e4d-4599-bc0e-a5493cadc635",
      "isCompleted": true,
      "completedLessons": 2,
      "totalLessons": 2
    }
  }
}
```

### Error Responses

| Status Code | Error Code                  | Description                                            |
| ----------- | --------------------------- | ------------------------------------------------------ |
| 400         | BAD_REQUEST                 | Invalid UUID format for studentCourseId or contentId   |
| 401         | UNAUTHORIZED                | When no student information is attached to the request |
| 404         | STUDENT_COURSE_NOT_FOUND    | When no student course exists with the provided ID     |
| 404         | CONTENT_NOT_FOUND_IN_COURSE | When content is not found in student's course snapshot |
| 500         | INTERNAL_SERVER_ERROR       | When there's an internal server error                  |

## Usage

This endpoint is used to mark content as completed by students. It's particularly useful when you need to:

1. Track student progress at granular content level (videos, PDFs, etc.)
2. Automatically cascade completion status to lesson and module levels
3. Provide accurate progress tracking across the entire course
4. Enable students to indicate they have finished studying specific content

---

# Save Video Position API

## Endpoint

`PATCH /student-portal/my-learning-courses/:studentCourseId/contents/:contentId/video-position`

## Description

Saves the video playback position for a specific video content. This allows students to resume watching videos from where they left off. The position is stored per student per content, enabling the "continue watching" feature.

**Note:** This endpoint only works for VIDEO content types. Attempting to save position for PDF, text, or other non-video content will return an error.

## Request

### Headers

- `user-id`: [Student UUID] (Required)
- `Content-Type: application/json`

### Path Parameters

| Parameter       | Type          | Required | Description                                 |
| --------------- | ------------- | -------- | ------------------------------------------- |
| studentCourseId | string (UUID) | Yes      | The unique identifier of the student course |
| contentId       | string (UUID) | Yes      | The unique identifier of the video content  |

### Request Body

| Field    | Type         | Required | Description                              |
| -------- | ------------ | -------- | ---------------------------------------- |
| position | number (int) | Yes      | Video position in seconds (non-negative) |

### Example Request

```bash
curl -X PATCH -H "user-id: ace4a91e-1370-44af-be8c-d141acad9d05" -H "Content-Type: application/json" "http://localhost:3000/student-portal/my-learning-courses/7e1282a7-680a-434b-ad3d-846a5d437a1c/contents/5ecccc4b-4fce-45bf-a1f2-48c38087071c/video-position" -d '{
  "position": 125
}'
```

## Response

### Success Response

- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body

| Field             | Type   | Description                         |
| ----------------- | ------ | ----------------------------------- |
| status            | string | "success"                           |
| statusCode        | number | 200                                 |
| message           | string | "Video position saved successfully" |
| data.contentId    | string | The content ID that was updated     |
| data.lastPosition | number | The saved position in seconds       |

### Example Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Video position saved successfully",
  "data": {
    "contentId": "5ecccc4b-4fce-45bf-a1f2-48c38087071c",
    "lastPosition": 125
  }
}
```

### Error Responses

| Status Code | Error Code                  | Description                                                               |
| ----------- | --------------------------- | ------------------------------------------------------------------------- |
| 400         | BAD_REQUEST                 | Invalid UUID format for studentCourseId or contentId, or invalid position |
| 400         | INVALID_CONTENT_TYPE        | When the content is not a VIDEO type                                      |
| 401         | UNAUTHORIZED                | When no student information is attached to the request                    |
| 404         | STUDENT_COURSE_NOT_FOUND    | When no student course exists with the provided ID                        |
| 404         | CONTENT_NOT_FOUND_IN_COURSE | When content is not found in student's course snapshot                    |
| 500         | INTERNAL_SERVER_ERROR       | When there's an internal server error                                     |

## Usage

This endpoint is used to enable the "continue watching" feature for video content. It's particularly useful when you need to:

1. Save video playback position periodically (e.g., every 5 seconds)
2. Save position when user pauses the video
3. Restore video position when user returns to continue watching
4. Track progress even before content is marked as complete

## Integration with Get Module Contents API

The saved video position can be retrieved via the [Get Module Contents API](#get-module-contents-api). When fetching module contents, VIDEO content types include a `lastPosition` field indicating where the student left off.

```json
{
  "contents": [
    {
      "id": "5ecccc4b-4fce-45bf-a1f2-48c38087071c",
      "lessonContentType": "VIDEO",
      "paths": ["/content/video.mp4"],
      "isCompleted": false,
      "lastPosition": 125
    }
  ]
}
```

---

# Get Modules by Semester with Assessment Status API

## Endpoint

`GET /student-portal/my-learning-courses/:studentCourseId/modules-by-semester-with-status`

## Description

Retrieves course modules organized by semester with detailed assessment status for the authenticated student. This endpoint returns module-level progress information including quiz and assignment completion status, grades, and overall module status (PASS/FAIL/IN_PROGRESS).

## Request

### Path Parameters

| Parameter       | Type          | Required | Description                                                         |
| --------------- | ------------- | -------- | ------------------------------------------------------------------- |
| studentCourseId | string (UUID) | Yes      | The unique identifier of the student course to retrieve modules for |

### Example Request

```bash
curl -H "user-id: ace4a91e-1370-44af-be8c-d141acad9d05" "http://localhost:3000/student-portal/my-learning-courses/dc569cdd-e129-43a9-89fe-93d6f598c24c/modules-by-semester-with-status"
```

## Response

### Success Response

- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body

| Field                                                         | Type   | Description                                                          |
| ------------------------------------------------------------- | ------ | -------------------------------------------------------------------- |
| data.course.id                                                | string | Unique identifier of the course                                      |
| data.course.title                                             | string | Title of the course                                                  |
| data.course.code                                              | string | Code of the course                                                   |
| data.semesters                                                | array  | Array of semester objects                                            |
| data.semesters[].semesterNumber                               | number | The semester number                                                  |
| data.semesters[].modules                                      | array  | Array of module objects for this semester                            |
| data.semesters[].modules[].id                                 | string | Unique identifier of the module                                      |
| data.semesters[].modules[].title                              | string | Title of the module                                                  |
| data.semesters[].modules[].code                               | string | Code of the module                                                   |
| data.semesters[].modules[].credits                            | number | Number of credits for the module                                     |
| data.semesters[].modules[].semester                           | number | The semester number                                                  |
| data.semesters[].modules[].order                              | number | Order of the module in the semester                                  |
| data.semesters[].modules[].prerequisites                      | array  | Array of prerequisite module IDs                                     |
| data.semesters[].modules[].assessmentStatus.status            | string | Status of the module (PASS, FAIL, IN_PROGRESS, OVERDUE, NOT_STARTED) |
| data.semesters[].modules[].assessmentStatus.completed         | number | Number of assessments completed                                      |
| data.semesters[].modules[].assessmentStatus.total             | number | Total number of assessments                                          |
| data.semesters[].modules[].assessmentStatus.progress          | string | Progress string in format "completed/total"                          |
| data.semesters[].modules[].assessmentStatus.averageScore      | number | Average score across all assessments                                 |
| data.semesters[].modules[].assessmentStatus.maxPossibleScore  | number | Maximum possible score across all assessments                        |
| data.semesters[].modules[].assessmentStatus.averagePercentage | number | Average percentage score (0-100)                                     |
| data.semesters[].modules[].assessmentStatus.grade             | string | Grade assigned based on average percentage (A+, A, B+, B, C+, C, F)  |

### Example Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Course modules with assessment status retrieved successfully",
  "data": {
    "course": {
      "id": "c750285f-c8ca-4fa1-b62d-345a1e55eaf1",
      "title": "Advanced Programming Course",
      "code": "012S0F2N"
    },
    "semesters": [
      {
        "semesterNumber": 1,
        "modules": [
          {
            "id": "9c7d1ea8-fe04-4407-a9f4-309eda6f6c28",
            "title": "Programming Fundamentals",
            "code": "0135TB5L",
            "credits": 0,
            "semester": 1,
            "order": 1,
            "prerequisites": [],
            "assessmentStatus": {
              "status": "PASS",
              "completed": 2,
              "total": 3,
              "progress": "2/3",
              "averageScore": 75.5,
              "maxPossibleScore": 100,
              "averagePercentage": 75.5,
              "grade": "B+"
            }
          },
          {
            "id": "b985890f-55ed-4a4a-a5b1-47c0f2fba3dc",
            "title": "Object-Oriented Programming",
            "code": "013B6W7X",
            "credits": 0,
            "semester": 1,
            "order": 2,
            "prerequisites": [],
            "assessmentStatus": {
              "status": "IN_PROGRESS",
              "completed": 1,
              "total": 2,
              "progress": "1/2",
              "averageScore": 65.0,
              "maxPossibleScore": 100,
              "averagePercentage": 65.0,
              "grade": "C+"
            }
          }
        ]
      }
    ]
  }
}
```

### Error Responses

| Status Code | Error Message                              | Description                                            |
| ----------- | ------------------------------------------ | ------------------------------------------------------ |
| 401         | "Student information not found in request" | When no student information is attached to the request |
| 404         | "Student course not found"                 | When no student course exists with the provided ID     |
| 500         | Server error messages                      | When there's an internal server error                  |

## Usage

This endpoint is used to retrieve course modules with detailed assessment status for the authenticated student. It's particularly useful when you need to:

1. Display module progress with assessment completion status
2. Show grades (A+, A, B+, etc.) for each module
3. Determine if a module is passed (>40% average) or failed
4. Show assessment progress in the format "completed/total"
5. Provide detailed insights into student performance at the module level
