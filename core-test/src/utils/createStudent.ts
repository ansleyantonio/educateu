import { sendRegisterEmail } from "../modules/student-management/mail/config";
import prisma from "../prismaClient";
import bcrypt from "bcryptjs";
import { AppError } from "./AppError";
import { sendSuccessResponse } from "./responseUtils";
import { generateApplicationId } from "./applicationIdGenerator";
import { sendRegisterNotification } from "./notificationService";

export interface CreateStudentInput {
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  username?: string;
  password: string;
  address?: string;
  photo?: string;
  nationality?: string;
  studentNo?: string;
  sessionCourseId: string;
}

export const createStudent = async (data: CreateStudentInput) => {
  const existingStudent = await prisma.student.findUnique({
    where: { email: data.email },
    include: {
      studentCourses: true,
    },
  });

  if (existingStudent) {
    const alreadyEnrolled = existingStudent.studentCourses.some((sc) => sc.sessionCourseId === data.sessionCourseId);

    if (alreadyEnrolled) {
      throw new AppError(
        "Student already exists and is already enrolled in this course",
        "STUDENT_ALREADY_ENROLLED",
        400,
      );
    }

    await prisma.studentCourse.create({
      data: {
        studentId: existingStudent.id,
        sessionCourseId: data.sessionCourseId,
      },
    });

    return { message: "Student enrolled in new course successfully", student: existingStudent };
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const newStudent = await prisma.student.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      mobile: data.mobile,
      username: data.username,
      password: hashedPassword,
      address: data.address,
      photo: data.photo,
      nationality: data.nationality,
      studentNo: await generateApplicationId(),
      studentCourses: {
        create: {
          sessionCourseId: data.sessionCourseId,
        },
      },
      notification: {
        create: {
          emailNotification: true,
          assignmentNotification: true,
          gradeUpdate: true,
          forumReply: true,
          announcements: true,
        },
      },
    },
  });

  const sessionCourse = await prisma.sessionCourse.findUnique({
    where: { id: data.sessionCourseId },
    select: {
      session: {
        select: {
          startDate: true,
        },
      },
      course: {
        select: {
          title: true,
        },
      },
    },
  });

  sendRegisterNotification({
    email: data.email,
    name: data.username || data.firstName || "Student",
    password: data.password,
    userName: data.username || "N/A",
    loginUrl: process.env.STUDENT_LOGIN_URL || "https://your-platform.com/login",
    courseTitle: sessionCourse?.course.title || "your course",
    courseStartDate: sessionCourse?.session.startDate.toISOString().split("T")[0] || "",
  });

  return { message: "Student created and enrolled successfully", student: newStudent };
};
