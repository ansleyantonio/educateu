# Assessment Module API Documentation - Rubrics

## Base URL
All API endpoints are relative to: `http://18.171.208.170:4040`

This module provides APIs for managing rubrics for assessments in the system. Each API serves a specific function within the assessment management workflow.

---

# Connect Rubric Criteria to Assignment Question API

## Endpoint
`POST /assessments/assignment-questions/:assignmentQuestionId/rubric-criteria`

## Description
Connects rubric criteria to an assignment question, either by creating new rubric criteria or connecting existing ones. This endpoint allows you to establish a rubric system for the assignment question with proper ordering.

## Request

### Headers
- `Content-Type: application/json`

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| assignmentQuestionId | string (UUID) | Yes | The unique identifier of the assignment question to connect rubric criteria to |

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| rubricName | string | No (required if not previously set) | Name of the rubric system for this assignment |
| rubricDescription | string | No (required if not previously set) | Description of the rubric system for this assignment |
| rubricCriteriaConnections | array | Yes | Array of rubric criteria connections (minimum 1 item) |
| rubricCriteriaConnections[].type | string | Yes | Type of connection - either "new" to create new criteria or "existing" to connect existing criteria |
| rubricCriteriaConnections[].index | number | Yes | Position index for the rubric criteria (0-based, non-negative integer) |

For new rubric criteria:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| rubricCriteriaConnections[].data | object | Yes (for new type) | Data for creating new rubric criteria |
| rubricCriteriaConnections[].data.name | string | Yes | Name of the rubric criteria (min 1 character) |
| rubricCriteriaConnections[].data.description | string | Yes | Description of the rubric criteria (min 1 character) |
| rubricCriteriaConnections[].data.weight | number | Yes | Weight of the rubric criteria (non-negative integer) |
| rubricCriteriaConnections[].data.levels | array | Yes | Array of levels for this rubric criteria |
| rubricCriteriaConnections[].data.levels[].name | string | Yes (for each level) | Name of the evaluation level (min 1 character) |
| rubricCriteriaConnections[].data.levels[].description | string | Yes (for each level) | Description of the evaluation level (min 1 character) |
| rubricCriteriaConnections[].data.levels[].weight | number | Yes (for each level) | Weight of the evaluation level (non-negative integer) |

For existing rubric criteria:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| rubricCriteriaConnections[].rubricCriteriaId | string (UUID) | Yes (for existing type) | The unique identifier of the existing rubric criteria to connect |

### Validation Rules
1. At least one rubric criteria connection must be provided
2. If rubricName or rubricDescription are not previously set, both must be provided in the request
3. Each connection must have a valid type ("new" or "existing")
4. Index values must be non-negative integers
5. For new criteria, all data fields are required and must meet minimum length requirements
6. For existing criteria, the rubricCriteriaId must reference an existing rubric criteria
7. **Rubric Total Weight Validation**: The sum of all rubric criteria weights in a single request must not exceed the assignment question's `point` value.

### Example Request (Creating New Rubric Criteria)
```bash
curl -X POST "http://18.171.208.170:4040/assessments/assignment-questions/10e736e9-ddda-4487-bd37-d99fc6fedfc8/rubric-criteria" \
  -H "Content-Type: application/json" \
  -d '{
    "rubricName": "Essay Rubric",
    "rubricDescription": "Rubric for evaluating essays",
    "rubricCriteriaConnections": [
      {
        "type": "new",
        "data": {
          "name": "Content Quality",
          "description": "Quality and depth of content",
          "weight": 25,
          "levels": [
            {
              "name": "Excellent",
              "description": "High-quality content with excellent depth",
              "weight": 100
            },
            {
              "name": "Good",
              "description": "Good content with adequate depth",
              "weight": 75
            },
            {
              "name": "Satisfactory",
              "description": "Basic content with minimal depth",
              "weight": 50
            }
          ]
        },
        "index": 0
      },
      {
        "type": "new",
        "data": {
          "name": "Writing Style",
          "description": "Clarity and style of writing",
          "weight": 20,
          "levels": [
            {
              "name": "Proficient",
              "description": "Clear and well-structured writing",
              "weight": 80
            },
            {
              "name": "Developing",
              "description": "Writing with some clarity issues",
              "weight": 50
            }
          ]
        },
        "index": 1
      }
    ]
  }'
```

### Example Request (Connecting Existing Rubric Criteria)
```bash
curl -X POST "http://18.171.208.170:4040/assessments/assignment-questions/10e736e9-ddda-4487-bd37-d99fc6fedfc8/rubric-criteria" \
  -H "Content-Type: application/json" \
  -d '{
    "rubricName": "Essay Rubric",
    "rubricDescription": "Rubric for evaluating essays",
    "rubricCriteriaConnections": [
      {
        "type": "existing",
        "rubricCriteriaId": "9d00d528-2fb3-4951-837f-516641f9fecb",
        "index": 0
      }
    ]
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
| message | string | "Rubric criteria connected to assignment question successfully" |
| data.rubricCriteria | array | Array of processed rubric criteria objects |
| data.rubricCriteria[].id | string | Unique identifier of the rubric criteria |
| data.rubricCriteria[].name | string | Name of the rubric criteria |
| data.rubricCriteria[].description | string | Description of the rubric criteria |
| data.rubricCriteria[].weight | number | Weight of the rubric criteria |
| data.rubricCriteria[].levels | array | Array of levels for this rubric criteria |
| data.rubricCriteria[].levels[].name | string | Name of the evaluation level |
| data.rubricCriteria[].levels[].description | string | Description of the evaluation level |
| data.rubricCriteria[].levels[].weight | number | Weight of the evaluation level |
| data.rubricCriteria[].createdAt | string (date) | Creation timestamp of the rubric criteria |
| data.rubricCriteria[].updatedAt | string (date) | Last update timestamp of the rubric criteria |
| data.rubricCriteria[].assignmentQuestionId | string | ID of the assignment question this criteria is connected to |

### Example Success Response
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Rubric criteria connected to assignment question successfully",
  "data": {
    "rubricCriteria": [
      {
        "id": "9d00d528-2fb3-4951-837f-516641f9fecb",
        "name": "Content Quality",
        "description": "Quality and depth of content",
        "weight": 25,
        "levelName": "Excellent",
        "levelDescription": "High-quality content with excellent depth",
        "createdAt": "2025-11-08T22:09:05.795Z",
        "updatedAt": "2025-11-08T22:09:05.795Z",
        "assignmentQuestionId": "10e736e9-ddda-4487-bd37-d99fc6fedfc8"
      }
    ]
  }
}
```

### Error Responses
| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 400 | "At least one rubric criteria connection is required" | When no rubric criteria connections are provided |
| 400 | "Rubric name and description are required when setting rubric criteria for the first time" | When rubric name or description is needed but not provided |
| 400 | "Weight must be a non-negative integer" | When weight is provided but is negative |
| 400 | "Name is required" | When name is provided but is empty |
| 400 | "Invalid connection type. Must be 'existing' or 'new'" | When an invalid connection type is provided |
| 404 | "Assignment question not found" | When no assignment question exists with the provided ID |
| 404 | "Rubric criteria with ID X not found" | When attempting to connect a non-existent rubric criteria |

## Usage

This endpoint is used to connect rubric criteria to an assignment question, establishing the evaluation framework for the assignment. It's particularly useful when you need to:

1. Create a rubric system for an assignment question
2. Connect existing rubric criteria to an assignment
3. Establish the evaluation criteria and their order
4. Set up multiple criteria with different weights and evaluation levels

Note: The endpoint supports both creating new rubric criteria and connecting existing ones, providing flexibility in rubric management.

---

# Get Rubric Criteria for Assignment Question API

## Endpoint
`GET /assessments/assignment-questions/:assignmentQuestionId/rubric-criteria`

## Description
Retrieves all rubric criteria associated with a specific assignment question. The criteria are returned in the order specified by the assignment question's rubricCriteriaOrder property.

## Request

### Headers
- `Content-Type: application/json`

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| assignmentQuestionId | string (UUID) | Yes | The unique identifier of the assignment question whose rubric criteria are being retrieved |

## Response

### Success Response
- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body
| Field | Type | Description |
|-------|------|-------------|
| status | string | "success" |
| statusCode | number | 200 |
| message | string | "Rubric criteria retrieved successfully" |
| data.rubricCriteria | array | Array of rubric criteria objects, ordered according to rubricCriteriaOrder |
| data.rubricCriteria[].id | string | Unique identifier of the rubric criteria |
| data.rubricCriteria[].name | string | Name of the rubric criteria |
| data.rubricCriteria[].description | string | Description of the rubric criteria |
| data.rubricCriteria[].weight | number | Weight of the rubric criteria |
| data.rubricCriteria[].levels | array | Array of levels for this rubric criteria |
| data.rubricCriteria[].levels[].name | string | Name of the evaluation level |
| data.rubricCriteria[].levels[].description | string | Description of the evaluation level |
| data.rubricCriteria[].levels[].weight | number | Weight of the evaluation level |
| data.rubricCriteria[].createdAt | string (date) | Creation timestamp of the rubric criteria |
| data.rubricCriteria[].updatedAt | string (date) | Last update timestamp of the rubric criteria |
| data.rubricCriteria[].assignmentQuestionId | string | ID of the assignment question this criteria is connected to |

### Example Request
```bash
curl -X GET "http://18.171.208.170:4040/assessments/assignment-questions/10e736e9-ddda-4487-bd37-d99fc6fedfc8/rubric-criteria"
```

### Example Success Response
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Rubric criteria retrieved successfully",
  "data": {
    "rubricCriteria": [
      {
        "id": "9d00d528-2fb3-4951-837f-516641f9fecb",
        "name": "Content Quality",
        "description": "Quality and depth of content",
        "weight": 25,
        "levelName": "Excellent",
        "levelDescription": "High-quality content with excellent depth",
        "createdAt": "2025-11-08T22:09:05.795Z",
        "updatedAt": "2025-11-08T22:09:05.795Z",
        "assignmentQuestionId": "10e736e9-ddda-4487-bd37-d99fc6fedfc8"
      }
    ]
  }
}
```

### Error Responses
| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 404 | "Assignment question not found" | When no assignment question exists with the provided ID |
| 404 | "Associated assessment not found" | When the assignment question exists but its associated assessment does not |

## Usage

This endpoint is used to retrieve all rubric criteria for a specific assignment question in their proper order. It's particularly useful when you need to:

1. Display the rubric criteria to students or instructors
2. Show the evaluation framework for an assignment
3. Retrieve criteria for grading purposes
4. Present rubric information in the correct sequence as defined by the rubricCriteriaOrder

Note: The endpoint maintains the correct ordering of criteria as specified in the assignment question's rubricCriteriaOrder property, ensuring they appear in the intended sequence.

---

# Get Single Rubric Criteria API

## Endpoint
`GET /assessments/rubric-criteria/:id`

## Description
Retrieves a specific rubric criteria by its unique identifier. Returns complete information about the rubric criteria including its associated assignment question.

## Request

### Headers
- `Content-Type: application/json`

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | The unique identifier of the rubric criteria to retrieve |

## Response

### Success Response
- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body
| Field | Type | Description |
|-------|------|-------------|
| status | string | "success" |
| statusCode | number | 200 |
| message | string | "Rubric criteria retrieved successfully" |
| data.rubricCriteria.id | string | Unique identifier of the rubric criteria |
| data.rubricCriteria.name | string | Name of the rubric criteria |
| data.rubricCriteria.description | string | Description of the rubric criteria |
| data.rubricCriteria.weight | number | Weight of the rubric criteria |
| data.rubricCriteria.levels | array | Array of levels for this rubric criteria |
| data.rubricCriteria.levels[].name | string | Name of the evaluation level |
| data.rubricCriteria.levels[].description | string | Description of the evaluation level |
| data.rubricCriteria.levels[].weight | number | Weight of the evaluation level |
| data.rubricCriteria.createdAt | string (date) | Creation timestamp of the rubric criteria |
| data.rubricCriteria.updatedAt | string (date) | Last update timestamp of the rubric criteria |
| data.rubricCriteria.assignmentQuestionId | string | ID of the assignment question this criteria is connected to |

### Example Request
```bash
curl -X GET "http://18.171.208.170:4040/assessments/rubric-criteria/9d00d528-2fb3-4951-837f-516641f9fecb"
```

### Example Success Response
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Rubric criteria retrieved successfully",
  "data": {
    "rubricCriteria": {
      "id": "9d00d528-2fb3-4951-837f-516641f9fecb",
      "name": "Content Quality",
      "description": "Quality and depth of content",
      "weight": 25,
      "levelName": "Excellent",
      "levelDescription": "High-quality content with excellent depth",
      "createdAt": "2025-11-08T22:09:05.795Z",
      "updatedAt": "2025-11-08T22:09:05.795Z",
      "assignmentQuestionId": "10e736e9-ddda-4487-bd37-d99fc6fedfc8"
    }
  }
}
```

### Error Responses
| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 404 | "Rubric criteria not found" | When no rubric criteria exists with the provided ID |
| 404 | "Associated assignment question not found" | When the rubric criteria exists but its associated assignment question does not |

## Usage

This endpoint is used to retrieve a specific rubric criteria when you know its unique ID. It's particularly useful when you need to:

1. Load a specific rubric criteria for editing or review
2. Display detailed information about a single rubric criteria
3. Fetch criteria details for a specific rubric criteria ID
4. Get rubric criteria information to display in management interfaces

Note: The endpoint returns the complete rubric criteria information including its associated assignment question ID.

---

# Update Rubric Criteria API

## Endpoint
`PUT /assessments/rubric-criteria/:id`

## Description
Updates an existing rubric criteria with the provided details. Only non-relational fields can be updated (name, description, weight, levels). This allows for updating rubric criteria information without changing associations.

## Request

### Headers
- `Content-Type: application/json`

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | The unique identifier of the rubric criteria to update |

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | No | Updated name of the rubric criteria (min 1 character if provided) |
| description | string | No | Updated description of the rubric criteria (min 1 character if provided) |
| weight | number | No | Updated weight of the rubric criteria (non-negative integer if provided) |
| levels | array | No | Updated array of levels for this rubric criteria |
| levels[].name | string | Yes (for each level) | Name of the evaluation level (min 1 character) |
| levels[].description | string | Yes (for each level) | Description of the evaluation level (min 1 character) |
| levels[].weight | number | Yes (for each level) | Weight of the evaluation level (non-negative integer) |

### Validation Rules
1. If `name` is provided, it must be at least 1 character long
2. If `description` is provided, it must be at least 1 character long
3. If `weight` is provided, it must be a non-negative integer
4. If `levels` is provided, each level must have a name, description, and weight that meet validation requirements
5. The rubric criteria must exist
6. **Rubric Weight Validation**: If updating the `weight` field and the rubric criteria is associated with an assignment question, the total weight of all rubric criteria for that assignment question must not exceed the assignment question's `point` value.

### Example Request
```bash
curl -X PUT "http://18.171.208.170:4040/assessments/rubric-criteria/9d00d528-2fb3-4951-837f-516641f9fecb" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Enhanced Content Quality",
    "description": "Enhanced evaluation of content quality and depth",
    "weight": 30,
    "levels": [
      {
        "name": "Outstanding",
        "description": "Exceptional content quality with deep analysis",
        "weight": 100
      },
      {
        "name": "Good",
        "description": "Good content quality with some analysis",
        "weight": 75
      },
      {
        "name": "Satisfactory",
        "description": "Basic content quality with minimal analysis",
        "weight": 50
      }
    ]
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
| message | string | "Rubric criteria updated successfully" |
| data.rubricCriteria.id | string | Unique identifier of the updated rubric criteria |
| data.rubricCriteria.name | string | Updated name of the rubric criteria |
| data.rubricCriteria.description | string | Updated description of the rubric criteria |
| data.rubricCriteria.weight | number | Updated weight of the rubric criteria |
| data.rubricCriteria.levels | array | Array of levels for this rubric criteria |
| data.rubricCriteria.levels[].name | string | Name of the evaluation level |
| data.rubricCriteria.levels[].description | string | Description of the evaluation level |
| data.rubricCriteria.levels[].weight | number | Weight of the evaluation level |
| data.rubricCriteria.createdAt | string (date) | Creation timestamp of the rubric criteria |
| data.rubricCriteria.updatedAt | string (date) | Last update timestamp of the rubric criteria |
| data.rubricCriteria.assignmentQuestionId | string | ID of the assignment question this criteria is connected to |

### Example Success Response
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Rubric criteria updated successfully",
  "data": {
    "rubricCriteria": {
      "id": "9d00d528-2fb3-4951-837f-516641f9fecb",
      "name": "Enhanced Content Quality",
      "description": "Enhanced evaluation of content quality and depth",
      "weight": 30,
      "levels": [
        {
          "name": "Outstanding",
          "description": "Exceptional content quality with deep analysis",
          "weight": 100
        },
        {
          "name": "Good",
          "description": "Good content quality with some analysis",
          "weight": 75
        },
        {
          "name": "Satisfactory",
          "description": "Basic content quality with minimal analysis",
          "weight": 50
        }
      ],
      "createdAt": "2025-11-08T22:09:05.795Z",
      "updatedAt": "2025-11-08T22:12:01.140Z",
      "assignmentQuestionId": "10e736e9-ddda-4487-bd37-d99fc6fedfc8"
    }
  }
}
```

### Error Responses
| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 400 | "Name is required" | When name is provided but is empty |
| 400 | "Description is required" | When description is provided but is empty |
| 400 | "Weight must be a non-negative integer" | When weight is provided but is negative |
| 400 | "Level name is required" | When level name is provided but is empty |
| 400 | "Level description is required" | When level description is provided but is empty |
| 400 | "Level weight must be a non-negative integer" | When level weight is provided but is negative |
| 404 | "Rubric criteria not found" | When no rubric criteria exists with the provided ID |
| 404 | "Associated assignment question not found" | When the rubric criteria exists but its associated assignment question does not |

## Usage

This endpoint is used to update specific fields of an existing rubric criteria. It's particularly useful when you need to:

1. Modify rubric criteria names or descriptions
2. Adjust evaluation weights
3. Update level names or descriptions
4. Correct errors in rubric criteria information

Note: Only non-relational fields can be updated through this endpoint, ensuring that associations between rubric criteria and assignment questions are preserved.

---

# Update Rubric Criteria Index API

## Endpoint
`PUT /assessments/rubric-criteria/:id/index`

## Description
Updates the position index of a specific rubric criteria within an assignment question. When a rubric criteria's index is changed, the assignment question's rubricCriteriaOrder is automatically updated to reflect the new position, and other rubric criteria are reindexed accordingly to maintain sequential ordering.

## Request

### Headers
- `Content-Type: application/json`

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | The unique identifier of the rubric criteria to reposition |

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| index | number | Yes | The new position index for the rubric criteria (0-based, non-negative integer). Must not exceed the total number of rubric criteria minus 1. |

### Validation Rules
1. `index` must be a non-negative integer
2. `index` must not be greater than the total number of rubric criteria in the assignment question minus 1
3. The rubric criteria must exist in the assignment question's current order list

### Example Request
```bash
curl -X PUT "http://18.171.208.170:4040/assessments/rubric-criteria/9d00d528-2fb3-4951-837f-516641f9fecb/index" \
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
| message | string | "Rubric criteria index updated successfully" |
| data.assignmentQuestion.id | string | Unique identifier of the assignment question |
| data.assignmentQuestion.assessmentId | string | ID of the assessment this assignment question belongs to |
| data.assignmentQuestion.questionText | string | Text content of the assignment question |
| data.assignmentQuestion.submissionType | any | Submission type configuration for the assignment |
| data.assignmentQuestion.point | number | Point value of the assignment |
| data.assignmentQuestion.createdAt | string (date) | Creation timestamp of the assignment question |
| data.assignmentQuestion.updatedAt | string (date) | Last update timestamp of the assignment question |
| data.assignmentQuestion.rubricName | string | Name of the rubric template for this assignment |
| data.assignmentQuestion.rubricDescription | string | Description of the rubric template for this assignment |
| data.assignmentQuestion.rubricCriteriaOrder | array | Array of objects showing the new order of rubric criteria |
| data.assignmentQuestion.rubricCriteria | array | Array of sorted rubric criteria objects in the new order |
| data.assignmentQuestion.rubricCriteria[].id | string | Unique identifier of the rubric criteria |
| data.assignmentQuestion.rubricCriteria[].name | string | Name of the rubric criteria |
| data.assignmentQuestion.rubricCriteria[].description | string | Description of the rubric criteria |
| data.assignmentQuestion.rubricCriteria[].weight | number | Weight of the rubric criteria |
| data.assignmentQuestion.rubricCriteria[].levels | array | Array of levels for this rubric criteria |
| data.assignmentQuestion.rubricCriteria[].levels[].name | string | Name of the evaluation level |
| data.assignmentQuestion.rubricCriteria[].levels[].description | string | Description of the evaluation level |
| data.assignmentQuestion.rubricCriteria[].levels[].weight | number | Weight of the evaluation level |
| data.assignmentQuestion.rubricCriteria[].createdAt | string (date) | Creation timestamp of the rubric criteria |
| data.assignmentQuestion.rubricCriteria[].updatedAt | string (date) | Last update timestamp of the rubric criteria |
| data.assignmentQuestion.rubricCriteria[].assignmentQuestionId | string | ID of the assignment question this criteria is connected to |

### Example Success Response
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Rubric criteria index updated successfully",
  "data": {
    "assignmentQuestion": {
      "id": "10e736e9-ddda-4487-bd37-d99fc6fedfc8",
      "assessmentId": "3492126e-7d82-4184-88f2-606b9549b5a2",
      "questionText": "Essay on Educational Technology",
      "submissionType": null,
      "point": 50,
      "createdAt": "2025-11-08T22:09:00.927Z",
      "updatedAt": "2025-11-08T22:13:12.595Z",
      "rubricName": "Essay Rubric",
      "rubricDescription": "Rubric for evaluating essays",
      "rubricCriteriaOrder": [
        {
          "index": 0,
          "rubricCriteriaId": "9d00d528-2fb3-4951-837f-516641f9fecb"
        }
      ],
      "rubricCriteria": [
        {
          "id": "9d00d528-2fb3-4951-837f-516641f9fecb",
          "name": "Enhanced Content Quality",
          "description": "Enhanced evaluation of content quality and depth",
          "weight": 30,
          "levelName": "Excellent",
          "levelDescription": "High-quality content with excellent depth",
          "createdAt": "2025-11-08T22:09:05.795Z",
          "updatedAt": "2025-11-08T22:12:01.140Z",
          "assignmentQuestionId": "10e736e9-ddda-4487-bd37-d99fc6fedfc8"
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
| 400 | "Index cannot be greater than X" | When the provided index exceeds the number of rubric criteria minus 1 |
| 404 | "Rubric criteria not found" | When no rubric criteria exists with the provided ID |
| 404 | "Associated assignment question not found" | When the rubric criteria exists but its associated assignment question does not |
| 404 | "Rubric criteria not found in order list" | When the rubric criteria doesn't exist in the assignment question's current order list |

## Usage

This endpoint is used to change the position of a rubric criteria within an assignment question. It's particularly useful when you need to:

1. Reorder rubric criteria for better evaluation flow
2. Move important criteria to more prominent positions
3. Adjust the order of criteria after adding or modifying criteria
4. Organize criteria by importance or evaluation sequence

Note: When a criteria's index changes, all other criteria in the assignment question are automatically repositioned to maintain sequential ordering starting from 0.

---

# Delete Rubric Criteria API

## Endpoint
`DELETE /assessments/rubric-criteria/:id`

## Description
Deletes a specific rubric criteria by its unique identifier. When a rubric criteria is deleted, the assignment question's rubricCriteriaOrder is automatically updated to remove the criteria and reindex the remaining criteria to maintain sequential ordering.

## Request

### Headers
- `Content-Type: application/json`

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | The unique identifier of the rubric criteria to delete |

## Response

### Success Response
- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body
| Field | Type | Description |
|-------|------|-------------|
| status | string | "success" |
| statusCode | number | 200 |
| message | string | "Rubric criteria deleted successfully" |
| data.rubricCriteria.id | string | Unique identifier of the deleted rubric criteria |
| data.rubricCriteria.name | string | Name of the deleted rubric criteria |
| data.rubricCriteria.description | string | Description of the deleted rubric criteria |
| data.rubricCriteria.weight | number | Weight of the deleted rubric criteria |
| data.rubricCriteria.levelName | string | Name of the evaluation level |
| data.rubricCriteria.levelDescription | string | Description of the evaluation level |
| data.rubricCriteria.createdAt | string (date) | Creation timestamp of the rubric criteria |
| data.rubricCriteria.updatedAt | string (date) | Last update timestamp of the rubric criteria |
| data.rubricCriteria.assignmentQuestionId | string | ID of the assignment question this criteria was connected to |

### Example Request
```bash
curl -X DELETE "http://18.171.208.170:4040/assessments/rubric-criteria/9d00d528-2fb3-4951-837f-516641f9fecb"
```

### Example Success Response
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Rubric criteria deleted successfully",
  "data": {
    "rubricCriteria": {
      "id": "9d00d528-2fb3-4951-837f-516641f9fecb",
      "name": "Enhanced Content Quality",
      "description": "Enhanced evaluation of content quality and depth",
      "weight": 30,
      "levelName": "Excellent",
      "levelDescription": "High-quality content with excellent depth",
      "createdAt": "2025-11-08T22:09:05.795Z",
      "updatedAt": "2025-11-08T22:12:01.140Z",
      "assignmentQuestionId": "10e736e9-ddda-4487-bd37-d99fc6fedfc8"
    }
  }
}
```

### Error Responses
| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 404 | "Rubric criteria not found" | When no rubric criteria exists with the provided ID |
| 404 | "Associated assignment question not found" | When the rubric criteria exists but its associated assignment question does not |

## Usage

This endpoint is used to permanently remove a rubric criteria from an assignment question. It's particularly useful when you need to:

1. Remove unwanted or outdated evaluation criteria
2. Clean up test criteria or duplicates
3. Update rubric systems by removing irrelevant criteria
4. Manage evaluation frameworks by removing specific criteria

Note: When a criteria is deleted, the system automatically maintains the proper ordering of remaining criteria by reindexing the rubricCriteriaOrder array in the associated assignment question.

---

# Create Rubric Template from Assignment Question API

## Endpoint
`POST /assessments/assignment-questions/:assignmentQuestionId/create-template`

## Description
Creates a new rubric template from an existing assignment question's rubric criteria. The template will include copies of all rubric criteria associated with the assignment question and preserve their ordering.

## Request

### Headers
- `Content-Type: application/json`

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| assignmentQuestionId | string (UUID) | Yes | The unique identifier of the assignment question to create the template from |

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| templateName | string | Yes | The name for the new rubric template (min 1 character) |

### Validation Rules
1. `templateName` must be at least 1 character long
2. The assignment question must exist
3. The assignment question must have at least one rubric criteria associated with it
4. The associated assessment must exist

### Example Request
```bash
curl -X POST "http://18.171.208.170:4040/assessments/assignment-questions/10e736e9-ddda-4487-bd37-d99fc6fedfc8/create-template" \
  -H "Content-Type: application/json" \
  -d '{
    "templateName": "Essay Evaluation Template"
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
| message | string | "Rubric template created successfully" |
| data.rubricTemplate.id | string | Unique identifier of the created rubric template |
| data.rubricTemplate.name | string | Name of the created rubric template |
| data.rubricTemplate.createdAt | string (date) | Creation timestamp of the rubric template |
| data.rubricTemplate.updatedAt | string (date) | Last update timestamp of the rubric template |
| data.rubricTemplate.rubricCriteria | array | Array of rubric criteria copied from the assignment question |
| data.rubricTemplate.rubricCriteria[].id | string | Unique identifier of the rubric criteria |
| data.rubricTemplate.rubricCriteria[].name | string | Name of the rubric criteria |
| data.rubricTemplate.rubricCriteria[].description | string | Description of the rubric criteria |
| data.rubricTemplate.rubricCriteria[].weight | number | Weight of the rubric criteria |
| data.rubricTemplate.rubricCriteria[].levels | array | Array of levels for this rubric criteria |
| data.rubricTemplate.rubricCriteria[].levels[].name | string | Name of the evaluation level |
| data.rubricTemplate.rubricCriteria[].levels[].description | string | Description of the evaluation level |
| data.rubricTemplate.rubricCriteria[].levels[].weight | number | Weight of the evaluation level |
| data.rubricTemplate.rubricCriteria[].createdAt | string (date) | Creation timestamp of the rubric criteria |
| data.rubricTemplate.rubricCriteria[].updatedAt | string (date) | Last update timestamp of the rubric criteria |
| data.rubricTemplate.rubricCriteria[].assignmentQuestionId | string | ID of the assignment question this criteria was copied from |

### Example Success Response
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Rubric template created successfully",
  "data": {
    "rubricTemplate": {
      "id": "61cbb30e-3cc3-4b41-bce5-dc5d69005ad5",
      "name": "Essay Evaluation Template",
      "createdAt": "2025-11-08T22:15:51.597Z",
      "updatedAt": "2025-11-08T22:15:51.597Z",
      "rubricCriteria": [
        {
          "id": "95671161-3034-428b-a8fd-d95608ee6ce5",
          "name": "Enhanced Content Quality",
          "description": "Enhanced evaluation of content quality and depth",
          "weight": 30,
          "levels": [
            {
              "name": "Excellent",
              "description": "High-quality content with excellent depth",
              "weight": 100
            },
            {
              "name": "Good",
              "description": "Good content with adequate depth",
              "weight": 75
            },
            {
              "name": "Satisfactory",
              "description": "Basic content with minimal depth",
              "weight": 50
            }
          ],
          "createdAt": "2025-11-08T22:15:51.600Z",
          "updatedAt": "2025-11-08T22:15:51.600Z",
          "assignmentQuestionId": "10e736e9-ddda-4487-bd37-d99fc6fedfc8"
        }
      ]
    }
  }
}
```

### Error Responses
| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 400 | "Template name is required" | When templateName is provided but is empty |
| 400 | "Assignment question has no rubric criteria to create a template from" | When the assignment question has no associated rubric criteria |
| 404 | "Assignment question not found" | When no assignment question exists with the provided ID |
| 404 | "Associated assessment not found" | When the assignment question exists but its associated assessment does not |
| 500 | "Failed to create rubric template" | When there's an internal server error creating the template |

## Usage

This endpoint is used to create a reusable rubric template from an existing assignment question's rubric criteria. It's particularly useful when you need to:

1. Save a frequently used rubric system as a template
2. Create standard evaluation criteria that can be reused across multiple assignments
3. Preserve the structure and ordering of existing rubric criteria as a template for future use
4. Create template libraries for different types of assignments

Note: The template will contain copies of all rubric criteria from the original assignment question, maintaining their order and evaluation structure.

---

# Get Rubric Templates API

## Endpoint
`GET /assessments/rubric-templates`

## Description
Retrieves all rubric templates in the system with their associated rubric criteria. The templates are ordered by creation date with the newest first.

## Request

### Headers
- `Content-Type: application/json` (optional for GET requests)

## Response

### Success Response
- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body
| Field | Type | Description |
|-------|------|-------------|
| status | string | "success" |
| statusCode | number | 200 |
| message | string | "Rubric templates retrieved successfully" |
| data.rubricTemplates | array | Array of rubric template objects |
| data.rubricTemplates[].id | string | Unique identifier of the rubric template |
| data.rubricTemplates[].name | string | Name of the rubric template |
| data.rubricTemplates[].createdAt | string (date) | Creation timestamp of the rubric template |
| data.rubricTemplates[].updatedAt | string (date) | Last update timestamp of the rubric template |
| data.rubricTemplates[].rubricCriteria | array | Array of rubric criteria associated with this template |
| data.rubricTemplates[].rubricCriteria[].id | string | Unique identifier of the rubric criteria |
| data.rubricTemplates[].rubricCriteria[].name | string | Name of the rubric criteria |
| data.rubricTemplates[].rubricCriteria[].description | string | Description of the rubric criteria |
| data.rubricTemplates[].rubricCriteria[].weight | number | Weight of the rubric criteria |
| data.rubricTemplates[].rubricCriteria[].levelName | string | Name of the evaluation level |
| data.rubricTemplates[].rubricCriteria[].levelDescription | string | Description of the evaluation level |
| data.rubricTemplates[].rubricCriteria[].createdAt | string (date) | Creation timestamp of the rubric criteria |
| data.rubricTemplates[].rubricCriteria[].updatedAt | string (date) | Last update timestamp of the rubric criteria |
| data.rubricTemplates[].rubricCriteria[].assignmentQuestionId | string | ID of the assignment question this criteria is associated with |

### Example Request
```bash
curl -X GET "http://18.171.208.170:4040/assessments/rubric-templates"
```

### Example Success Response
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Rubric templates retrieved successfully",
  "data": {
    "rubricTemplates": [
      {
        "id": "61cbb30e-3cc3-4b41-bce5-dc5d69005ad5",
        "name": "Essay Evaluation Template",
        "createdAt": "2025-11-08T22:15:51.597Z",
        "updatedAt": "2025-11-08T22:15:51.597Z",
        "rubricCriteria": [
          {
            "id": "95671161-3034-428b-a8fd-d95608ee6ce5",
            "name": "Enhanced Content Quality",
            "description": "Enhanced evaluation of content quality and depth",
            "weight": 30,
            "levelName": "Excellent",
            "levelDescription": "High-quality content with excellent depth",
            "createdAt": "2025-11-08T22:15:51.600Z",
            "updatedAt": "2025-11-08T22:15:51.600Z",
            "assignmentQuestionId": "10e736e9-ddda-4487-bd37-d99fc6fedfc8"
          }
        ]
      }
    ]
  }
}
```

### Error Responses
| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 500 | Server error messages | When there's an internal server error retrieving templates |

## Usage

This endpoint is used to retrieve all rubric templates in the system. It's particularly useful when you need to:

1. Display all available rubric templates to users
2. Load template lists for selection interfaces
3. Show existing templates for reuse
4. Manage and organize rubric templates across the system

Note: The templates are returned in descending order by creation date (newest first), with all their associated rubric criteria included.

---

# Get Rubric Criteria for Template API

## Endpoint
`GET /assessments/rubric-templates/:id`

## Description
Retrieves all rubric criteria associated with a specific rubric template. The criteria are returned in the order specified by the template's rubricCriteriaOrder property.

## Request

### Headers
- `Content-Type: application/json`

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | The unique identifier of the rubric template whose criteria are being retrieved |

## Response

### Success Response
- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body
| Field | Type | Description |
|-------|------|-------------|
| status | string | "success" |
| statusCode | number | 200 |
| message | string | "Rubric criteria for template retrieved successfully" |
| data.templateId | string | Unique identifier of the rubric template |
| data.templateName | string | Name of the rubric template |
| data.rubricCriteria | array | Array of rubric criteria objects, ordered according to rubricCriteriaOrder |
| data.rubricCriteria[].id | string | Unique identifier of the rubric criteria |
| data.rubricCriteria[].name | string | Name of the rubric criteria |
| data.rubricCriteria[].description | string | Description of the rubric criteria |
| data.rubricCriteria[].weight | number | Weight of the rubric criteria |
| data.rubricCriteria[].levelName | string | Name of the evaluation level |
| data.rubricCriteria[].levelDescription | string | Description of the evaluation level |
| data.rubricCriteria[].createdAt | string (date) | Creation timestamp of the rubric criteria |
| data.rubricCriteria[].updatedAt | string (date) | Last update timestamp of the rubric criteria |
| data.rubricCriteria[].assignmentQuestionId | string | ID of the assignment question this criteria is associated with |

### Example Request
```bash
curl -X GET "http://18.171.208.170:4040/assessments/rubric-templates/61cbb30e-3cc3-4b41-bce5-dc5d69005ad5"
```

### Example Success Response
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Rubric criteria for template retrieved successfully",
  "data": {
    "templateId": "61cbb30e-3cc3-4b41-bce5-dc5d69005ad5",
    "templateName": "Essay Evaluation Template",
    "rubricCriteria": [
      {
        "id": "95671161-3034-428b-a8fd-d95608ee6ce5",
        "name": "Enhanced Content Quality",
        "description": "Enhanced evaluation of content quality and depth",
        "weight": 30,
        "levelName": "Excellent",
        "levelDescription": "High-quality content with excellent depth",
        "createdAt": "2025-11-08T22:15:51.600Z",
        "updatedAt": "2025-11-08T22:15:51.600Z",
        "assignmentQuestionId": "10e736e9-ddda-4487-bd37-d99fc6fedfc8"
      }
    ]
  }
}
```

### Error Responses
| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 404 | "Rubric template not found" | When no rubric template exists with the provided ID |

## Usage

This endpoint is used to retrieve all rubric criteria for a specific template in their proper order. It's particularly useful when you need to:

1. Load a specific rubric template for editing or review
2. Display the evaluation criteria for a chosen template
3. Show template details to users selecting rubric systems
4. Present rubric criteria in the correct sequence as defined by the template's rubricCriteriaOrder

Note: The endpoint maintains the correct ordering of criteria as specified in the template's rubricCriteriaOrder property, ensuring they appear in the intended sequence.