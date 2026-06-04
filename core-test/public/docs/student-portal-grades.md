# Student Portal - Grades API

## Get All Grades

Retrieves all grades for the authenticated student across all courses and modules.

### Endpoint

```
GET /student-portal/grades
```

### Authentication

This endpoint requires the `user-id` header to be set with the authenticated student's ID.

### Headers

| Header  | Value  | Required | Description                         |
| ------- | ------ | -------- | ----------------------------------- |
| user-id | string | Yes      | The ID of the authenticated student |

### Request

#### Example Request

```bash
curl -X GET "http://localhost:3000/student-portal/grades" \
  -H "user-id: 0dbbaa22-d506-490c-9032-b769d303567b" \
  -H "Content-Type: application/json"
```

### Response

Returns a success response with grade information for all courses and modules the student is enrolled in.

#### Response Structure

| Field      | Type   | Description                                            |
| ---------- | ------ | ------------------------------------------------------ |
| status     | string | Response status ("success")                            |
| statusCode | number | HTTP status code (200)                                 |
| message    | string | Response message ("All grades retrieved successfully") |
| data       | object | Contains the grades information                        |

#### Data Structure

| Field     | Type  | Description                                          |
| --------- | ----- | ---------------------------------------------------- |
| allGrades | array | Array of course objects containing grade information |

#### Course Object Structure

| Field       | Type   | Description                                    |
| ----------- | ------ | ---------------------------------------------- |
| courseId    | string | Unique identifier for the course               |
| courseTitle | string | Title of the course                            |
| courseCode  | string | Code identifying the course                    |
| modules     | array  | Array of module objects with grade information |

#### Module Object Structure

| Field      | Type   | Description                                      |
| ---------- | ------ | ------------------------------------------------ |
| moduleId   | string | Unique identifier for the module                 |
| moduleName | string | Name of the module                               |
| totalScore | number | Total points earned by the student in the module |
| maxScore   | number | Maximum possible points for the module           |
| percentage | number | Percentage score (totalScore/maxScore \* 100)    |

#### Example Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "All grades retrieved successfully",
  "data": {
    "allGrades": [
      {
        "courseId": "f1d4025f-25e6-4900-a2a5-ad335d65deee",
        "courseTitle": "Computer Science Degree",
        "courseCode": "013AX3MD",
        "modules": [
          {
            "moduleId": "c58b59f3-8dba-4340-9528-3d16acae9dc5",
            "moduleName": "Introduction to Programming",
            "totalScore": 5,
            "maxScore": 25,
            "percentage": 20
          },
          {
            "moduleId": "77649251-64df-4488-a461-ca8f1171c582",
            "moduleName": "Data Structures and Algorithms",
            "totalScore": 0,
            "maxScore": 25,
            "percentage": 0
          }
        ]
      }
    ]
  }
}
```

### Error Responses

| Status Code | Error Code            | Message                                  |
| ----------- | --------------------- | ---------------------------------------- |
| 401         | UNAUTHORIZED          | Student information not found in request |
| 404         | STUDENT_NOT_FOUND     | Student not found                        |
| 500         | INTERNAL_SERVER_ERROR | Internal server error                    |

### Notes

- The grades are calculated based on completed assessments in each module
- The totalScore represents the sum of points earned across all assessments in the module
- The maxScore represents the maximum possible points across all assessments in the module
- The percentage is calculated as (totalScore / maxScore) \* 100, rounded to the nearest integer

---

## Get Course Grades

Retrieves grades for a specific course of the authenticated student, grouped by semester.

### Endpoint

```
GET /student-portal/grades/:studentCourseId
```

### Authentication

This endpoint requires the `user-id` header to be set with the authenticated student's ID.

### Headers

| Header  | Value  | Required | Description                         |
| ------- | ------ | -------- | ----------------------------------- |
| user-id | string | Yes      | The ID of the authenticated student |

### Request Parameters

| Parameter       | Type   | Required | Description                                              |
| --------------- | ------ | -------- | -------------------------------------------------------- |
| studentCourseId | string | Yes      | The unique identifier of the student's course enrollment |

#### Example Request

```bash
curl -X GET "http://localhost:3000/student-portal/grades/0f087cc8-e8b2-49c2-b113-d2e2494cd574" \
  -H "user-id: 0dbbaa22-d506-490c-9032-b769d303567b" \
  -H "Content-Type: application/json"
```

### Response

Returns a success response with grade information for a specific course, grouped by semester.

#### Response Structure

| Field      | Type   | Description                                               |
| ---------- | ------ | --------------------------------------------------------- |
| status     | string | Response status ("success")                               |
| statusCode | number | HTTP status code (200)                                    |
| message    | string | Response message ("Course grades retrieved successfully") |
| data       | object | Contains the grades information                           |

#### Data Structure

| Field       | Type   | Description                                      |
| ----------- | ------ | ------------------------------------------------ |
| courseId    | string | Unique identifier for the course                 |
| courseTitle | string | Title of the course                              |
| semesters   | array  | Array of semester objects with grade information |

#### Semester Object Structure

| Field          | Type   | Description                                    |
| -------------- | ------ | ---------------------------------------------- |
| semesterNumber | number | The semester number                            |
| modules        | array  | Array of module objects with grade information |

#### Module Object Structure

| Field      | Type   | Description                                      |
| ---------- | ------ | ------------------------------------------------ |
| moduleId   | string | Unique identifier for the module                 |
| moduleName | string | Name of the module                               |
| earned     | number | Total points earned by the student in the module |
| total      | number | Maximum possible points for the module           |
| percentage | number | Percentage score (earned/total \* 100)           |

#### Example Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Course grades retrieved successfully",
  "data": {
    "courseId": "0fa67650-48cf-45e5-a5f1-bd184cf66180",
    "courseTitle": "Degree with multiple Details",
    "semesters": [
      {
        "semesterNumber": 1,
        "modules": [
          {
            "moduleId": "b533bd6a-1a3c-4fcf-9fef-e6ba6a072e6b",
            "moduleName": "Module with assessment 1",
            "earned": 16,
            "total": 50,
            "percentage": 32
          }
        ]
      },
      {
        "semesterNumber": 2,
        "modules": [
          {
            "moduleId": "3f180aeb-a6ca-4240-b972-e55ed6bfc784",
            "moduleName": "Module with assessment 2",
            "earned": 16,
            "total": 50,
            "percentage": 32
          }
        ]
      }
    ]
  }
}
```

### Error Responses

| Status Code | Error Code            | Message                                  |
| ----------- | --------------------- | ---------------------------------------- |
| 400         | BAD_REQUEST           | Invalid student course ID format         |
| 401         | UNAUTHORIZED          | Student information not found in request |
| 404         | NOT_FOUND             | Student course not found                 |
| 500         | INTERNAL_SERVER_ERROR | Internal server error                    |

### Notes

- The grades are fetched from the course snapshot (immutable course structure at enrollment time)
- Modules are grouped by their semester number
- If a student has not attempted any assessments in a module, earned will be 0 and total will be 0
- The percentage is calculated as (earned / total) \* 100, rounded to the nearest integer
