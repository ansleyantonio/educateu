import { Prisma } from "@prisma/client";
import prisma from "../../prismaClient";
import { AppError } from "../../utils/AppError";
import { generateApplicationId } from "../../utils/applicationIdGenerator";
import { loginType, studentType } from "./schema";
import bcrypt from "bcryptjs";

const fetchStudents = async (page: number = 1, pageSize: number = 10, name: string = "", status: string = "") => {
  const skip = (page - 1) * pageSize;

  const whereClause: Prisma.StudentWhereInput = {};

  if (name) {
    whereClause.OR = [
      { firstName: { contains: name, mode: "insensitive" } },
      { lastName: { contains: name, mode: "insensitive" } },
    ];
  }

  // Status filter (if you have a status field)
  // if (status) {
  //   whereClause.status = status;
  // }

  const [students, total] = await prisma.$transaction([
    prisma.student.findMany({
      where: whereClause,
      skip,
      take: pageSize,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        mobile: true,
        username: true,
        address: true,
        photo: true,
        nationality: true,
        studentNo: true,
        createdAt: true,
        updatedAt: true,
        // Add status if you have it
      },
    }),
    prisma.student.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    data: students,
    total,
    page,
    pageSize,
    totalPages,
  };
};

const createStudent = async (studentData: studentType) => {
  const hashedPassword = await bcrypt.hash(studentData.password, 10);

  const studentNo = await generateApplicationId();

  const student = await prisma.student.create({
    data: {
      ...studentData,
      password: hashedPassword,
      studentNo,
    },
  });

  return student;
};

const updateStudent = async (id: string, studentData: Partial<studentType>) => {
  const dataToUpdate: Partial<studentType> = { ...studentData };

  if (studentData.password) {
    dataToUpdate.password = await bcrypt.hash(studentData.password, 10);
  }

  const student = await prisma.student.update({
    where: { id },
    data: dataToUpdate,
  });
  return student;
};

const getStudentById = async (id: string) => {
  return await prisma.student.findUnique({ where: { id } });
};

const deleteStudent = async (id: string) => {
  return await prisma.student.delete({ where: { id } });
};

export const StudentManagementService = {
  fetchStudents,
  createStudent,
  updateStudent,
  getStudentById,
  deleteStudent,
};
