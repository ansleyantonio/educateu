# Assessment Module API Documentation - Awarding Bodies

## Base URL
All API endpoints are relative to: `http://18.171.208.170:4040`

This module provides APIs for managing awarding bodies for assessments in the system. Each API serves a specific function within the assessment management workflow.

---

# Get Awarding Bodies API

## Endpoint
`GET /assessments/awarding-bodies`

## Description
Fetches a list of available awarding bodies that can be used when creating assessments. **This endpoint is a prerequisite for creating DEGREE and DIPLOMA assessments**, as those assessment types require an awardingBodyId to be provided during creation.

## Request

### Headers
- `Content-Type: application/json` (optional for GET requests)

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number for pagination (default: 1) |
| pageSize | number | No | Number of items per page (default: 10) |
| search | string | No | Search term to filter awarding bodies by name or abbreviation |
| status | string | No | Filter by status ("ACTIVE" or "INACTIVE") |
| intakePeriod | string or array | No | Filter by intake period ("january-april", "may-august", "september-december") |
| selectRequiredDocuments | string or array | No | Filter by required documents (e.g., "passport-id", "transcripts", "cv", etc.) |

### Example Request
```bash
curl -X GET "http://18.171.208.170:4040/assessments/awarding-bodies?page=1&pageSize=10&search=university&status=ACTIVE"
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
| data.awardingBodies | array | Array of awarding body objects |
| data.awardingBodies[].id | string | Unique identifier of the awarding body |
| data.awardingBodies[].name | string | Full name of the awarding body |
| data.awardingBodies[].code | string | Unique code of the awarding body |
| data.awardingBodies[].abbreviation | string | Abbreviation of the awarding body |
| data.awardingBodies[].status | string | Status of the awarding body - "ACTIVE" or "INACTIVE" |
| data.awardingBodies[].intakePeriods | array | List of intake periods offered by the awarding body |
| data.awardingBodies[].requiredDocuments | array | List of required documents for applications |
| data.awardingBodies[].grades | array | List of grade classifications (stored in othersInfo field) |
| data.awardingBodies[].grades[].classification | string | Name of the classification |
| data.awardingBodies[].grades[].percentageRange | string | Percentage range for the classification |
| data.awardingBodies[].grades[].ukGpaEquivalent | number | UK GPA equivalent for the classification |
| data.awardingBodies[].createdAt | string (date) | Creation timestamp |
| data.awardingBodies[].updatedAt | string (date) | Last update timestamp |
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
    "awardingBodies": [
      {
        "id": "7691d747-d063-4b75-81d5-7e3d8f49114c",
        "name": "Professional Certification Board",
        "code": "PCB001",
        "abbreviation": "PCB",
        "status": "ACTIVE",
        "intakePeriods": [
          "september-december"
        ],
        "requiredDocuments": [
          "passport-id",
          "qualification",
          "personal-statement"
        ],
        "grades": [
          {
            "classification": "Professional Certificate",
            "percentageRange": "60-100%",
            "ukGpaEquivalent": 3
          }
        ],
        "createdAt": "2025-11-08T18:15:44.848Z",
        "updatedAt": "2025-11-08T18:15:44.848Z"
      }
    ]
  },
  "pagination": {
    "count": 1,
    "total": 1,
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

This endpoint is used to retrieve a list of available awarding bodies for use in assessments. It's particularly useful when you need to:

1. Retrieve awarding bodies before creating DEGREE or DIPLOMA assessments (which require awardingBodyId)
2. Display available awarding bodies to users for selection
3. Get awarding body information to include in assessment creation

Note: Assessment types DEGREE and DIPLOMA require an awarding body, while CPD and PROFESSIONAL assessments do not.