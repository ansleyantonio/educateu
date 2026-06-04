# Student Portal Upload APIs

This document details the file upload and download APIs available in the student portal.

## Table of Contents
- [Upload File](#upload-file)
- [Download File](#download-file)

## Upload File

Uploads a file to the server. This endpoint allows students to upload files that can be used for assignments, discussions, or other course-related activities.

### Endpoint
```
POST /student-portal/uploads
```

### Authentication
- JWT token required in Authorization header
- User must be authenticated as a student

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Yes | The file to be uploaded (supports various formats depending on system configuration) |

### Response
#### Success Response (201 Created)
```json
{
  "status": "success",
  "statusCode": 201,
  "message": "File uploaded successfully",
  "data": {
    "file": {
      "fieldname": "string",
      "originalname": "string",
      "encoding": "string",
      "mimetype": "string",
      "size": "number",
      "location": "string",
      "key": "string"
    }
  }
}
```

#### Error Response (400 Bad Request)
```json
{
  "status": "error",
  "errorCode": "VALIDATION_ERROR",
  "message": "File is required"
}
```

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
curl -X POST \
  "https://api.educateu.com/student-portal/uploads" \
  -H "Authorization: Bearer <jwt_token>" \
  -F "file=@/path/to/your/file.pdf"
```

### Notes
- Files are validated for type and size according to system configuration
- The uploaded file's location and key are returned for reference
- The key can be used to download the file later

## Download File

Downloads a file by its unique key. This endpoint allows students to download files that have been previously uploaded.

### Endpoint
```
GET /student-portal/uploads/:fileKey
```

### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| fileKey | string | The unique identifier of the file to download |

### Authentication
- JWT token required in Authorization header
- User must be authenticated as a student

### Headers
```
Authorization: Bearer <jwt_token>
```

### Response
#### Success Response (200 OK)
Returns the file content directly. The response will have the appropriate content-type header based on the file type.

#### Error Response (401 Unauthorized)
```json
{
  "status": "error",
  "errorCode": "UNAUTHORIZED",
  "message": "Student information not found in request"
}
```

#### Error Response (404 Not Found)
```json
{
  "status": "error",
  "errorCode": "FILE_NOT_FOUND",
  "message": "File not found"
}
```

### Example Request
```bash
curl -X GET \
  "https://api.educateu.com/student-portal/uploads/example-file-key" \
  -H "Authorization: Bearer <jwt_token>"
```

### Notes
- The file key is returned when uploading a file
- The response returns the actual file content with appropriate headers
- Access control ensures students can only download files they have permission to access