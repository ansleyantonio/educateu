/* eslint-disable @typescript-eslint/no-explicit-any */
import chalk from "chalk";

// Import all services from their respective files
import {
  getStudentCoursesService,
  getStudentCourseByIdService,
  getCourseModulesBySemesterService,
} from "./course-services";

import {
  getUpcomingAssessmentsService,
  getAllStudentAssessmentsService,
  getAssessmentQuestionsService,
  submitAssessmentAnswersService,
  getAssessmentResultsService,
  getAllGradesService,
  startAssessmentService,
} from "./assessment-services";

import { getModuleContentsService } from "./content-services";

import { createSupportRequestService, getFAQsService } from "./support-services";

import { createLessonNoteService, getLessonNotesService, updateLessonNoteService } from "./lesson-note-services";

import {
  createDiscussionThreadService,
  getDiscussionThreadService,
  getDiscussionThreadsService,
  updateDiscussionThreadService,
  deleteDiscussionThreadService,
} from "./discussion-services";

import {
  createCommentService,
  getCommentService,
  getCommentsService,
  updateCommentService,
  deleteCommentService,
} from "./thread-comment-services";
import prisma from "../prismaClient";

// All Cards Service
const getDashboardCardsInfoService = async (studentId: string) => {
  const studentCourses = await prisma.studentCourse.findMany({
    where: { studentId },
    select: {
      assessmentResults: {
        select: {
          score: true,
          maxScore: true,
        },
      },
      sessionCourse: {
        select: {
          courseSnapshot: true,
        },
      },
    },
  });

  let totalScorePercentage = 0;
  let scoredCount = 0;
  let totalAvailableAssessments = 0;

  // Debug: Log each course's assessment count
  const courseBreakdown = [];

  for (const sc of studentCourses) {
    const snapshot = sc.sessionCourse.courseSnapshot as any;
    const modules = snapshot?.modules || [];

    let courseAssessmentCount = 0;

    for (const module of modules) {
      // Try primary location
      let assessments = module.moduleAssessments || [];

      // Try secondary location (cModule)
      if (assessments.length === 0 && module.cModule?.moduleAssessments) {
        assessments = module.cModule.moduleAssessments;
      }

      // Try courseModules path (seen in your data)
      if (assessments.length === 0 && snapshot.courseModules) {
        const courseModule = snapshot.courseModules.find((cm: any) => cm.cModuleId === module.id);
        if (courseModule?.cModule?.moduleAssessments) {
          assessments = courseModule.cModule.moduleAssessments;
        }
      }

      totalAvailableAssessments += assessments.length;
      courseAssessmentCount += assessments.length;
    }

    courseBreakdown.push({
      courseTitle: snapshot?.title || "Unknown",
      availableAssessments: courseAssessmentCount,
      completedAssessments: sc.assessmentResults.length,
      results: sc.assessmentResults.map((r) => ({
        score: r.score,
        maxScore: r.maxScore,
      })),
    });

    // Process results for grade calculation
    for (const result of sc.assessmentResults) {
      const earned = (result.score as any)?.d?.[0] || 0;
      const max = (result.maxScore as any)?.d?.[0] || 0;

      if (max > 0) {
        totalScorePercentage += (earned / max) * 100;
        scoredCount++;
      }
    }
  }

  const completedCount = studentCourses.reduce((sum, sc) => sum + sc.assessmentResults.length, 0);

  // console.log("Course Breakdown:", JSON.stringify(courseBreakdown, null, 2));
  // console.log("Total Available:", totalAvailableAssessments);
  // console.log("Total Completed:", completedCount);
  // console.log("Scored Count:", scoredCount);
  // console.log("Score Percentage Total:", totalScorePercentage);

  return {
    enrolledCourses: studentCourses.length,
    averageGrade: scoredCount > 0 ? Math.round((totalScorePercentage / scoredCount) * 100) / 100 : 0,
    overallProgress:
      totalAvailableAssessments > 0 ? Math.round((completedCount / totalAvailableAssessments) * 10000) / 100 : 0,
    pendingTasks: totalAvailableAssessments - completedCount,
    // debug: {
    //   courseBreakdown,
    //   totalAvailableAssessments,
    //   completedCount,
    //   scoredCount,
    // },
  };
};

// Discussion Stats Service
const getDiscussionStatsService = async (studentId: string) => {
  const studentCourses = await prisma.studentCourse.findMany({
    where: { studentId },
    select: {
      sessionCourseId: true,
    },
  });

  const sessionCourseIds = studentCourses.map((sc) => sc.sessionCourseId);

  if (sessionCourseIds.length === 0) {
    return {
      totalThreads: 0,
      totalReplies: 0,
      recentThreads: 0,
    };
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [totalThreads, totalReplies, recentThreads] = await Promise.all([
    prisma.discussionThread.count({
      where: { sessionCourseId: { in: sessionCourseIds } },
    }),
    prisma.threadComment.count({
      where: {
        discussionThread: { sessionCourseId: { in: sessionCourseIds } },
      },
    }),
    prisma.discussionThread.count({
      where: {
        sessionCourseId: { in: sessionCourseIds },
        createdAt: { gte: sevenDaysAgo },
      },
    }),
  ]);

  return {
    totalThreads,
    totalReplies,
    recentThreads,
  };
};

// Export all services
export {
  getStudentCoursesService,
  getStudentCourseByIdService,
  getCourseModulesBySemesterService,
  getUpcomingAssessmentsService,
  getAllStudentAssessmentsService,
  getAssessmentQuestionsService,
  submitAssessmentAnswersService,
  getAssessmentResultsService,
  getAllGradesService,
  startAssessmentService,
  getModuleContentsService,
  createSupportRequestService,
  getFAQsService,
  createLessonNoteService,
  getLessonNotesService,
  updateLessonNoteService,
  createDiscussionThreadService,
  getDiscussionThreadService,
  getDiscussionThreadsService,
  updateDiscussionThreadService,
  deleteDiscussionThreadService,
  createCommentService,
  getCommentService,
  getCommentsService,
  updateCommentService,
  deleteCommentService,
  getDashboardCardsInfoService,
  getDiscussionStatsService,
};
