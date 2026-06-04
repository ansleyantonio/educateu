# Student Portal API Documentation - Discussion Forum APIs

## Base URL

All API endpoints are relative to: `http://localhost:3000`

This module provides APIs for managing discussion forums in the student portal system. Each API serves a specific function within the discussion forum workflow.

---

# Get Discussion Stats API

## Endpoint

`GET /student-portal/discussion-threads/stats`

## Description

Retrieves discussion forum statistics for the authenticated student across all their enrolled courses. This endpoint returns summary data including total threads, total replies, and recent threads created within the last 7 days.

## Request

### Headers

- `user-id`: [Student UUID] (Required)

### Example Request

```bash
curl -H "user-id: ace4a91e-1370-44af-be8c-d141acad9d05" "http://localhost:3000/student-portal/discussion-threads/stats"
```

## Response

### Success Response

- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body

| Field              | Type   | Description                                                    |
| ------------------ | ------ | -------------------------------------------------------------- |
| status             | string | "success"                                                      |
| statusCode         | number | 200                                                            |
| message            | string | "Discussion stats retrieved successfully"                      |
| data.totalThreads  | number | Total number of discussion threads across all enrolled courses |
| data.totalReplies  | number | Total number of replies/comments across all discussion threads |
| data.recentThreads | number | Number of threads created in the last 7 days                   |

### Example Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Discussion stats retrieved successfully",
  "data": {
    "totalThreads": 45,
    "totalReplies": 128,
    "recentThreads": 8
  }
}
```

### Error Responses

| Status Code | Error Message                              | Description                                            |
| ----------- | ------------------------------------------ | ------------------------------------------------------ |
| 401         | "Student information not found in request" | When no student information is attached to the request |
| 500         | Server error messages                      | When there's an internal server error                  |

## Usage

This endpoint is used to retrieve discussion forum statistics for the authenticated student. It's useful for:

1. Displaying summary cards on the discussion forum dashboard
2. Showing engagement metrics (total threads, replies)
3. Highlighting recent activity (threads created in last 7 days)

---

# Create Discussion Thread API

## Endpoint

`POST /student-portal/discussion-threads`

## Description

Creates a new discussion thread for the authenticated student. This endpoint allows students to start new discussions on various topics within their courses.

## Request

### Headers

- `Content-Type: application/json`

### Request Body

| Field           | Type          | Required | Description                                                           |
| --------------- | ------------- | -------- | --------------------------------------------------------------------- |
| title           | string        | Yes      | The title of the discussion thread (1-200 characters)                 |
| content         | string        | Yes      | The content of the discussion thread (1-5000 characters)              |
| category        | string        | Yes      | The category of the discussion thread (1-100 characters)              |
| sessionCourseId | string (UUID) | Yes      | The unique identifier of the session course this thread is related to |

### Example Request

```bash
curl -X POST -H "user-id: ace4a91e-1370-44af-be8c-d141acad9d05" -H "Content-Type: application/json" "http://localhost:3000/student-portal/discussion-threads" -d '{
  "title": "Sample Discussion Thread",
  "content": "This is a sample discussion thread content",
  "category": "General",
  "sessionCourseId": "94a85135-0f29-46be-a0d1-098cfc069aec"
}'
```

## Response

### Success Response

- Status Code: `201 Created`
- Content-Type: `application/json`

### Success Response Body

| Field                                 | Type              | Description                                                        |
| ------------------------------------- | ----------------- | ------------------------------------------------------------------ |
| status                                | string            | "success"                                                          |
| statusCode                            | number            | 201                                                                |
| message                               | string            | "Discussion thread created successfully"                           |
| data.discussionThread.id              | string            | Unique identifier of the created discussion thread                 |
| data.discussionThread.title           | string            | Title of the discussion thread                                     |
| data.discussionThread.content         | string            | Content of the discussion thread                                   |
| data.discussionThread.category        | string            | Category of the discussion thread                                  |
| data.discussionThread.creatorType     | string            | Type of the creator ("STUDENT" or "FACULTY")                       |
| data.discussionThread.createdAt       | string (datetime) | Creation timestamp of the discussion thread                        |
| data.discussionThread.updatedAt       | string (datetime) | Last update timestamp of the discussion thread                     |
| data.discussionThread.sessionCourseId | string            | Unique identifier of the session course this thread is related to  |
| data.discussionThread.studentId       | string            | Unique identifier of the student who created the thread (nullable) |
| data.discussionThread.facultyId       | string            | Unique identifier of the faculty who created the thread (nullable) |

### Example Success Response

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Discussion thread created successfully",
  "data": {
    "discussionThread": {
      "id": "1d7205a8-596d-4011-baf5-dc75034fa5a5",
      "title": "Sample Discussion Thread",
      "content": "This is a sample discussion thread content",
      "category": "General",
      "creatorType": "STUDENT",
      "createdAt": "2026-01-15T09:16:39.467Z",
      "updatedAt": "2026-01-15T09:16:39.467Z",
      "sessionCourseId": "94a85135-0f29-46be-a0d1-098cfc069aec",
      "studentId": "ace4a91e-1370-44af-be8c-d141acad9d05",
      "facultyId": null
    }
  }
}
```

### Error Responses

| Status Code | Error Message                              | Description                                                                                     |
| ----------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| 400         | Validation error messages                  | When request body doesn't meet validation criteria (e.g., title/content too long, invalid UUID) |
| 401         | "Student information not found in request" | When no student information is attached to the request                                          |
| 500         | Server error messages                      | When there's an internal server error                                                           |

## Usage

This endpoint is used to create new discussion threads for students. It's particularly useful when you need to:

1. Allow students to start new discussions on course topics
2. Create categorized discussions for better organization
3. Enable peer-to-peer learning through discussions
4. Facilitate communication within course communities

---

# Get Discussion Threads API

## Endpoint

`GET /student-portal/discussion-threads`

## Description

Retrieves a list of discussion threads for the authenticated student. This endpoint returns all discussion threads the student has created or participated in, with optional filtering and pagination.

## Request

### Query Parameters

+| Parameter | Type | Required | Default | Description |
+|-----------|------|----------|---------|-------------|
+| **sessionCourseId** | string (UUID) | No | – | Filter threads belonging to a specific session‑course. |
+| **category** | string | No | – | Filter by thread category (e.g., `General`, `Assignments`). |
+| **sortBy** | string | No | `LATEST` | Sort order: `LATEST` (newest first) or `POPULAR` (most commented first). |
+| **page** | number | No | 1 | Pagination page number (positive integer). |
+| **pageSize** | number | No | 10 | Number of threads per page (1‑100). |

- +### Example Request with Sorting
  +```bash
  +curl -H "user-id: ace4a91e-1370-44af-be8c-d141acad9d05" \
- "http://localhost:3000/student-portal/discussion-threads?sortBy=POPULAR&category=General&page=1&pageSize=5"
  +```
- +---
- +# Get Discussion Threads API
- +## Endpoint +`GET /student-portal/discussion-threads`
- +## Description
  +Retrieves a list of discussion threads for the authenticated student. This endpoint returns all discussion threads the student has created or participated in, with optional filtering and pagination.
- +## Request
- +## Query Parameters

## Response

### Success Response

- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body

| Field                          | Type              | Description                                                        |
| ------------------------------ | ----------------- | ------------------------------------------------------------------ |
| status                         | string            | "success"                                                          |
| statusCode                     | number            | 200                                                                |
| message                        | string            | "Discussion threads retrieved successfully"                        |
| data.threads                   | array             | Array of discussion thread objects                                 |
| data.threads[].id              | string            | Unique identifier of the discussion thread                         |
| data.threads[].title           | string            | Title of the discussion thread                                     |
| data.threads[].content         | string            | Content of the discussion thread                                   |
| data.threads[].category        | string            | Category of the discussion thread                                  |
| data.threads[].creatorType     | string            | Type of the creator ("STUDENT" or "FACULTY")                       |
| data.threads[].createdAt       | string (datetime) | Creation timestamp of the discussion thread                        |
| data.threads[].updatedAt       | string (datetime) | Last update timestamp of the discussion thread                     |
| data.threads[].sessionCourseId | string            | Unique identifier of the session course this thread is related to  |
| data.threads[].studentId       | string            | Unique identifier of the student who created the thread (nullable) |
| data.threads[].facultyId       | string            | Unique identifier of the faculty who created the thread (nullable) |
| pagination                     | object            | Pagination information                                             |
| pagination.page                | number            | Current page number                                                |
| pagination.pageSize            | number            | Number of items per page                                           |
| pagination.totalCount          | number            | Total number of items matching the query                           |

### Example Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Discussion threads retrieved successfully",
  "data": {
    "threads": [
      {
        "id": "1d7205a8-596d-4011-baf5-dc75034fa5a5",
        "title": "Sample Discussion Thread",
        "content": "This is a sample discussion thread content",
        "category": "General",
        "creatorType": "STUDENT",
        "createdAt": "2026-01-15T09:16:39.467Z",
        "updatedAt": "2026-01-15T09:16:39.467Z",
        "sessionCourseId": "94a85135-0f29-46be-a0d1-098cfc069aec",
        "studentId": "ace4a91e-1370-44af-be8c-d141acad9d05",
        "facultyId": null
      },
      {
        "id": "5dd56ef7-1312-40d6-bfab-e88d3e4db960",
        "title": "Test Discussion Thread for Comments",
        "content": "This is a test discussion thread to test comments functionality.",
        "category": "general",
        "creatorType": "STUDENT",
        "createdAt": "2026-01-15T08:46:52.808Z",
        "updatedAt": "2026-01-15T08:46:52.808Z",
        "sessionCourseId": "94a85135-0f29-46be-a0d1-098cfc069aec",
        "studentId": "ace4a91e-1370-44af-be8c-d141acad9d05",
        "facultyId": null
      },
      {
        "id": "c882b6bc-cf57-4e77-b707-eb50fc5a03c2",
        "title": "Test Discussion Thread for Comments",
        "content": "This is a test discussion thread to test comments functionality.",
        "category": "general",
        "creatorType": "STUDENT",
        "createdAt": "2026-01-15T08:44:27.561Z",
        "updatedAt": "2026-01-15T08:44:27.561Z",
        "sessionCourseId": "94a85135-0f29-46be-a0d1-098cfc069aec",
        "studentId": "ace4a91e-1370-44af-be8c-d141acad9d05",
        "facultyId": null
      }
    ]
  },
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "totalCount": 3
  }
}
```

### Error Responses

| Status Code | Error Message                              | Description                                            |
| ----------- | ------------------------------------------ | ------------------------------------------------------ |
| 401         | "Student information not found in request" | When no student information is attached to the request |
| 500         | Server error messages                      | When there's an internal server error                  |

## Usage

This endpoint is used to retrieve discussion threads for the authenticated student. It's particularly useful when you need to:

1. Display all discussion threads for a student
2. Filter threads by course or category
3. Paginate through large numbers of threads
4. Provide an overview of student participation in discussions

---

# Get Discussion Thread API

## Endpoint

`GET /student-portal/discussion-threads/:discussionThreadId`

## Description

Retrieves a specific discussion thread by its unique identifier. This endpoint returns the complete details of a single discussion thread.

## Request

### Path Parameters

| Parameter          | Type          | Required | Description                                                |
| ------------------ | ------------- | -------- | ---------------------------------------------------------- |
| discussionThreadId | string (UUID) | Yes      | The unique identifier of the discussion thread to retrieve |

### Example Request

```bash
curl -H "user-id: ace4a91e-1370-44af-be8c-d141acad9d05" "http://localhost:3000/student-portal/discussion-threads/4ee59f42-23a7-401b-be69-a1464e9d539c"
```

## Response

### Success Response

- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body

| Field                                 | Type              | Description                                                        |
| ------------------------------------- | ----------------- | ------------------------------------------------------------------ |
| status                                | string            | "success"                                                          |
| statusCode                            | number            | 200                                                                |
| message                               | string            | "Discussion thread retrieved successfully"                         |
| data.discussionThread.id              | string            | Unique identifier of the discussion thread                         |
| data.discussionThread.title           | string            | Title of the discussion thread                                     |
| data.discussionThread.content         | string            | Content of the discussion thread                                   |
| data.discussionThread.category        | string            | Category of the discussion thread                                  |
| data.discussionThread.creatorType     | string            | Type of the creator ("STUDENT" or "FACULTY")                       |
| data.discussionThread.createdAt       | string (datetime) | Creation timestamp of the discussion thread                        |
| data.discussionThread.updatedAt       | string (datetime) | Last update timestamp of the discussion thread                     |
| data.discussionThread.sessionCourseId | string            | Unique identifier of the session course this thread is related to  |
| data.discussionThread.studentId       | string            | Unique identifier of the student who created the thread (nullable) |
| data.discussionThread.facultyId       | string            | Unique identifier of the faculty who created the thread (nullable) |

### Example Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Discussion thread retrieved successfully",
  "data": {
    "discussionThread": {
      "id": "1d7205a8-596d-4011-baf5-dc75034fa5a5",
      "title": "Updated Sample Discussion Thread",
      "content": "This is an updated sample discussion thread content",
      "category": "General",
      "creatorType": "STUDENT",
      "createdAt": "2026-01-15T09:16:39.467Z",
      "updatedAt": "2026-01-15T09:17:02.754Z",
      "sessionCourseId": "94a85135-0f29-46be-a0d1-098cfc069aec",
      "studentId": "ace4a91e-1370-44af-be8c-d141acad9d05",
      "facultyId": null
    }
  }
}
```

### Error Responses

| Status Code | Error Message                              | Description                                            |
| ----------- | ------------------------------------------ | ------------------------------------------------------ |
| 401         | "Student information not found in request" | When no student information is attached to the request |
| 404         | "Discussion thread not found"              | When no discussion thread exists with the provided ID  |
| 500         | Server error messages                      | When there's an internal server error                  |

## Usage

This endpoint is used to retrieve a specific discussion thread. It's particularly useful when you need to:

1. Display a single discussion thread to the student
2. Load a specific thread for viewing or replying
3. Access detailed information about a particular discussion

---

# Update Discussion Thread API

## Endpoint

`PATCH /student-portal/discussion-threads/:discussionThreadId`

## Description

Updates an existing discussion thread with the provided details. This endpoint allows students to modify their discussion threads, updating the title, content, or category.

## Request

### Headers

- `Content-Type: application/json`

### Path Parameters

| Parameter          | Type          | Required | Description                                              |
| ------------------ | ------------- | -------- | -------------------------------------------------------- |
| discussionThreadId | string (UUID) | Yes      | The unique identifier of the discussion thread to update |

### Request Body

| Field    | Type   | Required | Description                                                      |
| -------- | ------ | -------- | ---------------------------------------------------------------- |
| title    | string | No       | The updated title of the discussion thread (1-200 characters)    |
| content  | string | No       | The updated content of the discussion thread (1-5000 characters) |
| category | string | No       | The updated category of the discussion thread (1-100 characters) |

### Example Request

```bash
curl -X PATCH -H "user-id: ace4a91e-1370-44af-be8c-d141acad9d05" -H "Content-Type: application/json" "http://localhost:3000/student-portal/discussion-threads/1d7205a8-596d-4011-baf5-dc75034fa5a5" -d '{
  "title": "Updated Sample Discussion Thread",
  "content": "This is an updated sample discussion thread content"
}'
```

## Response

### Success Response

- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body

| Field                                 | Type              | Description                                                        |
| ------------------------------------- | ----------------- | ------------------------------------------------------------------ |
| status                                | string            | "success"                                                          |
| statusCode                            | number            | 200                                                                |
| message                               | string            | "Discussion thread updated successfully"                           |
| data.discussionThread.id              | string            | Unique identifier of the updated discussion thread                 |
| data.discussionThread.title           | string            | Updated title of the discussion thread                             |
| data.discussionThread.content         | string            | Updated content of the discussion thread                           |
| data.discussionThread.category        | string            | Updated category of the discussion thread                          |
| data.discussionThread.creatorType     | string            | Type of the creator ("STUDENT" or "FACULTY")                       |
| data.discussionThread.createdAt       | string (datetime) | Creation timestamp of the discussion thread                        |
| data.discussionThread.updatedAt       | string (datetime) | Last update timestamp of the discussion thread                     |
| data.discussionThread.sessionCourseId | string            | Unique identifier of the session course this thread is related to  |
| data.discussionThread.studentId       | string            | Unique identifier of the student who created the thread (nullable) |
| data.discussionThread.facultyId       | string            | Unique identifier of the faculty who created the thread (nullable) |

### Example Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Discussion thread updated successfully",
  "data": {
    "discussionThread": {
      "id": "1d7205a8-596d-4011-baf5-dc75034fa5a5",
      "title": "Updated Sample Discussion Thread",
      "content": "This is an updated sample discussion thread content",
      "category": "General",
      "creatorType": "STUDENT",
      "createdAt": "2026-01-15T09:16:39.467Z",
      "updatedAt": "2026-01-15T09:17:02.754Z",
      "sessionCourseId": "94a85135-0f29-46be-a0d1-098cfc069aec",
      "studentId": "ace4a91e-1370-44af-be8c-d141acad9d05",
      "facultyId": null
    }
  }
}
```

### Error Responses

| Status Code | Error Message                              | Description                                                                       |
| ----------- | ------------------------------------------ | --------------------------------------------------------------------------------- |
| 400         | Validation error messages                  | When request body doesn't meet validation criteria (e.g., title/content too long) |
| 401         | "Student information not found in request" | When no student information is attached to the request                            |
| 404         | "Discussion thread not found"              | When no discussion thread exists with the provided ID                             |
| 500         | Server error messages                      | When there's an internal server error                                             |

## Usage

This endpoint is used to update discussion threads for students. It's particularly useful when you need to:

1. Allow students to edit their discussion posts
2. Update titles or content for clarity
3. Modify categories as discussions evolve
4. Correct errors in previously posted content

---

# Delete Discussion Thread API

## Endpoint

`DELETE /student-portal/discussion-threads/:discussionThreadId`

## Description

Deletes a specific discussion thread by its unique identifier. This operation is permanent and removes the thread and all associated comments.

## Request

### Path Parameters

| Parameter          | Type          | Required | Description                                              |
| ------------------ | ------------- | -------- | -------------------------------------------------------- |
| discussionThreadId | string (UUID) | Yes      | The unique identifier of the discussion thread to delete |

### Example Request

```bash
curl -X DELETE -H "user-id: ace4a91e-1370-44af-be8c-d141acad9d05" "http://localhost:3000/student-portal/discussion-threads/1d7205a8-596d-4011-baf5-dc75034fa5a5"
```

## Response

### Success Response

- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body

| Field        | Type    | Description                               |
| ------------ | ------- | ----------------------------------------- |
| status       | string  | "success"                                 |
| statusCode   | number  | 200                                       |
| message      | string  | "Discussion thread deleted successfully"  |
| data.success | boolean | Indicates if the operation was successful |
| data.message | string  | Confirmation message                      |

### Example Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Discussion thread deleted successfully",
  "data": {
    "success": true,
    "message": "Discussion thread deleted successfully"
  }
}
```

### Error Responses

| Status Code | Error Message                              | Description                                            |
| ----------- | ------------------------------------------ | ------------------------------------------------------ |
| 401         | "Student information not found in request" | When no student information is attached to the request |
| 404         | "Discussion thread not found"              | When no discussion thread exists with the provided ID  |
| 500         | Server error messages                      | When there's an internal server error                  |

## Usage

This endpoint is used to delete discussion threads for students. It's particularly useful when you need to:

1. Remove inappropriate or outdated discussions
2. Allow students to delete their own threads
3. Clean up duplicate or erroneous posts
4. Manage content quality in discussion forums

**Warning**: This operation is permanent and cannot be undone. All associated comments will also be deleted.

---

# Create Comment API

## Endpoint

`POST /student-portal/discussion-threads/:discussionThreadId/comments`

## Description

Creates a new comment on a specific discussion thread for the authenticated student. This endpoint allows students to participate in discussions by adding comments, including nested replies.

## Request

### Headers

- `Content-Type: application/json`

### Path Parameters

| Parameter          | Type          | Required | Description                                                  |
| ------------------ | ------------- | -------- | ------------------------------------------------------------ |
| discussionThreadId | string (UUID) | Yes      | The unique identifier of the discussion thread to comment on |

### Request Body

| Field           | Type          | Required | Description                                   |
| --------------- | ------------- | -------- | --------------------------------------------- |
| comment         | string        | Yes      | The comment content (1-2000 characters)       |
| parentCommentId | string (UUID) | No       | Optional parent comment ID for nested replies |

### Example Request

```bash
curl -X POST -H "user-id: ace4a91e-1370-44af-be8c-d141acad9d05" -H "Content-Type: application/json" "http://localhost:3000/student-portal/discussion-threads/2027bda8-a784-44b9-a8e5-a1d877f3cfe1/comments" -d '{
  "comment": "This is a test comment on the discussion thread."
}'
```

## Response

### Success Response

- Status Code: `201 Created`
- Content-Type: `application/json`

### Success Response Body

| Field                           | Type              | Description                                                         |
| ------------------------------- | ----------------- | ------------------------------------------------------------------- |
| status                          | string            | "success"                                                           |
| statusCode                      | number            | 201                                                                 |
| message                         | string            | "Comment created successfully"                                      |
| data.comment.id                 | string            | Unique identifier of the created comment                            |
| data.comment.comment            | string            | Content of the comment                                              |
| data.comment.likes              | number            | Number of likes on the comment                                      |
| data.comment.views              | number            | Number of views on the comment                                      |
| data.comment.commenterType      | string            | Type of the commenter ("STUDENT" or "FACULTY")                      |
| data.comment.createdAt          | string (datetime) | Creation timestamp of the comment                                   |
| data.comment.updatedAt          | string (datetime) | Last update timestamp of the comment                                |
| data.comment.studentId          | string            | Unique identifier of the student who created the comment (nullable) |
| data.comment.facultyId          | string            | Unique identifier of the faculty who created the comment (nullable) |
| data.comment.discussionThreadId | string            | Unique identifier of the discussion thread the comment belongs to   |
| data.comment.parentCommentId    | string            | Unique identifier of the parent comment (nullable)                  |

### Example Success Response

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Comment created successfully",
  "data": {
    "comment": {
      "id": "4f32f972-a206-4cc7-9116-febd27ea0321",
      "comment": "This is a test comment on the discussion thread.",
      "likes": 0,
      "views": 0,
      "commenterType": "STUDENT",
      "createdAt": "2026-01-15T09:28:45.337Z",
      "updatedAt": "2026-01-15T09:28:45.337Z",
      "studentId": "ace4a91e-1370-44af-be8c-d141acad9d05",
      "facultyId": null,
      "discussionThreadId": "2027bda8-a784-44b9-a8e5-a1d877f3cfe1",
      "parentCommentId": null
    }
  }
}
```

### Error Responses

| Status Code | Error Message                              | Description                                                                               |
| ----------- | ------------------------------------------ | ----------------------------------------------------------------------------------------- |
| 400         | Validation error messages                  | When request body doesn't meet validation criteria (e.g., comment too long, invalid UUID) |
| 401         | "Student information not found in request" | When no student information is attached to the request                                    |
| 500         | Server error messages                      | When there's an internal server error                                                     |

## Usage

This endpoint is used to create comments on discussion threads for students. It's particularly useful when you need to:

1. Allow students to participate in discussions
2. Enable nested replies to specific comments
3. Foster community engagement in course discussions
4. Provide a way for students to share insights and ask questions

---

# Get Comment API

## Endpoint

`GET /student-portal/comments/:commentId`

## Description

Retrieves a specific comment by its unique identifier. This endpoint returns the complete details of a single comment including all its replies in a hierarchical structure.

## Request

### Path Parameters

| Parameter | Type          | Required | Description                                      |
| --------- | ------------- | -------- | ------------------------------------------------ |
| commentId | string (UUID) | Yes      | The unique identifier of the comment to retrieve |

### Example Request

```bash
curl -H "user-id: ace4a91e-1370-44af-be8c-d141acad9d05" "http://localhost:3000/student-portal/comments/3056eb55-cbe9-471d-b384-49a904668350"
```

## Response

### Success Response

- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body

| Field                                     | Type              | Description                                                         |
| ----------------------------------------- | ----------------- | ------------------------------------------------------------------- |
| status                                    | string            | "success"                                                           |
| statusCode                                | number            | 200                                                                 |
| message                                   | string            | "Comment retrieved successfully"                                    |
| data.comment.id                           | string            | Unique identifier of the comment                                    |
| data.comment.comment                      | string            | Content of the comment                                              |
| data.comment.likes                        | number            | Number of likes on the comment                                      |
| data.comment.views                        | number            | Number of views on the comment                                      |
| data.comment.commenterType                | string            | Type of the commenter ("STUDENT" or "FACULTY")                      |
| data.comment.createdAt                    | string (datetime) | Creation timestamp of the comment                                   |
| data.comment.updatedAt                    | string (datetime) | Last update timestamp of the comment                                |
| data.comment.studentId                    | string            | Unique identifier of the student who created the comment (nullable) |
| data.comment.facultyId                    | string            | Unique identifier of the faculty who created the comment (nullable) |
| data.comment.discussionThreadId           | string            | Unique identifier of the discussion thread the comment belongs to   |
| data.comment.parentCommentId              | string            | Unique identifier of the parent comment (nullable)                  |
| data.comment.replies                      | array             | Array of reply comments (nested structure)                          |
| data.comment.replies[].id                 | string            | Unique identifier of the reply comment                              |
| data.comment.replies[].comment            | string            | Content of the reply comment                                        |
| data.comment.replies[].likes              | number            | Number of likes on the reply comment                                |
| data.comment.replies[].views              | number            | Number of views on the reply comment                                |
| data.comment.replies[].commenterType      | string            | Type of the commenter ("STUDENT" or "FACULTY")                      |
| data.comment.replies[].createdAt          | string (datetime) | Creation timestamp of the reply comment                             |
| data.comment.replies[].updatedAt          | string (datetime) | Last update timestamp of the reply comment                          |
| data.comment.replies[].studentId          | string            | Unique identifier of the student who created the reply (nullable)   |
| data.comment.replies[].facultyId          | string            | Unique identifier of the faculty who created the reply (nullable)   |
| data.comment.replies[].discussionThreadId | string            | Unique identifier of the discussion thread the reply belongs to     |
| data.comment.replies[].parentCommentId    | string            | Unique identifier of the parent comment (the current comment)       |
| data.comment.replies[].replies            | array             | Nested replies to this reply (recursive structure)                  |

### Example Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Comment retrieved successfully",
  "data": {
    "comment": {
      "id": "3056eb55-cbe9-471d-b384-49a904668350",
      "comment": "This is a sample comment on the discussion thread",
      "likes": 0,
      "views": 0,
      "commenterType": "STUDENT",
      "createdAt": "2026-01-15T09:17:07.192Z",
      "updatedAt": "2026-01-15T09:17:07.192Z",
      "studentId": "ace4a91e-1370-44af-be8c-d141acad9d05",
      "facultyId": null,
      "discussionThreadId": "1d7205a8-596d-4011-baf5-dc75034fa5a5",
      "parentCommentId": null,
      "replies": [
        {
          "id": "4567eb55-cbe9-471d-b384-49a904668351",
          "comment": "This is a reply to the sample comment",
          "likes": 1,
          "views": 2,
          "commenterType": "STUDENT",
          "createdAt": "2026-01-15T09:18:07.192Z",
          "updatedAt": "2026-01-15T09:18:07.192Z",
          "studentId": "ace4a91e-1370-44af-be8c-d141acad9d05",
          "facultyId": null,
          "discussionThreadId": "1d7205a8-596d-4011-baf5-dc75034fa5a5",
          "parentCommentId": "3056eb55-cbe9-471d-b384-49a904668350",
          "replies": []
        }
      ]
    }
  }
}
```

### Error Responses

| Status Code | Error Message                              | Description                                            |
| ----------- | ------------------------------------------ | ------------------------------------------------------ |
| 401         | "Student information not found in request" | When no student information is attached to the request |
| 404         | "Comment not found"                        | When no comment exists with the provided ID            |
| 500         | Server error messages                      | When there's an internal server error                  |

## Usage

This endpoint is used to retrieve a specific comment with its replies. It's particularly useful when you need to:

1. Display a single comment with its reply thread to the student
2. Load a specific comment for viewing, replying, or interacting with its replies
3. Access detailed information about a particular comment and its discussion context

---

# Update Comment Likes API

## Endpoint

`PATCH /student-portal/comments/:commentId/likes`

## Description

Updates the likes count for a specific comment by its unique identifier. This endpoint increments or decrements the like count based on the request.

## Request

### Path Parameters

| Parameter | Type          | Required | Description                                              |
| --------- | ------------- | -------- | -------------------------------------------------------- |
| commentId | string (UUID) | Yes      | The unique identifier of the comment to update likes for |

### Request Body

| Field     | Type    | Required | Default | Description                                                     |
| --------- | ------- | -------- | ------- | --------------------------------------------------------------- |
| increment | boolean | No       | true    | Whether to increment (true) or decrement (false) the like count |

### Example Request (Increment)

```bash
curl -X PATCH -H "user-id: ace4a91e-1370-44af-be8c-d141acad9d05" -H "Content-Type: application/json" "http://localhost:3000/student-portal/comments/3056eb55-cbe9-471d-b384-49a904668350/likes" -d '{
  "increment": true
}'
```

### Example Request (Decrement)

```bash
curl -X PATCH -H "user-id: ace4a91e-1370-44af-be8c-d141acad9d05" -H "Content-Type: application/json" "http://localhost:3000/student-portal/comments/3056eb55-cbe9-471d-b384-49a904668350/likes" -d '{
  "increment": false
}'
```

## Response

### Success Response

- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body

| Field                           | Type              | Description                                                         |
| ------------------------------- | ----------------- | ------------------------------------------------------------------- |
| status                          | string            | "success"                                                           |
| statusCode                      | number            | 200                                                                 |
| message                         | string            | "Comment likes updated successfully"                                |
| data.comment.id                 | string            | Unique identifier of the comment                                    |
| data.comment.comment            | string            | Content of the comment                                              |
| data.comment.likes              | number            | Updated number of likes on the comment                              |
| data.comment.views              | number            | Number of views on the comment                                      |
| data.comment.commenterType      | string            | Type of the commenter ("STUDENT" or "FACULTY")                      |
| data.comment.createdAt          | string (datetime) | Creation timestamp of the comment                                   |
| data.comment.updatedAt          | string (datetime) | Last update timestamp of the comment                                |
| data.comment.studentId          | string            | Unique identifier of the student who created the comment (nullable) |
| data.comment.facultyId          | string            | Unique identifier of the faculty who created the comment (nullable) |
| data.comment.discussionThreadId | string            | Unique identifier of the discussion thread the comment belongs to   |
| data.comment.parentCommentId    | string            | Unique identifier of the parent comment (nullable)                  |
| data.comment.replies            | array             | Array of reply comments (nested structure)                          |

### Example Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Comment likes updated successfully",
  "data": {
    "comment": {
      "id": "3056eb55-cbe9-471d-b384-49a904668350",
      "comment": "This is a sample comment on the discussion thread",
      "likes": 1,
      "views": 0,
      "commenterType": "STUDENT",
      "createdAt": "2026-01-15T09:17:07.192Z",
      "updatedAt": "2026-01-15T09:17:07.192Z",
      "studentId": "ace4a91e-1370-44af-be8c-d141acad9d05",
      "facultyId": null,
      "discussionThreadId": "1d7205a8-596d-4011-baf5-dc75034fa5a5",
      "parentCommentId": null,
      "replies": []
    }
  }
}
```

### Error Responses

| Status Code | Error Message                              | Description                                                                        |
| ----------- | ------------------------------------------ | ---------------------------------------------------------------------------------- |
| 400         | Validation error messages                  | When request body doesn't meet validation criteria (e.g., invalid increment value) |
| 401         | "Student information not found in request" | When no student information is attached to the request                             |
| 404         | "Comment not found"                        | When no comment exists with the provided ID                                        |
| 500         | Server error messages                      | When there's an internal server error                                              |

## Usage

This endpoint is used to update the like count for a comment. It's particularly useful when you need to:

1. Allow students to like or unlike comments
2. Track engagement with specific comments
3. Update the popularity metric for comments

---

# Update Comment Views API

## Endpoint

`PATCH /student-portal/comments/:commentId/views`

## Description

Updates the views count for a specific comment by its unique identifier. This endpoint increments the view count when a comment is accessed.

## Request

### Path Parameters

| Parameter | Type          | Required | Description                                              |
| --------- | ------------- | -------- | -------------------------------------------------------- |
| commentId | string (UUID) | Yes      | The unique identifier of the comment to update views for |

### Example Request

```bash
curl -X PATCH -H "user-id: ace4a91e-1370-44af-be8c-d141acad9d05" -H "Content-Type: application/json" "http://localhost:3000/student-portal/comments/3056eb55-cbe9-471d-b384-49a904668350/views"
```

## Response

### Success Response

- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body

| Field                           | Type              | Description                                                         |
| ------------------------------- | ----------------- | ------------------------------------------------------------------- |
| status                          | string            | "success"                                                           |
| statusCode                      | number            | 200                                                                 |
| message                         | string            | "Comment views updated successfully"                                |
| data.comment.id                 | string            | Unique identifier of the comment                                    |
| data.comment.comment            | string            | Content of the comment                                              |
| data.comment.likes              | number            | Number of likes on the comment                                      |
| data.comment.views              | number            | Updated number of views on the comment                              |
| data.comment.commenterType      | string            | Type of the commenter ("STUDENT" or "FACULTY")                      |
| data.comment.createdAt          | string (datetime) | Creation timestamp of the comment                                   |
| data.comment.updatedAt          | string (datetime) | Last update timestamp of the comment                                |
| data.comment.studentId          | string            | Unique identifier of the student who created the comment (nullable) |
| data.comment.facultyId          | string            | Unique identifier of the faculty who created the comment (nullable) |
| data.comment.discussionThreadId | string            | Unique identifier of the discussion thread the comment belongs to   |
| data.comment.parentCommentId    | string            | Unique identifier of the parent comment (nullable)                  |
| data.comment.replies            | array             | Array of reply comments (nested structure)                          |

### Example Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Comment views updated successfully",
  "data": {
    "comment": {
      "id": "3056eb55-cbe9-471d-b384-49a904668350",
      "comment": "This is a sample comment on the discussion thread",
      "likes": 1,
      "views": 1,
      "commenterType": "STUDENT",
      "createdAt": "2026-01-15T09:17:07.192Z",
      "updatedAt": "2026-01-15T09:17:07.192Z",
      "studentId": "ace4a91e-1370-44af-be8c-d141acad9d05",
      "facultyId": null,
      "discussionThreadId": "1d7205a8-596d-4011-baf5-dc75034fa5a5",
      "parentCommentId": null,
      "replies": []
    }
  }
}
```

### Error Responses

| Status Code | Error Message                              | Description                                            |
| ----------- | ------------------------------------------ | ------------------------------------------------------ |
| 401         | "Student information not found in request" | When no student information is attached to the request |
| 404         | "Comment not found"                        | When no comment exists with the provided ID            |
| 500         | Server error messages                      | When there's an internal server error                  |

## Usage

This endpoint is used to update the view count for a comment. It's particularly useful when you need to:

1. Track how many times a comment has been viewed
2. Measure engagement with specific comments
3. Update the visibility metric for comments

---

# Get Comments API

## Endpoint

`GET /student-portal/discussion-threads/:discussionThreadId/comments`

## Description

Retrieves all comments for a specific discussion thread, with optional filtering by parent comment and pagination. This endpoint returns comments in the discussion thread.

## Request

### Path Parameters

| Parameter          | Type          | Required | Description                                                             |
| ------------------ | ------------- | -------- | ----------------------------------------------------------------------- |
| discussionThreadId | string (UUID) | Yes      | The unique identifier of the discussion thread to retrieve comments for |

### Query Parameters

| Parameter       | Type          | Required | Default | Description                                                      |
| --------------- | ------------- | -------- | ------- | ---------------------------------------------------------------- |
| parentCommentId | string (UUID) | No       | -       | Filter by parent comment ID to get replies to a specific comment |
| page            | number        | No       | 1       | Page number for pagination (must be a positive integer)          |
| pageSize        | number        | No       | 10      | Number of items per page (minimum 1, maximum 100)                |

### Example Request

```bash
curl -H "user-id: ace4a91e-1370-44af-be8c-d141acad9d05" "http://localhost:3000/student-portal/discussion-threads/2027bda8-a784-44b9-a8e5-a1d877f3cfe1/comments?page=1&pageSize=5"
```

## Response

### Success Response

- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body

| Field                              | Type              | Description                                                         |
| ---------------------------------- | ----------------- | ------------------------------------------------------------------- |
| status                             | string            | "success"                                                           |
| statusCode                         | number            | 200                                                                 |
| message                            | string            | "Comments retrieved successfully"                                   |
| data.comments                      | array             | Array of comment objects                                            |
| data.comments[].id                 | string            | Unique identifier of the comment                                    |
| data.comments[].comment            | string            | Content of the comment                                              |
| data.comments[].likes              | number            | Number of likes on the comment                                      |
| data.comments[].views              | number            | Number of views on the comment                                      |
| data.comments[].commenterType      | string            | Type of the commenter ("STUDENT" or "FACULTY")                      |
| data.comments[].createdAt          | string (datetime) | Creation timestamp of the comment                                   |
| data.comments[].updatedAt          | string (datetime) | Last update timestamp of the comment                                |
| data.comments[].studentId          | string            | Unique identifier of the student who created the comment (nullable) |
| data.comments[].facultyId          | string            | Unique identifier of the faculty who created the comment (nullable) |
| data.comments[].discussionThreadId | string            | Unique identifier of the discussion thread the comment belongs to   |
| data.comments[].parentCommentId    | string            | Unique identifier of the parent comment (nullable)                  |
| pagination                         | object            | Pagination information                                              |
| pagination.page                    | number            | Current page number                                                 |
| pagination.pageSize                | number            | Number of items per page                                            |
| pagination.totalCount              | number            | Total number of items matching the query                            |

### Example Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Comments retrieved successfully",
  "data": {
    "comments": [
      {
        "id": "4f32f972-a206-4cc7-9116-febd27ea0321",
        "comment": "This is a test comment on the discussion thread.",
        "likes": 0,
        "views": 0,
        "commenterType": "STUDENT",
        "createdAt": "2026-01-15T09:28:45.337Z",
        "updatedAt": "2026-01-15T09:28:45.337Z",
        "studentId": "ace4a91e-1370-44af-be8c-d141acad9d05",
        "facultyId": null,
        "discussionThreadId": "2027bda8-a784-44b9-a8e5-a1d877f3cfe1",
        "parentCommentId": null
      }
    ]
  },
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "totalCount": 1
  }
}
```

### Error Responses

| Status Code | Error Message                              | Description                                            |
| ----------- | ------------------------------------------ | ------------------------------------------------------ |
| 401         | "Student information not found in request" | When no student information is attached to the request |
| 500         | Server error messages                      | When there's an internal server error                  |

## Usage

This endpoint is used to retrieve comments for a discussion thread. It's particularly useful when you need to:

1. Display all comments in a discussion thread
2. Show replies to a specific comment by filtering with parentCommentId
3. Paginate through large numbers of comments
4. Load discussion content for viewing

---

# Update Comment API

## Endpoint

`PATCH /student-portal/comments/:commentId`

## Description

Updates an existing comment with the provided details. This endpoint allows students to modify their comments, updating the content.

## Request

### Headers

- `Content-Type: application/json`

### Path Parameters

| Parameter | Type          | Required | Description                                    |
| --------- | ------------- | -------- | ---------------------------------------------- |
| commentId | string (UUID) | Yes      | The unique identifier of the comment to update |

### Request Body

| Field   | Type   | Required | Description                                            |
| ------- | ------ | -------- | ------------------------------------------------------ |
| comment | string | No       | The updated content of the comment (1-2000 characters) |

### Example Request

```bash
curl -X PATCH -H "user-id: ace4a91e-1370-44af-be8c-d141acad9d05" -H "Content-Type: application/json" "http://localhost:3000/student-portal/comments/3056eb55-cbe9-471d-b384-49a904668350" -d '{
  "comment": "This is an updated sample comment on the discussion thread"
}'
```

## Response

### Success Response

- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body

| Field                           | Type              | Description                                                         |
| ------------------------------- | ----------------- | ------------------------------------------------------------------- |
| status                          | string            | "success"                                                           |
| statusCode                      | number            | 200                                                                 |
| message                         | string            | "Comment updated successfully"                                      |
| data.comment.id                 | string            | Unique identifier of the updated comment                            |
| data.comment.comment            | string            | Updated content of the comment                                      |
| data.comment.likes              | number            | Number of likes on the comment                                      |
| data.comment.views              | number            | Number of views on the comment                                      |
| data.comment.commenterType      | string            | Type of the commenter ("STUDENT" or "FACULTY")                      |
| data.comment.createdAt          | string (datetime) | Creation timestamp of the comment                                   |
| data.comment.updatedAt          | string (datetime) | Last update timestamp of the comment                                |
| data.comment.studentId          | string            | Unique identifier of the student who created the comment (nullable) |
| data.comment.facultyId          | string            | Unique identifier of the faculty who created the comment (nullable) |
| data.comment.discussionThreadId | string            | Unique identifier of the discussion thread the comment belongs to   |
| data.comment.parentCommentId    | string            | Unique identifier of the parent comment (nullable)                  |

### Example Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Comment updated successfully",
  "data": {
    "comment": {
      "id": "3056eb55-cbe9-471d-b384-49a904668350",
      "comment": "This is an updated sample comment on the discussion thread",
      "likes": 0,
      "views": 0,
      "commenterType": "STUDENT",
      "createdAt": "2026-01-15T09:17:07.192Z",
      "updatedAt": "2026-01-15T09:19:49.344Z",
      "studentId": "ace4a91e-1370-44af-be8c-d141acad9d05",
      "facultyId": null,
      "discussionThreadId": "1d7205a8-596d-4011-baf5-dc75034fa5a5",
      "parentCommentId": null
    }
  }
}
```

### Error Responses

| Status Code | Error Message                              | Description                                                                 |
| ----------- | ------------------------------------------ | --------------------------------------------------------------------------- |
| 400         | Validation error messages                  | When request body doesn't meet validation criteria (e.g., comment too long) |
| 401         | "Student information not found in request" | When no student information is attached to the request                      |
| 404         | "Comment not found"                        | When no comment exists with the provided ID                                 |
| 500         | Server error messages                      | When there's an internal server error                                       |

## Usage

This endpoint is used to update comments for students. It's particularly useful when you need to:

1. Allow students to edit their comments
2. Update content for accuracy or clarity
3. Correct errors in previously posted comments
4. Revise thoughts or add additional information

---

# Delete Comment API

## Endpoint

`DELETE /student-portal/comments/:commentId`

## Description

Deletes a specific comment by its unique identifier. This operation is permanent and removes the comment and any replies to it.

## Request

### Path Parameters

| Parameter | Type          | Required | Description                                    |
| --------- | ------------- | -------- | ---------------------------------------------- |
| commentId | string (UUID) | Yes      | The unique identifier of the comment to delete |

### Example Request

```bash
curl -X DELETE -H "user-id: ace4a91e-1370-44af-be8c-d141acad9d05" "http://localhost:3000/student-portal/comments/3056eb55-cbe9-471d-b384-49a904668350"
```

## Response

### Success Response

- Status Code: `200 OK`
- Content-Type: `application/json`

### Success Response Body

| Field        | Type    | Description                               |
| ------------ | ------- | ----------------------------------------- |
| status       | string  | "success"                                 |
| statusCode   | number  | 200                                       |
| message      | string  | "Comment deleted successfully"            |
| data.success | boolean | Indicates if the operation was successful |
| data.message | string  | Confirmation message                      |

### Example Success Response

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Comment deleted successfully",
  "data": {
    "success": true,
    "message": "Comment deleted successfully"
  }
}
```

### Error Responses

| Status Code | Error Message                              | Description                                            |
| ----------- | ------------------------------------------ | ------------------------------------------------------ |
| 401         | "Student information not found in request" | When no student information is attached to the request |
| 404         | "Comment not found"                        | When no comment exists with the provided ID            |
| 500         | Server error messages                      | When there's an internal server error                  |

## Usage

This endpoint is used to delete comments for students. It's particularly useful when you need to:

1. Remove inappropriate or incorrect comments
2. Allow students to delete their own comments
3. Clean up duplicate or erroneous posts
4. Manage content quality in discussion forums

**Warning**: This operation is permanent and cannot be undone. Any replies to this comment will also be deleted.
