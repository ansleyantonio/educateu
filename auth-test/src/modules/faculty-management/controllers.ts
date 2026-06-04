import { Request, Response } from "express";
import { zodSafeParse } from "../../utils/zodUtils";
import { assignCourse, facultyRegisterSchema } from "./schema";
import { FacultyService } from "./services";
import { sendSuccessResponse } from "../../utils/responseUtils";
import { RequestWithUser } from "../../types";
import { AppError } from "../../utils/AppError";
import { sendRegistrationEmail } from "../communication/mail/mailer";
import createAuditLog from "../../auditlog";
import prisma from "../../prismaClient";
import userDetails from "../../../userInfo";
import axios from "axios";

interface MulterRequest extends Request {
  file: Express.Multer.File;
}

const facultyRegister = async (req: RequestWithUser, res: Response) => {
  const parsed = zodSafeParse(req.body, facultyRegisterSchema);
  const facultyData = await FacultyService.facultyRegister(parsed);
  // sendRegistrationEmail(
  //   {
  //     email: facultyData.facultyEmail || facultyData.email || "",
  //     username: facultyData.facultyUser || "",
  //     firstName: facultyData.firstName || "",
  //     password: parsed.password,
  //   },
  //   process.env.FACULTY_LOGIN_URL || "http://localhost:3000/faculty/login"
  // );

  if (req.user) {
    await prisma.auditLog.create({
      data: {
        action: ` created new faculty user ${facultyData.username || ""}`,
        userId: req.user?.userId,
        targetUserId: facultyData.id,
        actionType: "user_creation",
      },
    });
  }

  setImmediate(() =>
    axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/registration`, {
      email: parsed?.email || "",
      username: parsed?.username || "",
      firstName: facultyData?.firstName || "",
      password: parsed.password || "",
      loginUrl:
        process.env.FACULTY_LOGIN_URL || "http://localhost:3000/faculty/login",
    }),
  );
  sendSuccessResponse(res, facultyData, "Faculty registered successfully");
};

const getAllFaculties = async (req: Request, res: Response) => {
  const { page = 1, pageSize = 10, name = "", status = "" } = req.query;
  const parsedPage = parseInt(page as string, 10);
  const parsedPageSize = parseInt(pageSize as string, 10);
  const searchName = name as string;
  const searchStatus = status as string;

  const result = await FacultyService.fetchUsers(
    parsedPage,
    parsedPageSize,
    searchName,
    searchStatus,
  );

  const { data, total, page: currentPage, pageSize: size, totalPages } = result;

  const pagination = {
    count: data.length,
    total,
    page: currentPage,
    perPage: size,
    totalPages,
  };

  sendSuccessResponse(
    res,
    data,
    "Fetched all faculties successfully",
    200,
    pagination,
  );
};

const getFacultyById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const faculty = await FacultyService.getFacultyById(id);

  sendSuccessResponse(res, faculty, "Fetched faculty successfully");
};
const updateFacultyById = async (req: Request, res: Response) => {
  const id = req.params.id;
  const data = zodSafeParse(req.body, facultyRegisterSchema);
  const updatedFaculty = await FacultyService.updateFacultyById(id, data);
  sendSuccessResponse(res, updatedFaculty, "Faculty updated successfully");
};

// const assignCourseToFaculty = async (req: RequestWithUser, res: Response) => {
//   const data = zodSafeParse(req.body, assignCourse);

//   const result = await FacultyService.assignCourseToFaculty(data);
//   if (req.user) {
//     const courseName = await prisma.course.findUnique({
//       where: { id: data.courseId },
//       select: { title: true },
//     });
//     await prisma.auditLog.create({
//       data: {
//         action: ` assigned course ${courseName?.title} to faculty ${(await userDetails(data.userId)).username || ""}`,
//         userId: req.user?.userId,
//         targetUserId: data.userId,
//         actionType: "course_assignment",
//       },
//     });
//   }
//   sendSuccessResponse(res, result, "Course assigned to faculty successfully");
// };

const assignCourseToFaculty = async (req: RequestWithUser, res: Response) => {
  const data = zodSafeParse(req.body, assignCourse);
  const result = await FacultyService.assignCourseToFaculty(data);

  if (req.user) {
    for (const assignment of data.courseAssign) {
      const course = await prisma.course.findUnique({
        where: { id: assignment.courseId },
        select: { title: true },
      });

      const userInfo = await userDetails(assignment.userId);

      await prisma.auditLog.create({
        data: {
          action: `Assigned course ${course?.title} to faculty ${userInfo.username || ""}`,
          userId: req.user.userId,
          targetUserId: assignment.userId,
          actionType: "course_assignment",
          courseId: assignment.courseId,
        },
      });
    }
  }

  sendSuccessResponse(res, result, "Course(s) assigned successfully");
};

const getFacultyCoursesByUserId = async (
  req: RequestWithUser,
  res: Response,
) => {
  const { id } = req.params;
  const facultyCourses = await FacultyService.getFacultyCoursesByUserId(id);

  sendSuccessResponse(
    res,
    facultyCourses,
    "Fetched faculty courses successfully",
  );
};

const updateCourseToFacultyById = async (
  req: RequestWithUser,
  res: Response,
) => {
  const { id } = req.params;
  const data = zodSafeParse(req.body, assignCourse);

  const updatedCourse = await FacultyService.updateCourseToFacultyById(
    id,
    data,
  );

  if (req.user) {
    const [assignment] = data.courseAssign;

    const courseName = await prisma.course.findUnique({
      where: { id: assignment.courseId },
      select: { title: true },
    });

    await prisma.auditLog.create({
      data: {
        action: `Updated course ${courseName?.title} for faculty ${(await userDetails(assignment.userId)).username || ""}`,
        userId: req.user.userId,
        targetUserId: assignment.userId,
        actionType: "course_update",
      },
    });
  }

  sendSuccessResponse(res, updatedCourse, "Course updated successfully");
};

const getFacultyCoursesModulesByUserId = async (
  req: RequestWithUser,
  res: Response,
) => {
  const { id } = req.params;
  const { page = 1, pageSize = 10, name = "" } = req.query;
  const parsedPage = parseInt(page as string, 10);
  const parsedPageSize = parseInt(pageSize as string, 10);
  const searchName = name as string;
  const { modules, pagination } =
    await FacultyService.getFacultyCoursesModulesByUserId(
      id as string,
      parsedPage,
      parsedPageSize,
      searchName,
    );

  sendSuccessResponse(
    res,
    modules,
    "Fetched faculty courses modules successfully",
    200,
    pagination,
  );
};

// controller
const getFacultyCoursesList = async (req: Request, res: Response) => {
  const courseId = req.query.id as string | undefined;

  if (courseId) {
    const existingCourse = await prisma.sessionCourse.findFirst({
      where: { courseId },
    });

    if (!existingCourse) {
      throw new AppError("COURSE ID NOT FOUND", "NOT_FOUND", 404);
    }
  }

  const result = await FacultyService.getFacultyCoursesList(courseId);
  sendSuccessResponse(res, result, "Fetched faculty courses successfully");
};

export const FacultyControllers = {
  facultyRegister,
  getAllFaculties,
  getFacultyById,
  updateFacultyById,
  assignCourseToFaculty,
  getFacultyCoursesByUserId,
  updateCourseToFacultyById,
  getFacultyCoursesModulesByUserId,
  getFacultyCoursesList,
};
