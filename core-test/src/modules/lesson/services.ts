import { Prisma } from "@prisma/client";
import prisma from "../../prismaClient";
import { getPagination } from "../../utils/paginationUtils";
import { CreateLesson, GetLessonReqBody, GetSingleLesson, UpdateLesson } from "./types";
import { AppError } from "../../utils/AppError";

const getLessons = async (reqBody: GetLessonReqBody) => {
  const { limit, offset } = getPagination(reqBody.page, reqBody.pageSize);

  const where: Prisma.LessonWhereInput = {
    AND: [
      ...(reqBody.searchTerm ? [{ title: { contains: reqBody.searchTerm, mode: Prisma.QueryMode.insensitive } }] : []),
      ...(reqBody.searchTerm
        ? [
            {
              OR: [
                {
                  title: {
                    contains: reqBody.searchTerm,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                {
                  id: {
                    contains: reqBody.searchTerm,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
              ],
            },
          ]
        : []),
      ...(reqBody.title ? [{ title: { contains: reqBody.title, mode: Prisma.QueryMode.insensitive } }] : []),
      ...(reqBody.type ? [{ type: reqBody.type }] : []),
      ...(reqBody.estimatedTimeToComplete ? [{ estimatedTimeToComplete: reqBody.estimatedTimeToComplete }] : []),
      ...(reqBody.awardingBodyId ? [{ awardingBodyId: reqBody.awardingBodyId }] : []),
      ...(reqBody.code ? [{ code: reqBody.code }] : []),
    ],
  };

  const [lessons, count] = await prisma.$transaction([
    prisma.lesson.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        awardingBody: true,
        moduleLessons: true,
        lessonContents: {
          include: {
            content: true,
          },
          orderBy: {
            index: "asc",
          },
        },
      },
    }),
    prisma.lesson.count({
      where,
    }),
  ]);

  // Transform lessons to the requested format
  // const transformedLessons = lessons.map(lesson => {
  //   const { lessonContents, ...lessonWithoutContents } = lesson;
  //
  //   return {
  //     ...lessonWithoutContents,
  //     contents: lessonContents.map(lessonContent => {
  //       const { content, ...lessonContentWithoutContent } = lessonContent;
  //       return {
  //         ...lessonContentWithoutContent,
  //         ...content
  //       };
  //     })
  //   };
  // });

  const paginationData = {
    count: lessons.length,
    total: count,
    page: reqBody.page,
    perPage: limit,
    totalPages: Math.ceil(count / limit),
  };

  return { lessons: lessons, pagination: paginationData };
};

const getLessonById = async (reqBody: GetSingleLesson) => {
  const lesson = await prisma.lesson.findUnique({
    where: {
      id: reqBody.id,
    },
    include: {
      awardingBody: true,
      moduleLessons: {
        include: {
          cModule: true,
        },
      },
      lessonContents: {
        include: {
          content: true,
        },
        orderBy: {
          index: "asc",
        },
      },
    },
  });

  // Transform lesson to the requested format if it exists
  // if (lesson) {
  //   const { lessonContents, ...lessonWithoutContents } = lesson;
  //
  //   const transformedLesson = {
  //     ...lessonWithoutContents,
  //     contents: lessonContents.map((lessonContent) => {
  //       const { content, ...lessonContentWithoutContent } = lessonContent;
  //       return {
  //         ...lessonContentWithoutContent,
  //         ...content,
  //       };
  //     }),
  //   };

  //   return { lesson: transformedLesson };
  // }

  return { lesson };
};

const createLesson = async (reqBody: CreateLesson) => {
  const lessonContents = reqBody.contents;

  // Destructure to exclude contents from the lesson data
  const { contents, ...lessonData } = reqBody;

  const lesson = await prisma.lesson.create({
    data: {
      ...lessonData,
      lessonContents: {
        create: lessonContents.map((content, index) => {
          return {
            index: index + 1, // 1-based indexing
            content: {
              create: {
                title: content.title,
                description: content.description,
                type: content.type,
                paths: content.paths,
              },
            },
          };
        }),
      },
    },
    include: {
      lessonContents: {
        include: {
          content: true,
        },
      },
    },
  });

  return { lesson };
};

const updateLesson = async (reqBody: UpdateLesson) => {
  const { contents, ...lessonData } = reqBody;

  // Check if awardingBodyId is being updated
  if (lessonData.awardingBodyId) {
    // Get the existing lesson with its module assignments
    const existingLesson = await prisma.lesson.findUnique({
      where: { id: reqBody.id },
      include: {
        moduleLessons: true, // Include module lessons to check if any modules are assigned
      },
    });

    // If lesson is assigned to modules, prevent awarding body change
    if (existingLesson?.moduleLessons && existingLesson.moduleLessons.length > 0) {
      throw new AppError("Cannot update awarding body when lesson is assigned to course modules", "BAD_REQUEST", 400);
    }
  }

  // Prepare the update data for lesson
  const updateData: Prisma.LessonUpdateInput = {
    ...lessonData,
  };

  // Handle contents if provided
  if (contents && contents.length > 0) {
    // Separate existing contents (with id) from new contents (without id)
    const existingContents = contents.filter((content) => "id" in content && content.id);
    const newContents = contents.filter((content) => !("id" in content) || !content.id);

    // Handle existing contents update
    if (existingContents.length > 0) {
      updateData.lessonContents = {
        update: existingContents.map((content) => {
          const { id, index, title, description, type, paths, ...contentData } = content;
          // Prepare content update data, only including fields that are provided
          const contentUpdateData: Prisma.ContentUpdateInput = {};
          if (title !== undefined) contentUpdateData.title = title;
          if (description !== undefined) contentUpdateData.description = description;
          if (type !== undefined) contentUpdateData.type = type;
          if (paths !== undefined) contentUpdateData.paths = paths;

          return {
            where: {
              id: id as string,
            },
            data: {
              index: index !== undefined ? index : undefined, // Update index if provided (1-based)
              content: {
                update: contentUpdateData,
              },
            },
          };
        }),
      };
    }

    // Handle new contents creation
    if (newContents.length > 0) {
      // Get the current lesson to determine the next available index
      const currentLesson = await prisma.lesson.findUnique({
        where: { id: reqBody.id },
        include: { lessonContents: true },
      });

      // Find the highest existing index, or 0 if no contents exist
      const highestIndex =
        currentLesson?.lessonContents.reduce(
          (max, content) => (content.index && content.index > max ? content.index : max),
          0,
        ) || 0;

      // If we already have update operations, we need to merge with create
      if (updateData.lessonContents?.update) {
        (updateData.lessonContents as Prisma.LessonContentUpdateManyWithoutLessonNestedInput).create = newContents.map(
          (content, idx) => {
            const { index, title, description, type, paths } = content;
            return {
              index: index ?? highestIndex + idx + 1, // Set index if provided, otherwise auto-increment (1-based)
              content: {
                create: {
                  title: title as string, // These are required for creation
                  description: description as string,
                  type: type as string,
                  paths: paths as string[],
                },
              },
            };
          },
        );
      } else {
        // If no update operations, just create new contents
        updateData.lessonContents = {
          create: newContents.map((content, idx) => {
            const { index, title, description, type, paths } = content;
            return {
              index: index ?? highestIndex + idx + 1, // Set index if provided, otherwise auto-increment (1-based)
              content: {
                create: {
                  title: title as string, // These are required for creation
                  description: description as string,
                  type: type as string,
                  paths: paths as string[],
                },
              },
            };
          }),
        };
      }
    }
  }

  const lesson = await prisma.lesson.update({
    where: {
      id: reqBody.id,
    },
    data: updateData,
    include: {
      lessonContents: {
        include: {
          content: true,
        },
      },
    },
  });

  return { lesson };
};

export const LessonService = {
  getLessons,
  getLessonById,
  createLesson,
  updateLesson,
};
