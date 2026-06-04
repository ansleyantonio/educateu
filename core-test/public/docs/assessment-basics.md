# Assessment Module API Documentation - Basic Operations

## Base URL
All API endpoints are relative to: `http://18.171.208.170:4040`

This module provides APIs for managing assessments in the system. Each API serves a specific function within the assessment management workflow.

---

# Assessment Creation API

## Endpoint
`POST /assessments`

### Description
Creates a new assessment with the provided details. Assessments can be of different categories (QUIZ or ASSIGNMENT) and types (DEGREE, DIPLOMA, CPD, PROFESSIONAL).

**Important**: For DEGREE and DIPLOMA assessment types, you must first retrieve valid awarding body IDs by calling the [Get Awarding Bodies API](assessment-awarding-bodies.md) endpoint, as these assessment types require an awardingBodyId parameter.

## Request

### Headers
- `Content-Type: application/json`

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| nameOrTitle | string | Yes | The name or title of the assessment |
| assessmentCode | string | No | Unique code for the assessment. If not provided, a unique code will be automatically generated. |
| assessmentCategory | string | Yes | Category of the assessment - "QUIZ" or "ASSIGNMENT" |
| assessmentType | string | Yes | Type of the assessment - "DEGREE", "DIPLOMA", "CPD", or "PROFESSIONAL" |
| questionSize | number | Conditional | Required for QUIZ assessments, should not be provided for ASSIGNMENT assessments. Number of questions in the assessment |
| descriptionOrInstructions | string | Yes | Description or instructions for the assessment |
| availableStartDate | string (date) | Yes | Start date when the assessment becomes available |
| availableEndDate | string (date) | Yes | End date when the assessment is no longer available |
| timeLimit | number | Yes | Time limit for the assessment in minutes |
| totalPointsOrWeight | number | Yes | Total points or weight of the assessment |
| attempts | number | Yes | Number of allowed attempts for the assessment |
| lateSubmissions | boolean | Yes | Whether late submissions are allowed |
| passingScore | number | No | Minimum score required to pass the assessment |
| dueDate | string (date) | No | Due date for the assessment |
| awardingBodyId | string (UUID) | Conditional | Required for DEGREE and DIPLOMA assessments, not for CPD and PROFESSIONAL |

### Validation Rules
1. `awardingBodyId` is required for DEGREE/DIPLOMA assessments and must not be provided for CPD/PROFESSIONAL assessments
2. `questionSize` is required for QUIZ assessments and must not be provided for ASSIGNMENT assessments
3. `availableStartDate` must not be after `availableEndDate`
4. If `dueDate` is provided, it must not be after `availableEndDate`
5. `timeLimit` must be a non-negative integer
6. `totalPointsOrWeight` must be a non-negative integer
7. `attempts` must be at least 1
8. `passingScore` must be a non-negative integer (if provided)
9. If `assessmentCode` is provided, it must be unique across all assessments

### Example Request (with provided assessment code)
```json
{
  "nameOrTitle": "Mathematics 101 Quiz",
  "assessmentCode": "MATH101",
  "assessmentCategory": "QUIZ",
  "assessmentType": "CPD",
  "questionSize": 10,
  "descriptionOrInstructions": "This is a basic mathematics assessment",
  "availableStartDate": "2025-12-01T00:00:00.000Z",
  "availableEndDate": "2025-12-31T23:59:59.000Z",
  "timeLimit": 60,
  "totalPointsOrWeight": 100,
  "attempts": 2,
  "lateSubmissions": false
}
```

### Example Request (without assessment code - auto-generated)
```json
{
  "nameOrTitle": "Physics 201 Quiz",
  "assessmentCategory": "QUIZ",
  "assessmentType": "CPD",
  "questionSize": 15,
  "descriptionOrInstructions": "This is a physics assessment",
  "availableStartDate": "2025-12-01T00:00:00.000Z",
  "availableEndDate": "2025-12-31T23:59:59.000Z",
  "timeLimit": 90,
  "totalPointsOrWeight": 150,
  "attempts": 1,
  "lateSubmissions": true
}
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
| data.assessment.id | string | Unique identifier of the created assessment |
| data.assessment.nameOrTitle | string | Name or title of the created assessment |
| data.assessment.assessmentCode | string | Code of the created assessment |
| data.assessment.assessmentCategory | string | Category of the created assessment |
| data.assessment.assessmentType | string | Type of the created assessment |
| data.assessment.questionSize | number | Number of questions in the assessment (if applicable) |
| data.assessment.descriptionOrInstructions | string | Description or instructions of the created assessment |
| data.assessment.status | string | Status of the assessment - "DRAFT" by default |
| data.assessment.availableStartDate | string (date) | Start date when the assessment becomes available |
| data.assessment.availableEndDate | string (date) | End date when the assessment is no longer available |
| data.assessment.timeLimit | number | Time limit for the assessment in minutes |
| data.assessment.totalPointsOrWeight | number | Total points or weight of the assessment |
| data.assessment.attempts | number | Number of allowed attempts for the assessment |
| data.assessment.lateSubmissions | boolean | Whether late submissions are allowed |

### Example Success Response
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "assessment": {
      "id": "88f3ede4-6d26-4129-a0ed-04929884046c",
      "nameOrTitle": "Mathematics 101 Quiz",
      "assessmentCode": "MATH101",
      "assessmentCategory": "QUIZ",
      "assessmentType": "CPD",
      "questionSize": 10,
      "descriptionOrInstructions": "This is a basic mathematics assessment",
      "status": "DRAFT",
      "availableStartDate": "2025-12-01T00:00:00.000Z",
      "availableEndDate": "2025-12-31T23:59:59.000Z",
      "timeLimit": 60,
      "totalPointsOrWeight": 100,
      "attempts": 2,
      "lateSubmissions": false
    }
  }
}
```

### Error Responses
| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 400 | "Assessment with this code already exists" | When an assessment with the same assessmentCode already exists (during creation or when updating to a new code) |
| 400 | Validation error messages | When request body doesn't meet validation criteria |

---

# Get All Assessments API

## Endpoint
`GET /assessments`

## Description
Retrieves a paginated list of all assessments with optional filtering by category, type, or search term.

## Request

### Headers
- `Content-Type: application/json` (optional for GET requests)

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number for pagination (default: 1) |
| pageSize | number | No | Number of items per page (default: 10, max: 100) |
| assessmentCode | string | No | Filter by assessment code |
| assessmentCategory | string | No | Filter by assessment category ("QUIZ" or "ASSIGNMENT") |
| assessmentType | string | No | Filter by assessment type ("DEGREE", "DIPLOMA", "CPD", or "PROFESSIONAL") |
| timeLimit | number | No | Filter by time limit of the assessment in minutes (minimum value: 1) |
| totalPointsOrWeight | number | No | Filter by total points or weight of the assessment (minimum value: 1) |
| searchTerm | string | No | Search term to filter assessments by nameOrTitle or assessmentCode |

### Example Request
```bash
curl -X GET "http://18.171.208.170:4040/assessments?page=1&pageSize=5&assessmentCategory=QUIZ&assessmentType=CPD&assessmentCode=MATH101&timeLimit=60&totalPointsOrWeight=100"
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
| data.assessments | array | Array of assessment objects |
| data.assessments[].id | string | Unique identifier of the assessment |
| data.assessments[].nameOrTitle | string | Name or title of the assessment |
| data.assessments[].assessmentCode | string | Code of the assessment |
| data.assessments[].assessmentCategory | string | Category of the assessment ("QUIZ" or "ASSIGNMENT") |
| data.assessments[].assessmentType | string | Type of the assessment ("DEGREE", "DIPLOMA", "CPD", or "PROFESSIONAL") |
| data.assessments[].questionSize | number | Number of questions in the assessment (if applicable) |
| data.assessments[].descriptionOrInstructions | string | Description or instructions for the assessment |
| data.assessments[].status | string | Status of the assessment ("DRAFT" or "PUBLISHED") |
| data.assessments[].availableStartDate | string (date) | Start date when the assessment becomes available |
| data.assessments[].availableEndDate | string (date) | End date when the assessment is no longer available |
| data.assessments[].timeLimit | number | Time limit for the assessment in minutes |
| data.assessments[].totalPointsOrWeight | number | Total points or weight of the assessment |
| data.assessments[].passingScore | number | Minimum score required to pass the assessment (optional) |
| data.assessments[].attempts | number | Number of allowed attempts for the assessment |
| data.assessments[].lateSubmissions | boolean | Whether late submissions are allowed |
| data.assessments[].dueDate | string (date) | Due date for the assessment (optional) |
| pagination | object | Pagination information |
| pagination.count | number | Number of items in the current response |
| pagination.total | number | Total number of items matching the query |
| pagination.page | number | Current page number |
| pagination.perPage | number | Number of items per page |
| pagination.totalPages | number | Total number of pages |

### Example Success Response
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "assessments": [
      {
        "id": "88f3ede4-6d26-4129-a0ed-04929884046c",
        "nameOrTitle": "Mathematics 101 Quiz",
        "assessmentCode": "MATH101",
        "assessmentCategory": "QUIZ",
        "assessmentType": "CPD",
        "questionSize": 10,
        "descriptionOrInstructions": "This is a basic mathematics assessment",
        "status": "DRAFT",
        "availableStartDate": "2025-12-01T00:00:00.000Z",
        "availableEndDate": "2025-12-31T23:59:59.000Z",
        "timeLimit": 60,
        "totalPointsOrWeight": 100,
        "passingScore": null,
        "attempts": 2,
        "lateSubmissions": false,
        "dueDate": null
      }
    ]
  },
  "pagination": {
    "count": 1,
    "total": 10,
    "page": 1,
    "perPage": 10,
    "totalPages": 1
  }
}
```

### Error Responses
| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 500 | Server error messages | When there's an internal server error |

## Usage

This endpoint is used to retrieve assessments with pagination and filtering capabilities. It's particularly useful when you need to:

1. List all assessments for administrative purposes
2. Filter assessments by category (QUIZ/ASSIGNMENT) or type (DEGREE/DIPLOMA/CPD/PROFESSIONAL)
3. Search for specific assessments by name or code
4. Implement paginated display of assessments in user interfaces

---

# Get Assessment by ID API

## Endpoint
`GET /assessments/:id`

## Description
Retrieves a specific assessment by its unique identifier. This endpoint returns detailed information about a single assessment including any associated awarding body information.

## Request

### Headers
- `Content-Type: application/json` (optional for GET requests)

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | The unique identifier of the assessment to retrieve |

### Example Request
```bash
curl -X GET "http://18.171.208.170:4040/assessments/88f3ede4-6d26-4129-a0ed-04929884046c"
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
| data.assessment.id | string | Unique identifier of the assessment |
| data.assessment.nameOrTitle | string | Name or title of the assessment |
| data.assessment.assessmentCode | string | Code of the assessment |
| data.assessment.assessmentCategory | string | Category of the assessment ("QUIZ" or "ASSIGNMENT") |
| data.assessment.assessmentType | string | Type of the assessment ("DEGREE", "DIPLOMA", "CPD", or "PROFESSIONAL") |
| data.assessment.questionSize | number | Number of questions in the assessment (if applicable) |
| data.assessment.descriptionOrInstructions | string | Description or instructions for the assessment |
| data.assessment.status | string | Status of the assessment ("DRAFT" or "PUBLISHED") |
| data.assessment.availableStartDate | string (date) | Start date when the assessment becomes available |
| data.assessment.availableEndDate | string (date) | End date when the assessment is no longer available |
| data.assessment.timeLimit | number | Time limit for the assessment in minutes |
| data.assessment.totalPointsOrWeight | number | Total points or weight of the assessment |
| data.assessment.passingScore | number | Minimum score required to pass the assessment (optional) |
| data.assessment.attempts | number | Number of allowed attempts for the assessment |
| data.assessment.lateSubmissions | boolean | Whether late submissions are allowed |
| data.assessment.dueDate | string (date) | Due date for the assessment (optional) |
| data.assessment.awardingBody | object | Associated awarding body information (if applicable) |
| data.assessment.awardingBody.id | string | Unique identifier of the awarding body |
| data.assessment.awardingBody.name | string | Name of the awarding body |
| data.assessment.awardingBody.code | string | Code of the awarding body |
| data.assessment.awardingBody.abbreviation | string | Abbreviation of the awarding body |
| data.assessment.awardingBody.status | string | Status of the awarding body ("ACTIVE" or "INACTIVE") |
| data.assessment.awardingBody.intakePeriods | array | List of intake periods offered by the awarding body |

### Example Success Response
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "assessment": {
      "id": "88f3ede4-6d26-4129-a0ed-04929884046c",
      "nameOrTitle": "Mathematics 101 Quiz",
      "assessmentCode": "MATH101",
      "assessmentCategory": "QUIZ",
      "assessmentType": "CPD",
      "questionSize": 10,
      "descriptionOrInstructions": "This is a basic mathematics assessment",
      "status": "DRAFT",
      "availableStartDate": "2025-12-01T00:00:00.000Z",
      "availableEndDate": "2025-12-31T23:59:59.000Z",
      "timeLimit": 60,
      "totalPointsOrWeight": 100,
      "attempts": 2,
      "lateSubmissions": false,
      "dueDate": null,
      "awardingBody": null
    }
  }
}
```

### Error Responses
| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 404 | "Assessment not found" | When no assessment exists with the provided ID |

## Usage

This endpoint is used to retrieve detailed information about a specific assessment. It's particularly useful when you need to:

1. View detailed information about a single assessment
2. Check the status or configuration of an existing assessment
3. Retrieve an assessment before updating or modifying it
4. Get assessment details that include awarding body information when applicable

---

# Update Assessment API

## Endpoint
`PUT /assessments/:id`

## Description
Updates an existing assessment with the provided details. Only the fields provided in the request body will be updated, other fields remain unchanged. Note that assessment category and type cannot be modified after creation.

## Request

### Headers
- `Content-Type: application/json`

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | The unique identifier of the assessment to update |

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| nameOrTitle | string | No | The updated name or title of the assessment |
| assessmentCode | string | No | The updated code for the assessment. If provided and different from the current code, it must be unique across all assessments. |
| questionSize | number | No | Updated number of questions in the assessment (required for QUIZ assessments, should not be provided for ASSIGNMENT assessments) |
| descriptionOrInstructions | string | No | The updated description or instructions for the assessment |
| status | string | No | Updated status of the assessment ("DRAFT" or "PUBLISHED") |
| availableStartDate | string (date) | No | Updated start date when the assessment becomes available |
| availableEndDate | string (date) | No | Updated end date when the assessment is no longer available |
| timeLimit | number | No | Updated time limit for the assessment in minutes |
| totalPointsOrWeight | number | No | Updated total points or weight of the assessment |
| passingScore | number | No | Updated minimum score required to pass the assessment |
| attempts | number | No | Updated number of allowed attempts for the assessment |
| lateSubmissions | boolean | No | Whether late submissions are allowed |
| dueDate | string (date) | No | Updated due date for the assessment |
| awardingBodyId | string (UUID) | No | Updated awarding body ID (can be set to null to disconnect) |

### Validation Rules
1. `questionSize` is required for QUIZ assessments and must not be provided for ASSIGNMENT assessments (when provided during update)
2. If both `availableStartDate` and `availableEndDate` are provided, start date must not be after end date
3. If `dueDate` and `availableEndDate` are both provided, due date must not be after end date
4. `timeLimit` must be a non-negative integer if provided
5. `totalPointsOrWeight` must be a non-negative integer if provided
6. `attempts` must be at least 1 if provided
7. `passingScore` must be a non-negative integer if provided
8. If `assessmentCode` is provided and different from the current assessment code, it must be unique across all assessments

### Example Request
```bash
curl -X PUT "http://18.171.208.170:4040/assessments/88f3ede4-6d26-4129-a0ed-04929884046c" \
  -H "Content-Type: application/json" \
  -d '{
    "nameOrTitle": "Updated Mathematics 101 Quiz",
    "assessmentCode": "MATH101-UPDATED",
    "descriptionOrInstructions": "This is an updated mathematics assessment",
    "status": "PUBLISHED"
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
| data.assessment.nameOrTitle | string | Updated name or title of the assessment |
| data.assessment.assessmentCode | string | Updated code of the assessment |
| data.assessment.assessmentCategory | string | Category of the assessment (unchanged) |
| data.assessment.assessmentType | string | Type of the assessment (unchanged) |
| data.assessment.questionSize | number | Updated number of questions in the assessment (if applicable) |
| data.assessment.descriptionOrInstructions | string | Updated description or instructions for the assessment |
| data.assessment.status | string | Updated status of the assessment |
| data.assessment.availableStartDate | string (date) | Updated start date when the assessment becomes available |
| data.assessment.availableEndDate | string (date) | Updated end date when the assessment is no longer available |
| data.assessment.timeLimit | number | Updated time limit for the assessment |
| data.assessment.totalPointsOrWeight | number | Updated total points or weight of the assessment |
| data.assessment.passingScore | number | Updated minimum score required to pass the assessment (optional) |
| data.assessment.attempts | number | Updated number of allowed attempts for the assessment |
| data.assessment.lateSubmissions | boolean | Whether late submissions are allowed |
| data.assessment.dueDate | string (date) | Updated due date for the assessment (optional) |
| data.assessment.awardingBody | object | Associated awarding body information (if applicable) |

### Example Success Response
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "assessment": {
      "id": "88f3ede4-6d26-4129-a0ed-04929884046c",
      "nameOrTitle": "Updated Mathematics 101 Quiz",
      "assessmentCode": "MATH101-UPDATED",
      "assessmentCategory": "QUIZ",
      "assessmentType": "CPD",
      "questionSize": 10,
      "descriptionOrInstructions": "This is an updated mathematics assessment",
      "status": "PUBLISHED",
      "availableStartDate": "2025-12-01T00:00:00.000Z",
      "availableEndDate": "2025-12-31T23:59:59.000Z",
      "timeLimit": 60,
      "totalPointsOrWeight": 100,
      "attempts": 2,
      "lateSubmissions": false,
      "dueDate": null,
      "awardingBody": null
    }
  }
}
```

### Error Responses
| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 400 | "Assessment with this code already exists" | When attempting to update to an assessmentCode that already exists for a different assessment |
| 400 | Validation error messages | When request body doesn't meet validation criteria |
| 404 | "Assessment not found" | When no assessment exists with the provided ID |

## Usage

This endpoint is used to update specific fields of an existing assessment. It's particularly useful when you need to:

1. Modify assessment details without recreating the assessment
2. Update assessment status from "DRAFT" to "PUBLISHED"
3. Correct errors in assessment information
4. Change assessment parameters like time limits or attempts

Note that the assessment category and type cannot be changed after creation, as they are immutable fields.

---

# Update Assessment Status API

## Endpoint
`PATCH /assessments/:id/status`

## Description
Updates only the status of an existing assessment with comprehensive validation. This endpoint ensures that the assessment meets specific criteria before allowing status changes to maintain data integrity. The endpoint validates that assessment total points match associated question points and enforces business rules around publishing assessments.

## Request

### Headers
- `Content-Type: application/json`

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | The unique identifier of the assessment to update |

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | string | Yes | The new status value ("DRAFT" or "PUBLISHED") |

### Validation Rules
1. **Point Validation**: The assessment's `totalPointsOrWeight` must equal the sum of all associated question points:
   - For QUIZ assessments: Sum of all quiz question points
   - For ASSIGNMENT assessments: Sum of all assignment question points
2. **Rubric Criteria Validation**: For assignments, each assignment question's point value must equal the sum of its rubric criteria weights
3. **Positive Points Validation**: Assessments with total points ≤ 0 cannot be published to "PUBLISHED" status
4. **Zero Question Points Validation**: When status is changing to "PUBLISHED", no quiz or assignment question can have 0 or negative points
5. **Question Count Validation for QUIZ Assessments**: When status is changing to "PUBLISHED", the number of questions must not be smaller than the `questionSize` value:
   - For QUIZ assessments: The number of quiz questions cannot be smaller than the `questionSize` field value
6. **Complete Question Data Validation**: When status is changing to "PUBLISHED", all questions must have proper content:
   - All questions must have non-empty question text
   - Quiz questions must have proper options and answers based on their type (MULTIPLE_CHOICE, TRUE_FALSE, etc.)

### Example Request
```bash
curl -X PATCH "http://18.171.208.170:4040/assessments/88f3ede4-6d26-4129-a0ed-04929884046c/status" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "PUBLISHED"
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
| data.assessment.assessmentCategory | string | Category of the assessment ("QUIZ" or "ASSIGNMENT") |
| data.assessment.assessmentType | string | Type of the assessment ("DEGREE", "DIPLOMA", "CPD", or "PROFESSIONAL") |
| data.assessment.questionSize | number | Number of questions in the assessment (if applicable) |
| data.assessment.descriptionOrInstructions | string | Description or instructions for the assessment |
| data.assessment.status | string | Updated status of the assessment |
| data.assessment.availableStartDate | string (date) | Start date when the assessment becomes available |
| data.assessment.availableEndDate | string (date) | End date when the assessment is no longer available |
| data.assessment.timeLimit | number | Time limit for the assessment in minutes |
| data.assessment.totalPointsOrWeight | number | Total points or weight of the assessment |
| data.assessment.passingScore | number | Minimum score required to pass the assessment (optional) |
| data.assessment.attempts | number | Number of allowed attempts for the assessment |
| data.assessment.lateSubmissions | boolean | Whether late submissions are allowed |
| data.assessment.dueDate | string (date) | Due date for the assessment (optional) |
| data.assessment.awardingBody | object | Associated awarding body information (if applicable) |

### Example Success Response
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "assessment": {
      "id": "88f3ede4-6d26-4129-a0ed-04929884046c",
      "nameOrTitle": "Mathematics 101 Quiz",
      "assessmentCode": "MATH101",
      "assessmentCategory": "QUIZ",
      "assessmentType": "CPD",
      "questionSize": 10,
      "descriptionOrInstructions": "This is a basic mathematics assessment",
      "status": "PUBLISHED",
      "availableStartDate": "2025-12-01T00:00:00.000Z",
      "availableEndDate": "2025-12-31T23:59:59.000Z",
      "timeLimit": 60,
      "totalPointsOrWeight": 100,
      "attempts": 2,
      "lateSubmissions": false,
      "dueDate": null,
      "awardingBody": null
    }
  }
}
```

### Error Responses
| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 400 | "Assessment total points (X) must equal the sum of all associated question points (Y)" | When the assessment's total points don't match the sum of associated question points |
| 400 | "Assignment question ID [id] point (X) must equal the sum of its rubric criteria weights (Y)" | When an assignment question's points don't match the sum of its rubric criteria weights |
| 400 | "Assessment with total points (X) cannot be published with zero or negative points" | When attempting to publish an assessment with 0 or negative total points |
| 400 | "Cannot publish assessment: quiz question ID [id] has 0 or negative points" | When attempting to publish an assessment that contains a quiz question with 0 or negative points |
| 400 | "Cannot publish assessment: assignment question ID [id] has 0 or negative points" | When attempting to publish an assessment that contains an assignment question with 0 or negative points |
| 400 | "Cannot publish quiz assessment: number of questions (X) is less than required questionSize (Y)" | When attempting to publish a quiz assessment that has fewer questions than the required questionSize |
| 400 | "Cannot publish assessment: quiz question ID [id] is missing required question text" | When attempting to publish an assessment that contains a quiz question without proper question text |
| 400 | "Cannot publish assessment: quiz question ID [id] (type) is missing required options" | When attempting to publish an assessment that contains a quiz question without required options based on its type |
| 400 | "Cannot publish assessment: quiz question ID [id] (type) is missing required answer" | When attempting to publish an assessment that contains a quiz question without required answer based on its type |
| 400 | "Cannot publish assessment: assignment question ID [id] is missing required question text" | When attempting to publish an assessment that contains an assignment question without proper question text |
| 400 | "Cannot publish assessment: assignment question ID [id] has 0 or negative points" | When attempting to publish an assessment that contains an assignment question with 0 or negative points |
| 404 | "Assessment not found" | When no assessment exists with the provided ID |

## Usage

This endpoint is used to update only the status of an assessment while enforcing critical business validations. It's particularly useful when you need to:

1. Publish a draft assessment after ensuring all validation criteria are met
2. Change an assessment from "PUBLISHED" back to "DRAFT" for further editing
3. Ensure data integrity by validating that assessment points match associated question points before publishing

This endpoint provides an additional layer of validation compared to the general update endpoint, specifically focused on status changes with point validation requirements.

---

# Assessment Preview API

## Endpoint
`GET /assessments/:id/preview`

## Description
Retrieves a preview of an assessment with logic specific to the assessment category. For quiz assessments, it randomly selects an equal number of questions from each question type to match the `questionSize`, then returns them in random order. For assignment assessments, it returns all questions as they are. This endpoint works for both published and draft assessments, but for draft quiz assessments, the number of questions must be greater than or equal to the questionSize.

## Request

### Headers
- `Content-Type: application/json` (optional for GET requests)

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | The unique identifier of the assessment to preview |

### Example Request
```bash
curl -X GET "http://18.171.208.170:4040/assessments/88f3ede4-6d26-4129-a0ed-04929884046c/preview"
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
| data.assessment.id | string | Unique identifier of the assessment |
| data.assessment.nameOrTitle | string | Name or title of the assessment |
| data.assessment.assessmentCategory | string | Category of the assessment ("QUIZ" or "ASSIGNMENT") |
| data.assessment.questionSize | number | Number of questions in the assessment (for QUIZ assessments) |
| data.questions | array | Array of question objects based on assessment category |
| data.questions[].id | string | Unique identifier of the question |
| data.questions[].type | string | Type of the question (for QUIZ assessments) |
| data.questions[].questionText | string | Text of the question |
| data.questions[].options | object | Options for the question (for QUIZ assessments) |
| data.questions[].point | number | Point value of the question |
| data.questions[].partialMark | boolean | Whether partial marks are allowed (for QUIZ assessments) |

### Example Success Response for QUIZ Assessment
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "assessment": {
      "id": "88f3ede4-6d26-4129-a0ed-04929884046c",
      "nameOrTitle": "Mathematics 101 Quiz",
      "assessmentCategory": "QUIZ",
      "questionSize": 4
    },
    "questions": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "type": "MULTIPLE_CHOICE",
        "questionText": "What is 2+2?",
        "options": ["2", "3", "4", "5"],
        "point": 5
      },
      {
        "id": "123e4567-e89b-12d3-a456-426614174001",
        "type": "TRUE_FALSE",
        "questionText": "Is TypeScript a superset of JavaScript?",
        "options": ["True", "False"],
        "point": 5
      }
    ]
  }
}
```

### Example Success Response for ASSIGNMENT Assessment
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "assessment": {
      "id": "88f3ede4-6d26-4129-a0ed-04929884046c",
      "nameOrTitle": "Mathematics 101 Assignment",
      "assessmentCategory": "ASSIGNMENT"
    },
    "questions": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174002",
        "questionText": "Write an essay on the importance of calculus",
        "submissionType": "ESSAY",
        "point": 20
      }
    ]
  }
}
```

### Error Responses
| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 400 | "Quiz assessment has X total questions, which is less than questionSize of Y" | When attempting to preview a quiz assessment that has fewer questions than its questionSize value |
| 400 | "Quiz assessment must have questionSize defined" | When a quiz assessment doesn't have questionSize defined |
| 404 | "Assessment not found" | When no assessment exists with the provided ID |

## Usage

This endpoint is used to get a preview of an assessment before taking it. It's particularly useful when you need to:

1. Show students a sample of what the assessment will look like
2. For QUIZ assessments: Provide a balanced sample of different question types according to the questionSize
3. For ASSIGNMENT assessments: Show the structure and types of questions to expect
4. Ensure sensitive information like correct answers are not revealed in preview mode
5. Preview draft assessments during creation and editing

---

# Update Quiz Question API

## Endpoint
`PUT /assessments/quiz-questions/:quizQuestionId`

## Description
Updates an existing quiz question with the provided details. The endpoint includes validation to ensure that updating the question's point value does not cause the sum of all quiz question points in the assessment to exceed the assessment's total points.

## Request

### Headers
- `Content-Type: application/json`

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| quizQuestionId | string (UUID) | Yes | The unique identifier of the quiz question to update |

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| questionText | string | No | The updated text of the quiz question |
| point | number | No | The updated point value of the quiz question |
| options | object | No | The updated options for the quiz question (structure varies by question type) |
| answer | object | No | The updated answer for the quiz question (structure varies by question type) |
| partialMark | boolean | No | Whether partial marks are allowed (required for MULTIPLE_SELECT questions) |

### Validation Rules
1. **Total Points Validation**: When updating the `point` field, the sum of all quiz question points in the assessment must not exceed the assessment's `totalPointsOrWeight` value.

### Example Request
```bash
curl -X PUT "http://18.171.208.170:4040/assessments/quiz-questions/123e4567-e89b-12d3-a456-426614174000" \
  -H "Content-Type: application/json" \
  -d '{
    "questionText": "What is the capital of France?",
    "point": 5,
    "options": ["Paris", "London", "Berlin", "Madrid"],
    "answer": "Paris"
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
| data.quizQuestion.id | string | Unique identifier of the updated quiz question |
| data.quizQuestion.type | string | Type of the quiz question |
| data.quizQuestion.questionText | string | Text of the quiz question |
| data.quizQuestion.point | number | Point value of the quiz question |
| data.quizQuestion.options | object | Options for the quiz question |
| data.quizQuestion.answer | object | Answer for the quiz question |

### Example Success Response
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "quizQuestion": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "type": "MULTIPLE_CHOICE",
      "questionText": "What is the capital of France?",
      "point": 5,
      "options": ["Paris", "London", "Berlin", "Madrid"],
      "answer": "Paris"
    }
  }
}
```

### Error Responses
| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 400 | "Updating this quiz question's point to X would exceed the assessment's total points. Current total of other questions: Y, Assessment max: Z" | When updating the point value would cause the sum to exceed the assessment's total points |
| 404 | "Quiz question not found" | When no quiz question exists with the provided ID |
| 404 | "Assessment not found" | When the associated assessment doesn't exist |

## Usage

This endpoint is used to update specific fields of an existing quiz question. It's particularly useful when you need to:

1. Modify quiz question content, point values, or options
2. Ensure data integrity by validating that total points don't exceed the assessment's total
3. Update different types of quiz questions (MULTIPLE_CHOICE, MULTIPLE_SELECT, etc.)

---

# Update Assignment Question API

## Endpoint
`PUT /assessments/assignment-questions/:assignmentQuestionId`

## Description
Updates an existing assignment question with the provided details. The endpoint includes validation to ensure that updating the question's point value does not cause the sum of all assignment question points in the assessment to exceed the assessment's total points.

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
| questionText | string | No | The updated text of the assignment question |
| submissionType | object | No | The updated submission type for the assignment question |
| point | number | No | The updated point value of the assignment question |
| rubricName | string | No | The updated name for the rubric |
| rubricDescription | string | No | The updated description for the rubric |

### Validation Rules
1. **Total Points Validation**: When updating the `point` field, the sum of all assignment question points in the assessment must not exceed the assessment's `totalPointsOrWeight` value.

### Example Request
```bash
curl -X PUT "http://18.171.208.170:4040/assessments/assignment-questions/123e4567-e89b-12d3-a456-426614174000" \
  -H "Content-Type: application/json" \
  -d '{
    "questionText": "Write an essay on the impact of climate change",
    "point": 10,
    "rubricName": "Essay Rubric",
    "rubricDescription": "Rubric for evaluating essay quality"
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
| data.assignmentQuestion.questionText | string | Text of the assignment question |
| data.assignmentQuestion.submissionType | object | Submission type for the assignment question |
| data.assignmentQuestion.point | number | Point value of the assignment question |
| data.assignmentQuestion.rubricName | string | Name of the rubric |
| data.assignmentQuestion.rubricDescription | string | Description of the rubric |

### Example Success Response
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "assignmentQuestion": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "questionText": "Write an essay on the impact of climate change",
      "submissionType": null,
      "point": 10,
      "rubricName": "Essay Rubric",
      "rubricDescription": "Rubric for evaluating essay quality",
      "assessment": {
        "id": "88f3ede4-6d26-4129-a0ed-04929884046c"
      }
    }
  }
}
```

### Error Responses
| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 400 | "Updating this assignment question's point to X would exceed the assessment's total points. Current total of other questions: Y, Assessment max: Z" | When updating the point value would cause the sum to exceed the assessment's total points |
| 404 | "Assignment question not found" | When no assignment question exists with the provided ID |
| 404 | "Assessment not found" | When the associated assessment doesn't exist |

## Usage

This endpoint is used to update specific fields of an existing assignment question. It's particularly useful when you need to:

1. Modify assignment question content, point values, or rubric details
2. Ensure data integrity by validating that total points don't exceed the assessment's total
3. Update assignment questions with associated rubric information

---

# Delete Assessment API

## Endpoint
`DELETE /assessments/:id`

## Description
Deletes an existing assessment by its unique identifier. This operation is permanent and cannot be undone.

## Request

### Headers
- `Content-Type: application/json` (optional for DELETE requests)

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | The unique identifier of the assessment to delete |

### Example Request
```bash
curl -X DELETE "http://18.171.208.170:4040/assessments/88f3ede4-6d26-4129-a0ed-04929884046c"
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
| data.message | string | Confirmation message indicating successful deletion |

### Example Success Response
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Request was successful",
  "data": {
    "message": "Assessment deleted successfully"
  }
}
```

### Error Responses
| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 404 | "Assessment not found" | When no assessment exists with the provided ID |

## Usage

This endpoint is used to permanently delete an assessment. It's particularly useful when you need to:

1. Remove assessments that are no longer needed
2. Clean up test or draft assessments
3. Remove assessments that were created in error

**Warning**: This operation is permanent and cannot be undone. All associated data with the assessment will also be deleted.