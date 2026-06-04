# Rubric Module API Documentation

## Base URL
All API endpoints are relative to: `http://18.171.208.170:4040`

This module provides APIs for managing rubric templates and criteria in the system. Each API serves a specific function within the rubric management workflow.

---

# Get Rubric Templates API

## Endpoint
`GET /rubrics/rubric-templates`

## Description
Retrieves all rubric templates with their associated rubric criteria. The templates are returned in descending order by creation date (newest first).

## Request

### Headers
- `Content-Type: application/json` (optional for GET requests)

### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | number | No | 1 | Page number for pagination (1-based) |
| pageSize | number | No | 10 | Number of items per page |
| searchTerm | string | No | - | Optional search term to filter rubric templates by name |

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
| data.rubricTemplates[].rubricCriteriaOrder | any | The order of rubric criteria in the template |
| data.rubricTemplates[].createdAt | string (date) | Creation timestamp of the rubric template |
| data.rubricTemplates[].updatedAt | string (date) | Last update timestamp of the rubric template |
| data.rubricTemplates[].rubricCriteria | array | Array of rubric criteria associated with this template |
| data.rubricTemplates[].rubricCriteria[].id | string | Unique identifier of the rubric criteria |
| data.rubricTemplates[].rubricCriteria[].name | string | Name of the rubric criteria |
| data.rubricTemplates[].rubricCriteria[].description | string | Description of the rubric criteria |
| data.rubricTemplates[].rubricCriteria[].weight | number | Weight of the rubric criteria |
| data.rubricTemplates[].rubricCriteria[].levels | array | Array of levels for this rubric criteria |
| data.rubricTemplates[].rubricCriteria[].levels[].name | string | Name of the evaluation level |
| data.rubricTemplates[].rubricCriteria[].levels[].description | string | Description of the evaluation level |
| data.rubricTemplates[].rubricCriteria[].levels[].weight | number | Weight of the evaluation level |
| data.rubricTemplates[].rubricCriteria[].createdAt | string (date) | Creation timestamp of the rubric criteria |
| data.rubricTemplates[].rubricCriteria[].updatedAt | string (date) | Last update timestamp of the rubric criteria |
| data.rubricTemplates[].rubricCriteria[].assignmentQuestionId | string | ID of the assignment question this criteria is associated with (if applicable) |
| data.pagination | object | Pagination metadata |
| data.pagination.count | number | Number of items in the current page |
| data.pagination.total | number | Total number of items across all pages |
| data.pagination.page | number | Current page number |
| data.pagination.perPage | number | Number of items per page |
| data.pagination.totalPages | number | Total number of pages |

### Example Request
```bash
curl -X GET "http://18.171.208.170:4040/rubrics/rubric-templates?page=1&pageSize=5&searchTerm=Essay"
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
        "rubricCriteriaOrder": [
          {
            "rubricCriteriaId": "95671161-3034-428b-a8fd-d95608ee6ce5",
            "index": 0
          }
        ],
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
              }
            ],
            "createdAt": "2025-11-08T22:15:51.600Z",
            "updatedAt": "2025-11-08T22:15:51.600Z",
            "assignmentQuestionId": null
          }
        ]
      }
    ],
    "pagination": {
      "count": 1,
      "total": 1,
      "page": 1,
      "perPage": 5,
      "totalPages": 1
    }
  }
}
```

### Error Responses
| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 500 | Server error messages | When there's an internal server error retrieving templates |

## Usage

This endpoint is used to retrieve all rubric templates in the system with optional pagination and search capabilities. It's particularly useful when you need to:

1. Display all available rubric templates to users
2. Load template lists for selection interfaces
3. Show existing templates for reuse
4. Manage and organize rubric templates across the system
5. Search for specific rubric templates by name
6. Paginate through large collections of rubric templates

Note: The templates are returned in descending order by creation date (newest first), with all their associated rubric criteria included. The endpoint supports pagination using page and pageSize parameters and allows searching by name using the searchTerm parameter.

---

# Get Rubric Criteria for Template API

## Endpoint
`GET /rubrics/rubric-templates/:id`

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
| data.rubricCriteria[].levels | array | Array of levels for this rubric criteria |
| data.rubricCriteria[].levels[].name | string | Name of the evaluation level |
| data.rubricCriteria[].levels[].description | string | Description of the evaluation level |
| data.rubricCriteria[].levels[].weight | number | Weight of the evaluation level |
| data.rubricCriteria[].createdAt | string (date) | Creation timestamp of the rubric criteria |
| data.rubricCriteria[].updatedAt | string (date) | Last update timestamp of the rubric criteria |
| data.rubricCriteria[].assignmentQuestionId | string | ID of the assignment question this criteria is associated with (if applicable) |

### Example Request
```bash
curl -X GET "http://18.171.208.170:4040/rubrics/rubric-templates/61cbb30e-3cc3-4b41-bce5-dc5d69005ad5"
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
          }
        ],
        "createdAt": "2025-11-08T22:15:51.600Z",
        "updatedAt": "2025-11-08T22:15:51.600Z",
        "assignmentQuestionId": null
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

---

# Create Rubric Template API

## Endpoint
`POST /rubrics/rubric-templates`

## Description
Creates a new rubric template with optional rubric criteria. This allows you to create templates ahead of time that can later be applied to assessments or assignment questions.

## Request

### Headers
- `Content-Type: application/json`

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | The name for the new rubric template (min 1 character) |
| description | string | No | Optional description for the new rubric template |
| rubricCriteriaConnections | array | No | Optional array of rubric criteria connections to add to the template |

For rubric criteria connections:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
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
1. `name` must be at least 1 character long
2. Each connection must have a valid type ("new" or "existing")
3. Index values must be non-negative integers
4. For new criteria, all data fields are required and must meet minimum length requirements
5. For existing criteria, the rubricCriteriaId must reference an existing rubric criteria

### Example Request (Creating New Template with Criteria)
```bash
curl -X POST "http://18.171.208.170:4040/rubrics/rubric-templates" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Essay Evaluation Template",
    "description": "Standard template for evaluating essays",
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
              "weight": 90
            },
            {
              "name": "Good",
              "description": "Good content with adequate depth",
              "weight": 70
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

### Example Request (Creating New Template without Criteria)
```bash
curl -X POST "http://18.171.208.170:4040/rubrics/rubric-templates" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Essay Evaluation Template",
    "description": "Standard template for evaluating essays"
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
| data.rubricTemplate.description | string | Description of the created rubric template |
| data.rubricTemplate.rubricCriteriaOrder | any | The order of rubric criteria in the template |
| data.rubricTemplate.createdAt | string (date) | Creation timestamp of the rubric template |
| data.rubricTemplate.updatedAt | string (date) | Last update timestamp of the rubric template |
| data.rubricTemplate.rubricCriteria | array | Array of rubric criteria associated with this template |
| data.rubricTemplate.rubricCriteria[].id | string | Unique identifier of the rubric criteria |
| data.rubricTemplate.rubricCriteria[].name | string | Name of the rubric criteria |
| data.rubricTemplate.rubricCriteria[].description | string | Description of the rubric criteria |
| data.rubricTemplate.rubricCriteria[].weight | number | Weight of the rubric criteria |
| data.rubricTemplate.rubricCriteria[].levelName | string | Name of the evaluation level |
| data.rubricTemplate.rubricCriteria[].levelDescription | string | Description of the evaluation level |
| data.rubricTemplate.rubricCriteria[].createdAt | string (date) | Creation timestamp of the rubric criteria |
| data.rubricTemplate.rubricCriteria[].updatedAt | string (date) | Last update timestamp of the rubric criteria |
| data.rubricTemplate.rubricCriteria[].assignmentQuestionId | string | ID of the assignment question this criteria is associated with (if applicable) |

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
      "rubricCriteriaOrder": [
        {
          "rubricCriteriaId": "95671161-3034-428b-a8fd-d95608ee6ce5",
          "index": 0
        }
      ],
      "createdAt": "2025-11-08T22:15:51.597Z",
      "updatedAt": "2025-11-08T22:15:51.597Z",
      "rubricCriteria": [
        {
          "id": "95671161-3034-428b-a8fd-d95608ee6ce5",
          "name": "Content Quality",
          "description": "Quality and depth of content",
          "weight": 25,
          "levelName": "Excellent",
          "levelDescription": "High-quality content with excellent depth",
          "createdAt": "2025-11-08T22:15:51.600Z",
          "updatedAt": "2025-11-08T22:15:51.600Z",
          "assignmentQuestionId": null
        }
      ]
    }
  }
}
```

### Error Responses
| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 400 | "Name is required" | When name is provided but is empty |
| 400 | "Weight must be a non-negative integer" | When weight is provided but is negative |
| 400 | "Invalid connection type. Must be 'existing' or 'new'" | When an invalid connection type is provided |
| 404 | "Rubric criteria with ID X not found" | When attempting to connect a non-existent rubric criteria |

## Usage

This endpoint is used to create new rubric templates with optional associated criteria. It's particularly useful when you need to:

1. Create reusable rubric templates for common evaluation scenarios
2. Build templates with predefined sets of criteria
3. Establish standard evaluation frameworks that can be applied across multiple assessments
4. Create template libraries for different types of assignments

Note: The template can be created with or without criteria. Criteria can be added later using the "Add Criteria to Rubric Template" endpoint.

---

# Add Criteria to Rubric Template API

## Endpoint
`POST /rubrics/rubric-templates/:id/rubric-criteria`

## Description
Adds rubric criteria to an existing rubric template, either by creating new criteria or connecting existing ones. This endpoint allows you to build up the rubric system for a template with proper ordering.

## Request

### Headers
- `Content-Type: application/json`

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | The unique identifier of the rubric template to add criteria to |

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| rubricCriteriaConnections | array | No | Optional array of rubric criteria connections to add to the template |

For rubric criteria connections:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
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
1. Each connection must have a valid type ("new" or "existing")
2. Index values must be non-negative integers
3. For new criteria, all data fields are required and must meet minimum length requirements
4. For existing criteria, the rubricCriteriaId must reference an existing rubric criteria

### Example Request (Adding New Criteria)
```bash
curl -X POST "http://18.171.208.170:4040/rubrics/rubric-templates/61cbb30e-3cc3-4b41-bce5-dc5d69005ad5/rubric-criteria" \
  -H "Content-Type: application/json" \
  -d '{
    "rubricCriteriaConnections": [
      {
        "type": "new",
        "data": {
          "name": "Grammar and Mechanics",
          "description": "Correct use of grammar and mechanics",
          "weight": 15,
          "levels": [
            {
              "name": "Excellent",
              "description": "Excellent use of grammar and mechanics with minimal errors",
              "weight": 100
            },
            {
              "name": "Good",
              "description": "Good use of grammar and mechanics with few errors",
              "weight": 75
            },
            {
              "name": "Satisfactory",
              "description": "Basic use of grammar and mechanics with some errors",
              "weight": 50
            }
          ]
        },
        "index": 2
      }
    ]
  }'
```

### Example Request (Connecting Existing Criteria)
```bash
curl -X POST "http://18.171.208.170:4040/rubrics/rubric-templates/61cbb30e-3cc3-4b41-bce5-dc5d69005ad5/rubric-criteria" \
  -H "Content-Type: application/json" \
  -d '{
    "rubricCriteriaConnections": [
      {
        "type": "existing",
        "rubricCriteriaId": "9d00d528-2fb3-4951-837f-516641f9fecb",
        "index": 1
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
| message | string | "Rubric criteria added to template successfully" |
| data.rubricTemplate.id | string | Unique identifier of the rubric template |
| data.rubricTemplate.name | string | Name of the rubric template |
| data.rubricTemplate.rubricCriteriaOrder | any | The order of rubric criteria in the template |
| data.rubricTemplate.createdAt | string (date) | Creation timestamp of the rubric template |
| data.rubricTemplate.updatedAt | string (date) | Last update timestamp of the rubric template |
| data.rubricTemplate.rubricCriteria | array | Array of rubric criteria associated with this template |
| data.rubricTemplate.rubricCriteria[].id | string | Unique identifier of the rubric criteria |
| data.rubricTemplate.rubricCriteria[].name | string | Name of the rubric criteria |
| data.rubricTemplate.rubricCriteria[].description | string | Description of the rubric criteria |
| data.rubricTemplate.rubricCriteria[].weight | number | Weight of the rubric criteria |
| data.rubricTemplate.rubricCriteria[].levelName | string | Name of the evaluation level |
| data.rubricTemplate.rubricCriteria[].levelDescription | string | Description of the evaluation level |
| data.rubricTemplate.rubricCriteria[].createdAt | string (date) | Creation timestamp of the rubric criteria |
| data.rubricTemplate.rubricCriteria[].updatedAt | string (date) | Last update timestamp of the rubric criteria |
| data.rubricTemplate.rubricCriteria[].assignmentQuestionId | string | ID of the assignment question this criteria is associated with (if applicable) |

### Example Success Response
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Rubric criteria added to template successfully",
  "data": {
    "rubricTemplate": {
      "id": "61cbb30e-3cc3-4b41-bce5-dc5d69005ad5",
      "name": "Essay Evaluation Template",
      "rubricCriteriaOrder": [
        {
          "rubricCriteriaId": "95671161-3034-428b-a8fd-d95608ee6ce5",
          "index": 0
        }
      ],
      "createdAt": "2025-11-08T22:15:51.597Z",
      "updatedAt": "2025-11-08T22:15:51.597Z",
      "rubricCriteria": [
        {
          "id": "95671161-3034-428b-a8fd-d95608ee6ce5",
          "name": "Content Quality",
          "description": "Quality and depth of content",
          "weight": 25,
          "levelName": "Excellent",
          "levelDescription": "High-quality content with excellent depth",
          "createdAt": "2025-11-08T22:15:51.600Z",
          "updatedAt": "2025-11-08T22:15:51.600Z",
          "assignmentQuestionId": null
        }
      ]
    }
  }
}
```

### Error Responses
| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 400 | "Weight must be a non-negative integer" | When weight is provided but is negative |
| 400 | "Name is required" | When name is provided but is empty |
| 400 | "Invalid connection type. Must be 'existing' or 'new'" | When an invalid connection type is provided |
| 404 | "Rubric template not found" | When no rubric template exists with the provided ID |
| 404 | "Rubric criteria with ID X not found" | When attempting to connect a non-existent rubric criteria |

## Usage

This endpoint is used to add rubric criteria to an existing template, either by creating new criteria or connecting existing ones. It's particularly useful when you need to:

1. Build up a rubric template over time with multiple criteria
2. Apply existing rubric criteria to a template
3. Create a complete rubric system by adding various criteria with specific ordering
4. Enhance templates by adding additional evaluation dimensions

Note: The endpoint supports both creating new criteria and connecting existing ones, providing flexibility in rubric template management.

---

# Get Single Rubric Criteria API

## Endpoint
`GET /rubrics/rubric-criteria/:id`

## Description
Retrieves a specific rubric criteria by its unique identifier. Returns complete information about the rubric criteria including its associated template or assignment question.

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
| data.rubricCriteria.assignmentQuestionId | string | ID of the assignment question this criteria is connected to (if applicable) |
| data.rubricCriteria.rubricTemplateId | string | ID of the rubric template this criteria is connected to (if applicable) |

### Example Request
```bash
curl -X GET "http://18.171.208.170:4040/rubrics/rubric-criteria/9d00d528-2fb3-4951-837f-516641f9fecb"
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
      "createdAt": "2025-11-08T22:09:05.795Z",
      "updatedAt": "2025-11-08T22:09:05.795Z",
      "assignmentQuestionId": null,
      "rubricTemplateId": "61cbb30e-3cc3-4b41-bce5-dc5d69005ad5"
    }
  }
}
```

### Error Responses
| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 404 | "Rubric criteria not found" | When no rubric criteria exists with the provided ID |

## Usage

This endpoint is used to retrieve a specific rubric criteria when you know its unique ID. It's particularly useful when you need to:

1. Load a specific rubric criteria for editing or review
2. Display detailed information about a single rubric criteria
3. Fetch criteria details for a specific rubric criteria ID
4. Get rubric criteria information to display in management interfaces

Note: The endpoint returns the complete rubric criteria information including its associated template or assignment question ID.

---

# Update Rubric Criteria API

## Endpoint
`PUT /rubrics/rubric-criteria/:id`

## Description
Updates an existing rubric criteria with the provided details. Only non-relational fields can be updated (name, description, weight, levelName, levelDescription). This allows for updating rubric criteria information without changing associations.

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

### Example Request
```bash
curl -X PUT "http://18.171.208.170:4040/rubrics/rubric-criteria/9d00d528-2fb3-4951-837f-516641f9fecb" \
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
| data.rubricCriteria.assignmentQuestionId | string | ID of the assignment question this criteria is connected to (if applicable) |

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
      "assignmentQuestionId": null
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

## Usage

This endpoint is used to update specific fields of an existing rubric criteria. It's particularly useful when you need to:

1. Modify rubric criteria names or descriptions
2. Adjust evaluation weights
3. Update level names or descriptions
4. Correct errors in rubric criteria information

Note: Only non-relational fields can be updated through this endpoint, ensuring that associations between rubric criteria and templates or assignment questions are preserved.

---

# Update Rubric Criteria Index in Template API

## Endpoint
`PUT /rubrics/rubric-criteria/:id/index`

## Description
Updates the position index of a specific rubric criteria within a rubric template. When a rubric criteria's index is changed, the template's rubricCriteriaOrder is automatically updated to reflect the new position, and other rubric criteria are reindexed accordingly to maintain sequential ordering.

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
2. `index` must not be greater than the total number of rubric criteria in the template minus 1
3. The rubric criteria must exist in the template's current order list

### Example Request
```bash
curl -X PUT "http://18.171.208.170:4040/rubrics/rubric-criteria/9d00d528-2fb3-4951-837f-516641f9fecb/index" \
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
| message | string | "Rubric criteria index in template updated successfully" |
| data.rubricTemplate.id | string | Unique identifier of the rubric template |
| data.rubricTemplate.name | string | Name of the rubric template |
| data.rubricTemplate.rubricCriteriaOrder | any | The updated order of rubric criteria in the template |
| data.rubricTemplate.createdAt | string (date) | Creation timestamp of the rubric template |
| data.rubricTemplate.updatedAt | string (date) | Last update timestamp of the rubric template |
| data.rubricTemplate.rubricCriteria | array | Array of sorted rubric criteria objects in the new order |
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
| data.rubricTemplate.rubricCriteria[].assignmentQuestionId | string | ID of the assignment question this criteria is connected to (if applicable) |

### Example Success Response
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Rubric criteria index in template updated successfully",
  "data": {
    "rubricTemplate": {
      "id": "61cbb30e-3cc3-4b41-bce5-dc5d69005ad5",
      "name": "Essay Evaluation Template",
      "rubricCriteriaOrder": [
        {
          "rubricCriteriaId": "9d00d528-2fb3-4951-837f-516641f9fecb",
          "index": 0
        }
      ],
      "createdAt": "2025-11-08T22:15:51.597Z",
      "updatedAt": "2025-11-08T22:15:51.597Z",
      "rubricCriteria": [
        {
          "id": "9d00d528-2fb3-4951-837f-516641f9fecb",
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
          ],
          "createdAt": "2025-11-08T22:09:05.795Z",
          "updatedAt": "2025-11-08T22:12:01.140Z",
          "assignmentQuestionId": null
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
| 404 | "Associated rubric template not found" | When the rubric criteria exists but its associated rubric template does not |
| 404 | "Rubric criteria not found in order list" | When the rubric criteria doesn't exist in the template's current order list |

## Usage

This endpoint is used to change the position of a rubric criteria within a template. It's particularly useful when you need to:

1. Reorder rubric criteria for better evaluation flow
2. Move important criteria to more prominent positions
3. Adjust the order of criteria after adding or modifying criteria
4. Organize criteria by importance or evaluation sequence

Note: When a criteria's index changes, all other criteria in the template are automatically repositioned to maintain sequential ordering starting from 0.

---

# Delete Rubric Criteria API

## Endpoint
`DELETE /rubrics/rubric-criteria/:id`

## Description
Deletes a specific rubric criteria by its unique identifier. When a rubric criteria is deleted, the template's rubricCriteriaOrder is automatically updated to remove the criteria and reindex the remaining criteria to maintain sequential ordering.

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
| data.rubricCriteria.levels | array | Array of levels for this rubric criteria |
| data.rubricCriteria.levels[].name | string | Name of the evaluation level |
| data.rubricCriteria.levels[].description | string | Description of the evaluation level |
| data.rubricCriteria.levels[].weight | number | Weight of the evaluation level |
| data.rubricCriteria.createdAt | string (date) | Creation timestamp of the rubric criteria |
| data.rubricCriteria.updatedAt | string (date) | Last update timestamp of the rubric criteria |
| data.rubricCriteria.assignmentQuestionId | string | ID of the assignment question this criteria was connected to (if applicable) |

### Example Request
```bash
curl -X DELETE "http://18.171.208.170:4040/rubrics/rubric-criteria/9d00d528-2fb3-4951-837f-516641f9fecb"
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
      "createdAt": "2025-11-08T22:09:05.795Z",
      "updatedAt": "2025-11-08T22:12:01.140Z",
      "assignmentQuestionId": null
    }
  }
}
```

### Error Responses
| Status Code | Error Message | Description |
|-------------|---------------|-------------|
| 404 | "Rubric criteria not found" | When no rubric criteria exists with the provided ID |
| 404 | "Associated rubric template not found" | When the rubric criteria exists but its associated rubric template does not |

## Usage

This endpoint is used to permanently remove a rubric criteria from a template. It's particularly useful when you need to:

1. Remove unwanted or outdated evaluation criteria
2. Clean up test criteria or duplicates
3. Update rubric systems by removing irrelevant criteria
4. Manage evaluation frameworks by removing specific criteria

Note: When a criteria is deleted, the system automatically maintains the proper ordering of remaining criteria by reindexing the rubricCriteriaOrder array in the associated template.
