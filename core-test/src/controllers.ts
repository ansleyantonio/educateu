/*
 * Global controllers for file upload and retrieval operations
 *
 * This file contains controller functions that handle file operations including
 * uploading files to AWS S3 and retrieving files from S3. These controllers
 * are used across the application for file management.
 */

import { Request, Response } from "express";
import { sendSuccessResponse } from "./utils/responseUtils";
import { MulterS3File } from "./middlewares/multer";
import { s3 } from "./s3Client";
import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from "stream";
import { publicGetCoursesReqSchema, RequestWithUser } from "./types";
import { zodSafeParse } from "./utils/zodUtils";
import z from "zod";
import { getPagination } from "./utils/paginationUtils";
import prisma from "./prismaClient";
import { AppError } from "./utils/AppError";

/*
 * Handles single file upload to AWS S3
 *
 * This function processes a file uploaded via multipart/form-data and stores it
 * in AWS S3. It returns file metadata including the access path, mimetype, size,
 * and original filename.
 */
async function uploadSingleFile(req: RequestWithUser, res: Response) {
  // Extract the uploaded file from the request (processed by Multer middleware)
  const file = req.file as MulterS3File;

  if (!file) {
    throw new Error("No file uploaded");
  }

  // Create file metadata object with path and details
  const pathWithData = JSON.stringify({
    path: `/uploads/${encodeURIComponent(file.key)}`,
    mimetype: file.mimetype,
    size: file.size,
    originalname: file.originalname,
  });

  // Send success response with file information
  sendSuccessResponse(
    res,
    {
      path: pathWithData,
    },
    "File uploaded successfully",
  );
}

/*
 * Retrieves and streams a single file from AWS S3
 *
 * This function fetches a file from AWS S3 using the provided file key and
 * streams it directly to the client. It handles URL decoding of the file key
 * and sets appropriate headers for proper content type detection.
 */
async function getSingleFile(req: Request, res: Response) {
  const fileKey = decodeURIComponent(req.params.fileKey);

  const headResult = await s3.send(
    new HeadObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: fileKey,
    }),
  );

  const signedUrl = await getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: fileKey,
    }),
    { expiresIn: 3600 },
  );

  return sendSuccessResponse(
    res,
    {
      url: signedUrl,
      expiresIn: 3600,
      contentType: headResult.ContentType || "application/octet-stream",
    },
    "File URL generated successfully",
  );
}

/*
 * Collection of controller functions for file operations
 */
/*
 * Handles single file upload to AWS S3 (public version)
 *
 * This function processes a file uploaded via multipart/form-data and stores it
 * in AWS S3 without requiring authentication. It returns file metadata including
 * the access path, mimetype, size, and original filename.
 */
async function uploadSingleFilePublic(req: Request, res: Response) {
  // Extract the uploaded file from the request (processed by Multer middleware)
  const file = req.file as MulterS3File;

  if (!file) {
    throw new Error("No file uploaded");
  }

  // Create file metadata object with path and details
  const pathWithData = JSON.stringify({
    path: `/uploads-public/${encodeURIComponent(file.key)}`,
    mimetype: file.mimetype,
    size: file.size,
    originalname: file.originalname,
  });

  // Send success response with file information
  sendSuccessResponse(
    res,
    {
      path: pathWithData,
    },
    "File uploaded successfully",
  );
}

/*
 * Retrieves and streams a single file from AWS S3 (public version)
 *
 * This function fetches a file from AWS S3 using the provided file key and
 * streams it directly to the client without requiring authentication. It handles
 * URL decoding of the file key and sets appropriate headers for proper content
 * type detection.
 */
async function getSingleFilePublic(req: Request, res: Response) {
  const fileKey = decodeURIComponent(req.params.fileKey);

  const signedUrl = await getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: fileKey,
    }),
    { expiresIn: 3600 },
  );

  return sendSuccessResponse(
    res,
    {
      url: signedUrl,
      expiresIn: 3600,
    },
    "File URL generated successfully",
  );
}

/*
 * Collection of controller functions for file operations
 */
export const Controllers = {
  uploadSingleFile,
  getSingleFile,
};

/*
 * Collection of public controller functions for file operations
 */

/*
 * Retrieves a paginated list of public courses based on course type
 *
 * This function handles the /api/v1/public/courses endpoint, providing
 * public access to course information. It supports different course types
 * (degree, diploma, professional, cpd) with pagination and returns
 * structured course data.
 */
const getCourses = async (req: Request, res: Response) => {
  // Validate and parse query parameters using Zod schema
  const reqQuery = zodSafeParse(req.query, publicGetCoursesReqSchema);

  // Calculate pagination parameters (limit and offset for database query)
  const { limit, offset } = getPagination(reqQuery.page, reqQuery.pageSize);

  // Initialize variables to store courses and total count
  let courses: Record<string, unknown>[] = [];
  let count = 0;

  // Handle degree and diploma courses (which are linked to sessions)
  if (reqQuery.type === "DEGREE_COURSE" || reqQuery.type === "DIPLOMA_COURSE") {
    // Execute database transaction to fetch courses and count simultaneously
    const [degreeDiplomaCourses, degreeDiplomaCourseCount] = await prisma.$transaction([
      // Fetch paginated course data with session information
      prisma.sessionCourse.findMany({
        where: {
          // Filter by course type
          course: {
            courseType: reqQuery.type,
          },
        },
        // Select only required fields to optimize performance
        select: {
          id: true,
          courseSnapshot: true,
        },
        // Order by course title alphabetically
        orderBy: {
          course: {
            title: "asc",
          },
        },
        // Apply pagination parameters
        skip: offset,
        take: limit,
      }),
      // Count total matching records for pagination metadata
      prisma.sessionCourse.count({
        where: {
          course: {
            courseType: reqQuery.type,
          },
        },
      }),
    ]);

    // Transform database results into structured course objects
    courses = degreeDiplomaCourses.map((cdc) => {
      return {
        id: cdc.id,
        // Extract course type from snapshot
        type: (cdc.courseSnapshot as { courseType: string }).courseType,
        // Extract course title from snapshot
        title: (cdc.courseSnapshot as { title: string }).title,
        // Extract course description from snapshot
        description: (cdc.courseSnapshot as { courseDescription: string }).courseDescription,
        // Extract credit information from snapshot
        credits: (cdc.courseSnapshot as { totalCredits: number }).totalCredits,
      };
    });
    // Set total count for pagination metadata
    count = degreeDiplomaCourseCount;
  }
  // Handle professional and CPD courses (which are not session-based)
  else if (reqQuery.type === "PROFESSIONAL_COURSE" || reqQuery.type === "CPD_COURSE") {
    // Execute database transaction to fetch courses and count simultaneously
    const [profCpdCourses, profCpdCourseCount] = await prisma.$transaction([
      // Fetch paginated course data for professional/CPD courses
      prisma.course.findMany({
        where: {
          // Filter by course type
          courseType: reqQuery.type,
        },
        // Order by course title alphabetically
        orderBy: {
          title: "asc",
        },
        // Apply pagination parameters
        skip: offset,
        take: limit,
      }),
      // Count total matching records for pagination metadata
      prisma.course.count({
        where: {
          courseType: reqQuery.type,
        },
      }),
    ]);

    // Transform database results into structured course objects
    courses = profCpdCourses.map((pcc) => {
      return {
        id: pcc.id,
        // Include course type
        type: pcc.courseType,
        // Include course title
        title: pcc.title,
        // Include course description
        description: pcc.courseDescription,
        // Include duration information for professional/CPD courses
        duration: pcc.durationLength,
      };
    });
    // Set total count for pagination metadata
    count = profCpdCourseCount;
  }

  // Create pagination metadata for response
  const pagination = {
    count: courses.length, // Number of items in current page
    total: count, // Total number of matching items
    page: reqQuery.page, // Current page number
    perPage: limit, // Number of items per page
    totalPages: Math.ceil(count / limit), // Total number of pages
  };

  // Send structured response with courses and pagination metadata
  sendSuccessResponse(res, { courses }, undefined, undefined, pagination);
};

/*
 * Retrieves detailed information for a specific course by ID
 *
 * This function handles the /api/v1/public/courses/:courseId endpoint,
 * providing public access to detailed course information. It supports
 * both session-based courses (degree/diploma) and direct courses
 * (professional/CPD), returning appropriate data structure for each.
 */
const getCourseById = async (req: Request, res: Response) => {
  // Validate and parse course ID parameter using Zod schema
  const courseId = zodSafeParse(req.params.courseId, z.string().uuid());

  // Attempt to find session-based course (degree/diploma) by ID
  const degDipCourse = await prisma.sessionCourse.findUnique({
    where: {
      id: courseId,
    },
    // Select required fields for degree/diploma courses
    select: {
      id: true,
      courseSnapshot: true,
      courseFees: true,
    },
  });

  // If not found as session-based course, attempt to find as direct course (professional/CPD)
  const profCpdCourse = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    // Select required fields for professional/CPD courses
    select: {
      id: true,
      courseType: true,
      title: true,
      courseDescription: true,
      durationLength: true,
    },
  });

  // Determine which course was found (degree/diploma takes precedence)
  const course = degDipCourse || profCpdCourse;

  // Throw error if no course was found with the specified ID
  if (!course) {
    throw new AppError("Course not found", "NOT_FOUND", 404);
  }

  // Initialize variable to store formatted course data
  let formattedCourse = {};

  // Format data for degree/diploma courses
  if (degDipCourse) {
    formattedCourse = {
      id: degDipCourse.id,
      // Extract course type from snapshot
      type: (degDipCourse.courseSnapshot as { courseType: string }).courseType,
      // Extract course title from snapshot
      title: (degDipCourse.courseSnapshot as { title: string }).title,
      // Extract course description from snapshot
      description: (degDipCourse.courseSnapshot as { courseDescription: string }).courseDescription,
      // Extract credit information from snapshot
      credits: (degDipCourse.courseSnapshot as { totalCredits: number }).totalCredits,
    };
  }
  // Format data for professional/CPD courses
  else if (profCpdCourse) {
    formattedCourse = {
      id: profCpdCourse.id,
      // Include course type
      type: profCpdCourse.courseType,
      // Include course title
      title: profCpdCourse.title,
      // Include course description
      description: profCpdCourse.courseDescription,
      // Include duration information for professional/CPD courses
      duration: profCpdCourse.durationLength,
    };
  }

  // Send formatted course data in standard response format
  sendSuccessResponse(res, formattedCourse);
};

export const PublicControllers = {
  uploadSingleFilePublic,
  getSingleFilePublic,
  getCourses,
  getCourseById,
};
