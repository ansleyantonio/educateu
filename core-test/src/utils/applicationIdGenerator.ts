import prisma from "../prismaClient";

/*
 * Generates an application ID in the format: YYMMCSSSSSS
 * Where:
 * - YY = Last 2 digits of current year
 * - MM = Month of academic session (01 for Jan-Mar, 04 for Apr-Jun, 09 for Sep-Nov)
 * - C = Count of academic session per year (1, 2, or 3)
 * - SSSSSS = Sequential counter (global, doesn't reset)
 *
 * Examples:
 * - 25011000001 for Jan-Mar 2025, first session, first application
 * - 250930001589 for Sep-Nov 2025, third session, 1589th application
 */
export async function generateApplicationId(applicationId?: string): Promise<string> {
  // Get current date for YY part
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // Last 2 digits of current year

  // Default values
  let month = "01"; // Default to January
  let sessionCount = "1"; // Default to first session

  // If we have a courseId, try to get the session information
  if (applicationId) {
    try {
      const course = (
        await prisma.application.findUnique({
          where: { id: applicationId },
          include: {
            courseSelection: {
              include: {
                course: {
                  include: {
                    session: true,
                  },
                },
              },
            },
          },
        })
      )?.courseSelection?.course;

      if (course?.session?.intakePeriod) {
        // Determine month and session count based on intake period
        switch (course.session.intakePeriod) {
          case "january_april":
            month = "01";
            sessionCount = "1";
            break;
          case "may_august":
            month = "04";
            sessionCount = "2";
            break;
          case "september_december":
            month = "09";
            sessionCount = "3";
            break;
        }
      }
    } catch (error) {
      // If there's an error fetching session data, we'll use defaults
      console.warn("Could not fetch session data for application ID generation:", error);
    }
  }

  // Generate a global sequential counter
  // We'll use a simple approach: get the count of all applications and add 1
  const applicationCount = await prisma.application.count({
    where: {
      status: {
        not: "DRAFT",
      },
    },
  });
  const sequentialNumber = (applicationCount + 1).toString().padStart(6, "0");

  return `${year}${month}${sessionCount}${sequentialNumber}`;
}
