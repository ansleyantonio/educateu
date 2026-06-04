import {
  PrismaClient,
  Prisma,
  CourseType,
  AwardingBodyStatus,
  userStatus,
  ApplicationStatus,
  ApplicationStage,
  YesNo,
  Sex,
  LessonType,
  CModuleStatus,
  AssessmentCategory,
  AssessmentType,
  AssessmentStatus,
  DegreeType,
  DiplomaType,
  PaymentPlan,
  PaymentStatus,
  PaymentMethod,
  PaymentHistoryStatus,
  EnrollmentStatus,
  accountStatus,
  FacultyRole,
  CourseFeeStatus,
  CurrencyType,
  PromoCodeStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const startTime = Date.now();
  const logSection = (num: string, label: string) => {
    console.log(`\n  ════════════════════════════════════════════`);
    console.log(`  │ ${num.padStart(2)}. ${label.padEnd(36)}│`);
    console.log(`  ════════════════════════════════════════════`);
  };
  const logDone = (label: string, count: number) =>
    console.log(`  ✓ ${label}: ${count} records`);
  const logElapsed = () =>
    console.log(
      `  ⏱  Elapsed: ${((Date.now() - startTime) / 1000).toFixed(1)}s`,
    );

  console.log(`
  ╔═══════════════════════════════════════════╗
  ║         EducateU Test Data Seed           ║
  ╚═══════════════════════════════════════════╝
  `);

  // 1. Portal Categories
  logSection("1", "Portal Categories");
  const portalCategoryNames = ["admin", "agent", "faculty"];
  const portalCategories: Record<string, any> = {};
  for (const name of portalCategoryNames) {
    portalCategories[name] = await prisma.portalCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  const agentCategory = portalCategories["agent"];
  const facultyCategory = portalCategories["faculty"];

  // 2. Modules for Portals
  logSection("2", "Portal Modules & Permissions");
  const agentModules = [
    { name: "agent-awarding-bodies", groupName: "agent-awarding-bodies" },
    { name: "application-management", groupName: "application-management" },
    { name: "awarding-bodies", groupName: "awarding-bodies" },
    { name: "commissions", groupName: "commissions" },
    { name: "marketing-link", groupName: "marketing-link" },
    { name: "sub-agent-management", groupName: "sub-agent-management" },
    { name: "agent-notification-log", groupName: "agent-notification-log" },
  ];

  const facultyModules = [
    { name: "faculty-management", groupName: "faculty-management" },
    { name: "course-management", groupName: "course-management" },
  ];

  const upsertedModules: Record<string, any> = {};
  for (const mod of agentModules) {
    const upsertedModule = await prisma.module.upsert({
      where: { name: mod.name },
      update: { groupName: mod.groupName },
      create: { name: mod.name, groupName: mod.groupName },
    });
    upsertedModules[mod.name] = upsertedModule;

    await prisma.portalCategoryModule.upsert({
      where: {
        portalCategoryId_moduleId: {
          portalCategoryId: agentCategory.id,
          moduleId: upsertedModule.id,
        },
      },
      update: {},
      create: {
        portalCategoryId: agentCategory.id,
        moduleId: upsertedModule.id,
      },
    });
  }

  for (const mod of facultyModules) {
    const upsertedModule = await prisma.module.upsert({
      where: { name: mod.name },
      update: { groupName: mod.groupName },
      create: { name: mod.name, groupName: mod.groupName },
    });
    upsertedModules[mod.name] = upsertedModule;

    await prisma.portalCategoryModule.upsert({
      where: {
        portalCategoryId_moduleId: {
          portalCategoryId: facultyCategory.id,
          moduleId: upsertedModule.id,
        },
      },
      update: {},
      create: {
        portalCategoryId: facultyCategory.id,
        moduleId: upsertedModule.id,
      },
    });
  }

  // 3. Roles for Portals
  logSection("3", "Roles");
  const agentRole = await prisma.role.upsert({
    where: {
      name_portalCategoryId: {
        name: "agent",
        portalCategoryId: agentCategory.id,
      },
    },
    update: {},
    create: {
      name: "agent",
      portalCategoryId: agentCategory.id,
      roleModules: {
        create: agentModules.map((mod) => ({
          moduleId: upsertedModules[mod.name].id,
          modulePermission: ["GET", "POST", "PUT", "DELETE"],
        })),
      },
    },
  });

  const subAgentRole = await prisma.role.upsert({
    where: {
      name_portalCategoryId: {
        name: "sub-agent",
        portalCategoryId: agentCategory.id,
      },
    },
    update: {},
    create: {
      name: "sub-agent",
      portalCategoryId: agentCategory.id,
      roleModules: {
        create: agentModules
          .filter((m) => m.name !== "sub-agent-management")
          .map((mod) => ({
            moduleId: upsertedModules[mod.name].id,
            modulePermission: ["GET", "POST", "PUT", "DELETE"],
          })),
      },
    },
  });

  const facultyRole = await prisma.role.upsert({
    where: {
      name_portalCategoryId: {
        name: "faculty",
        portalCategoryId: facultyCategory.id,
      },
    },
    update: {},
    create: {
      name: "faculty",
      portalCategoryId: facultyCategory.id,
      roleModules: {
        create: facultyModules.map((mod) => ({
          moduleId: upsertedModules[mod.name].id,
          modulePermission: ["GET", "POST", "PUT", "DELETE"],
        })),
      },
    },
  });

  // 4. Sessions
  logSection("4", "Sessions");
  const sessionsData = [
    {
      name: "June 2026",
      intake: "June",
      year: 2026,
      start: "2026-06-01",
      end: "2026-08-31",
    },
    {
      name: "September 2026",
      intake: "September",
      year: 2026,
      start: "2026-09-01",
      end: "2026-12-31",
    },
    {
      name: "January 2027",
      intake: "January",
      year: 2027,
      start: "2027-01-01",
      end: "2027-04-30",
    },
  ];
  const sessions: Record<string, any> = {};
  for (const s of sessionsData) {
    const existing = await prisma.session.findFirst({
      where: { name: s.name, intakePeriod: s.intake, year: s.year },
    });
    if (existing) {
      sessions[s.name] = existing;
    } else {
      sessions[s.name] = await prisma.session.create({
        data: {
          name: s.name,
          intakePeriod: s.intake,
          year: s.year,
          status: "ACTIVE",
          startDate: new Date(s.start),
          endDate: new Date(s.end),
        },
      });
    }
  }

  // 5. Awarding Bodies
  logSection("5", "Awarding Bodies");
  const awardingBodiesData = [
    { name: "Anglia Ruskin University", code: "ARU", abbreviation: "ARU" },
    { name: "Pearson Edexcel", code: "PEARSON", abbreviation: "PE" },
    { name: "City & Guilds", code: "CITYGUILDS", abbreviation: "C&G" },
    { name: "OCR", code: "OCR", abbreviation: "OCR" },
    { name: "NCFE", code: "NCFE", abbreviation: "NCFE" },
    { name: "SQA", code: "SQA", abbreviation: "SQA" },
    { name: "ATHE", code: "ATHE", abbreviation: "ATHE" },
  ];
  const awardingBodies: Record<string, any> = {};
  for (const ab of awardingBodiesData) {
    const existing = await prisma.awardingBody.findFirst({
      where: { name: ab.name },
    });
    if (existing) {
      awardingBodies[ab.name] = existing;
    } else {
      awardingBodies[ab.name] = await prisma.awardingBody.create({
        data: {
          name: ab.name,
          code: ab.code,
          abbreviation: ab.abbreviation,
          status: AwardingBodyStatus.ACTIVE,
        },
      });
    }
  }

  // 6. Courses
  logSection("6", "Courses & SessionCourse Links");
  const coursesData = [
    {
      title: "Computer Science and Engineering",
      type: CourseType.DEGREE_COURSE,
      ab: "Anglia Ruskin University",
      totalCredits: 120,
      numberOfSemesters: 4,
      yearOneExpectedCredits: 60,
      yearTwoExpectedCredits: 60,
      degreeType: DegreeType.UNDERGRADUATE,
      studyModes: { modes: ["COHORT_BASED", "INSTRUCTOR_LED"] },
      intendedAward: "BSc (Hons) Computer Science and Engineering",
      durationLength: 2,
    },
    {
      title: "Database Management Systems",
      type: CourseType.DIPLOMA_COURSE,
      ab: "Anglia Ruskin University",
      totalCredits: 30,
      numberOfSemesters: 2,
      yearOneExpectedCredits: 30,
      diplomaType: DiplomaType.HIGHER_EDUCATION,
      studyModes: { modes: ["SELF_PACED", "INSTRUCTOR_LED"] },
      intendedAward: "Diploma in Database Management Systems",
      durationLength: 1,
    },
    {
      title: "Database Management Systems",
      type: CourseType.DIPLOMA_COURSE,
      ab: "Pearson Edexcel",
      totalCredits: 30,
      numberOfSemesters: 2,
      yearOneExpectedCredits: 30,
      diplomaType: DiplomaType.VOCATIONAL_OR_PROFESSIONAL,
      studyModes: { modes: ["SELF_PACED", "INSTRUCTOR_LED"] },
      intendedAward: "Diploma in Database Management Systems",
      durationLength: 1,
    },
    {
      title: "Advanced Networking",
      type: CourseType.DIPLOMA_COURSE,
      ab: "City & Guilds",
      totalCredits: 30,
      numberOfSemesters: 2,
      yearOneExpectedCredits: 30,
      diplomaType: DiplomaType.VOCATIONAL_OR_PROFESSIONAL,
      studyModes: { modes: ["INSTRUCTOR_LED", "COHORT_BASED"] },
      intendedAward: "Diploma in Advanced Networking",
      durationLength: 1,
    },
    {
      title: "Fundamentals of Computing",
      type: CourseType.DIPLOMA_COURSE,
      ab: "Anglia Ruskin University",
      totalCredits: 30,
      numberOfSemesters: 2,
      yearOneExpectedCredits: 30,
      diplomaType: DiplomaType.HIGHER_EDUCATION,
      studyModes: { modes: ["SELF_PACED"] },
      intendedAward: "Diploma in Fundamentals of Computing",
      durationLength: 1,
    },
    {
      title: "Fundamentals of Computing",
      type: CourseType.DIPLOMA_COURSE,
      ab: "Pearson Edexcel",
      totalCredits: 30,
      numberOfSemesters: 2,
      yearOneExpectedCredits: 30,
      diplomaType: DiplomaType.VOCATIONAL_OR_PROFESSIONAL,
      studyModes: { modes: ["SELF_PACED"] },
      intendedAward: "Diploma in Fundamentals of Computing",
      durationLength: 1,
    },
  ];
  const courses: Record<string, any> = {};
  for (const c of coursesData) {
    const ab = awardingBodies[c.ab];
    if (!ab) continue;

    const existing = await prisma.course.findFirst({
      where: { title: c.title, courseType: c.type, awardingBodyId: ab.id },
    });
    if (existing) {
      const updatedCourse = await prisma.course.update({
        where: { id: existing.id },
        data: {
          totalCredits: c.totalCredits,
          numberOfSemesters: c.numberOfSemesters,
          yearOneExpectedCredits: c.yearOneExpectedCredits,
          yearTwoExpectedCredits: c.yearTwoExpectedCredits ?? undefined,
          degreeType: c.degreeType,
          diplomaType: c.diplomaType,
          studyModes: c.studyModes as Prisma.InputJsonValue,
          intendedAward: c.intendedAward,
          durationLength: c.durationLength,
        },
      });
      courses[`${c.title}-${c.ab}`] = updatedCourse;
    } else {
      const newCourse = await prisma.course.create({
        data: {
          title: c.title,
          courseType: c.type,
          awardingBodyId: ab.id,
          status: "PUBLISHED",
          totalCredits: c.totalCredits,
          numberOfSemesters: c.numberOfSemesters,
          yearOneExpectedCredits: c.yearOneExpectedCredits,
          yearTwoExpectedCredits: c.yearTwoExpectedCredits ?? undefined,
          degreeType: c.degreeType,
          diplomaType: c.diplomaType,
          studyModes: c.studyModes as Prisma.InputJsonValue,
          intendedAward: c.intendedAward,
          durationLength: c.durationLength,
        },
      });
      courses[`${c.title}-${c.ab}`] = newCourse;

      // Seed Course Fee and Structure
      const semesterFee = c.totalCredits >= 120 ? 2000 : 1500;
      const feePerSemester = c.numberOfSemesters || 1;
      await prisma.courseFee.create({
        data: {
          courseId: newCourse.id,
          overallCourseFee: semesterFee * feePerSemester,
          currencyType: CurrencyType.USD,
          status: CourseFeeStatus.ACTIVE,
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          courseFeeStructure: {
            create: {
              totalSemesters: c.numberOfSemesters || 2,
              totalCredits: c.totalCredits,
              semesters: {
                create: Array.from({ length: c.numberOfSemesters || 2 }).map(
                  (_, i) => ({
                    semesterName: `Semester ${i + 1}`,
                    semesterFee,
                    semesterOrder: i + 1,
                    semesterModules: {
                      create: [
                        {
                          moduleName: `Module ${i * 2 + 1}`,
                          credits: Math.round(
                            (c.totalCredits || 30) /
                              ((c.numberOfSemesters || 2) * 2),
                          ),
                          moduleFee: Math.round(semesterFee / 2),
                        },
                        {
                          moduleName: `Module ${i * 2 + 2}`,
                          credits: Math.round(
                            (c.totalCredits || 30) /
                              ((c.numberOfSemesters || 2) * 2),
                          ),
                          moduleFee: Math.round(semesterFee / 2),
                        },
                      ],
                    },
                  }),
                ),
              },
            },
          },
        },
      });
    }
  }

  // Link Sessions and Courses (SessionCourse)
  const sessionCourses: Record<string, any> = {};
  for (const sName in sessions) {
    const session = sessions[sName];
    for (const cKey in courses) {
      const course = courses[cKey];
      const existing = await prisma.sessionCourse.findUnique({
        where: {
          sessionId_courseId: { sessionId: session.id, courseId: course.id },
        },
      });
      if (existing) {
        sessionCourses[`${sName}-${cKey}`] = existing;
      } else {
        sessionCourses[`${sName}-${cKey}`] = await prisma.sessionCourse.create({
          data: {
            sessionId: session.id,
            courseId: course.id,
            courseSnapshot: {},
          },
        });
      }
    }
  }

  // 7. Agent Networks
  logSection("7", "Agent Networks & Users");
  const agentNetworks = [
    {
      name: "Michael Johnson",
      mobile: "+44 7700 900111",
      email: "michael.johnson@educonnect.co.uk",
      username: "mike_agent01",
      password: "Mj#2026Secure",
      company: "EduConnect Global",
      subAgents: [
        {
          name: "Sarah Lee",
          mobile: "+44 7700 900112",
          email: "sarah.lee@educonnect.co.uk",
        },
        {
          name: "James Porter",
          mobile: "+44 7700 900113",
          email: "james.porter@educonnect.co.uk",
        },
      ],
    },
    {
      name: "David Warner",
      mobile: "+1 415 555 0122",
      email: "d.warner@beaconacademic.com",
      username: "david_beacon77",
      password: "Bcn$2026!Pass",
      company: "Beacon Academic Services",
      subAgents: [
        {
          name: "Robert Chen",
          mobile: "+1 415 555 0123",
          email: "r.chen@beaconacademic.com",
        },
        {
          name: "Amanda Ross",
          mobile: "+1 415 555 0124",
          email: "a.ross@beaconacademic.com",
        },
      ],
    },
    {
      name: "Priya Sharma",
      mobile: "+91 22 6789 0111",
      email: "priya.sharma@apexgateway.in",
      username: "priya_apex_corp",
      password: "Apex#Sec_2026",
      company: "Apex Gateway Consultants",
      subAgents: [
        {
          name: "Rajesh Kumar",
          mobile: "+91 22 6789 0112",
          email: "r.kumar@apexgateway.in",
        },
        {
          name: "Neha Patel",
          mobile: "+91 22 6789 0113",
          email: "n.patel@apexgateway.in",
        },
      ],
    },
    {
      name: "Amara Diallo",
      mobile: "+234 1 460 9981",
      email: "a.diallo@zenithpathways.com",
      username: "amara_zenith",
      password: "Diallo@Zenith99",
      company: "Zenith Student Pathways",
      subAgents: [
        {
          name: "Emeka Obi",
          mobile: "+234 1 460 9982",
          email: "e.obi@zenithpathways.com",
        },
        {
          name: "Blessing Musa",
          mobile: "+234 1 460 9983",
          email: "b.musa@zenithpathways.com",
        },
      ],
    },
    {
      name: "Elena Rostova",
      mobile: "+49 30 2407 1121",
      email: "e.rostova@eurolink.de",
      username: "elena_eurolink",
      password: "Rostova#Berlin26",
      company: "EuroLink Consultancy",
      subAgents: [
        {
          name: "Lucas Dubois",
          mobile: "+49 30 2407 1122",
          email: "l.dubois@eurolink.de",
        },
        {
          name: "Sophie Werner",
          mobile: "+49 30 2407 1123",
          email: "s.werner@eurolink.de",
        },
      ],
    },
  ];

  const allAgentUsers: Record<string, any> = {};

  for (const net of agentNetworks) {
    const hashedPassword = await bcrypt.hash(net.password, 10);
    const agentNames = net.name.split(" ");
    let agentUser = await prisma.user.findFirst({
      where: { agentEmail: net.email },
    });

    if (!agentUser) {
      agentUser = await prisma.user.create({
        data: {
          firstName: agentNames[0],
          lastName: agentNames.slice(1).join(" "),
          agentEmail: net.email,
          mobile: net.mobile,
          agentUser: net.name,
          password: hashedPassword,
          userStatus: userStatus.ACTIVE,
          mfaEnabled: false,
          passwordChanged: true,
          userPortalCategories: {
            create: {
              portalCategory: { connect: { id: agentCategory.id } },
              userPortalCategoryRoles: {
                create: {
                  role: { connect: { id: agentRole.id } },
                  roleData: {
                    awardingBodyId:
                      awardingBodies[awardingBodiesData[0].name].id,
                  },
                },
              },
            },
          },
        },
      });
    }
    allAgentUsers[net.email] = agentUser;

    for (const sub of net.subAgents) {
      const subNames = sub.name.split(" ");
      let subAgentUser = await prisma.user.findFirst({
        where: { agentEmail: sub.email },
      });

      if (!subAgentUser) {
        subAgentUser = await prisma.user.create({
          data: {
            firstName: subNames[0],
            lastName: subNames.slice(1).join(" "),
            agentEmail: sub.email,
            mobile: sub.mobile,
            agentUser: sub.name,
            password: await bcrypt.hash("Sub#2026Pass", 10),
            userStatus: userStatus.ACTIVE,
            mfaEnabled: false,
            passwordChanged: true,
            userPortalCategories: {
              create: {
                portalCategory: { connect: { id: agentCategory.id } },
                userPortalCategoryRoles: {
                  create: {
                    role: { connect: { id: subAgentRole.id } },
                    roleData: {
                      awardingBodyId:
                        awardingBodies[awardingBodiesData[0].name].id,
                    },
                  },
                },
              },
            },
          },
        });
      }
      allAgentUsers[sub.email] = subAgentUser;
    }
  }

  // 7.5 Faculty Users
  logSection("7.5", "Faculty Users");
  const facultyUsersData = [
    {
      name: "Prof. Sarah Jenkins",
      mobile: "+44 20 7946 0123",
      email: "s.jenkins@faculty.edu",
      username: "sarah_jenkins",
      password: "Faculty#2026Secure",
    },
    {
      name: "Dr. Mark Thompson",
      mobile: "+44 20 7946 0456",
      email: "m.thompson@faculty.edu",
      username: "mark_thompson",
      password: "Faculty#2026Secure",
    },
  ];

  const allFacultyUsers: Record<string, any> = {};
  for (const f of facultyUsersData) {
    const hashedPassword = await bcrypt.hash(f.password, 10);
    const names = f.name.split(" ");
    let user = await prisma.user.findFirst({
      where: { facultyEmail: f.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          firstName: names[0],
          lastName: names.slice(1).join(" "),
          facultyEmail: f.email,
          mobile: f.mobile,
          facultyUser: f.username,
          password: hashedPassword,
          userStatus: userStatus.ACTIVE,
          passwordChanged: true,
          userPortalCategories: {
            create: {
              portalCategory: { connect: { id: facultyCategory.id } },
              userPortalCategoryRoles: {
                create: {
                  role: { connect: { id: facultyRole.id } },
                  roleData: {
                    facultyStatus: "ACTIVE",
                  },
                },
              },
            },
          },
        },
      });
    }
    allFacultyUsers[f.email] = user;
  }

  // 8. Applications Data
  logSection("8", "Applications & Student Enrollment");
  const applicationsData = [
    {
      id: 1,
      session: "June 2026",
      body: "Anglia Ruskin University",
      course: "Computer Science and Engineering",
      first: "Ethan",
      last: "Walker",
      email: "ethan.walker2026@studentmail.com",
      dob: "2003-03-14",
      country: "Malaysia",
      ethnicity: "Malay",
      address: "22 Palm Residency, Kuala Lumpur",
      disabilities: "None",
      funds: "Family Sponsorship",
      criminal: "No",
      docs: ["Passport", "Transcript", "IELTS Certificate"],
    },
    {
      id: 2,
      session: "September 2026",
      body: "Anglia Ruskin University",
      course: "Computer Science and Engineering",
      first: "Aris",
      last: "Thorne",
      email: "a.thorne@edu-net.gr",
      dob: "2004-11-22",
      country: "Greece",
      ethnicity: "Mediterranean",
      address: "14 Nikea Street, Athens",
      disabilities: "Dyslexia (Extra Time)",
      funds: "Government Grant",
      criminal: "No",
      docs: ["Passport", "Transcript", "IELTS"],
    },
    {
      id: 3,
      session: "January 2027",
      body: "Pearson Edexcel",
      course: "Database Management Systems",
      first: "Mei-Ling",
      last: "Zhou",
      email: "ml.zhou@fastmail.cn",
      dob: "2002-01-05",
      country: "China",
      ethnicity: "Han Chinese",
      address: "Block B, Pudong District, Shanghai",
      disabilities: "None",
      funds: "Self-Funded",
      criminal: "No",
      docs: ["CV", "SOP", "Degree Certificate"],
    },
    {
      id: 4,
      session: "June 2026",
      body: "City & Guilds",
      course: "Advanced Networking",
      first: "Samuel",
      last: "Adebayo",
      email: "sam.adebayo@webmail.ng",
      dob: "2001-08-19",
      country: "Nigeria",
      ethnicity: "Yoruba",
      address: "45 Ikeja Avenue, Lagos",
      disabilities: "None",
      funds: "Employer Sponsorship",
      criminal: "No",
      docs: ["National ID", "High School Diploma"],
    },
    {
      id: 5,
      session: "September 2026",
      body: "Anglia Ruskin University",
      course: "Computer Science and Engineering",
      first: "Sofia",
      last: "Rossi",
      email: "sofia.rossi@outlook.it",
      dob: "2005-06-30",
      country: "Italy",
      ethnicity: "White European",
      address: "Via Roma 102, Milan",
      disabilities: "Hearing Impairment",
      funds: "Family Sponsorship",
      criminal: "No",
      docs: ["Passport", "Transcript", "IELTS"],
    },
    {
      id: 6,
      session: "January 2027",
      body: "Pearson Edexcel",
      course: "Fundamentals of Computing",
      first: "Rohan",
      last: "Deshmukh",
      email: "rohan.d@studentmail.in",
      dob: "2003-02-11",
      country: "India",
      ethnicity: "Asian Indian",
      address: "89 MG Road, Pune",
      disabilities: "None",
      funds: "Bank Loan",
      criminal: "No",
      docs: ["CV", "SOP", "Degree Certificate"],
    },
    {
      id: 7,
      session: "June 2026",
      body: "Anglia Ruskin University",
      course: "Fundamentals of Computing",
      first: "Lucas",
      last: "Silva",
      email: "l.silva@netspace.br",
      dob: "2004-09-17",
      country: "Brazil",
      ethnicity: "Latino",
      address: "Av. Paulista 1200, São Paulo",
      disabilities: "Visual Impairment",
      funds: "Corporate Scholarship",
      criminal: "No",
      docs: ["Passport", "High School Certificate"],
    },
    {
      id: 8,
      session: "September 2026",
      body: "Pearson Edexcel",
      course: "Database Management Systems",
      first: "Fatima",
      last: "Al-Mansoor",
      email: "f.mansoor@gulfedu.ae",
      dob: "2002-10-03",
      country: "UAE",
      ethnicity: "Arab",
      address: "Jumeirah Heights, Dubai",
      disabilities: "None",
      funds: "Government Scholarship",
      criminal: "No",
      docs: ["CV", "SOP", "Degree Certificate"],
    },
    {
      id: 9,
      session: "January 2027",
      body: "City & Guilds",
      course: "Advanced Networking",
      first: "Oliver",
      last: "Hansen",
      email: "oliver.h@nordicmail.dk",
      dob: "2003-07-25",
      country: "Denmark",
      ethnicity: "Scandinavian",
      address: "Nørrebrogade 44, Copenhagen",
      disabilities: "ADHD (Rest Breaks)",
      funds: "Self-Funded",
      criminal: "No",
      docs: ["National ID", "Academic Transcripts"],
    },
    {
      id: 10,
      session: "September 2026",
      body: "Anglia Ruskin University",
      course: "Computer Science and Engineering",
      first: "Yuki",
      last: "Sato",
      email: "yuki.sato@tokyomail.jp",
      dob: "2005-03-14",
      country: "Japan",
      ethnicity: "East Asian",
      address: "4-10 Shiba-koen, Tokyo",
      disabilities: "None",
      funds: "Family Sponsorship",
      criminal: "No",
      docs: ["Passport", "Transcript", "IELTS"],
    },
    {
      id: 11,
      session: "June 2026",
      body: "Pearson Edexcel",
      course: "Database Management Systems",
      first: "Carlos",
      last: "Garcia",
      email: "c.garcia@correo.es",
      dob: "2001-12-29",
      country: "Spain",
      ethnicity: "Hispanic",
      address: "Calle de Alcala 15, Madrid",
      disabilities: "None",
      funds: "Private Savings",
      criminal: "No",
      docs: ["CV", "SOP", "Degree Certificate"],
    },
    {
      id: 12,
      session: "September 2026",
      body: "Anglia Ruskin University",
      course: "Computer Science and Engineering",
      first: "Amara",
      last: "Okafor",
      email: "amara.o@educonnect.ng",
      dob: "2004-08-08",
      country: "Nigeria",
      ethnicity: "Igbo",
      address: "12 Lekki Phase 1, Lagos",
      disabilities: "None",
      funds: "Family Sponsorship",
      criminal: "No",
      docs: ["Passport", "Transcript", "IELTS"],
    },
    {
      id: 13,
      session: "January 2027",
      body: "Anglia Ruskin University",
      course: "Fundamentals of Computing",
      first: "Hans",
      last: "Müller",
      email: "hans.m@berlin-edu.de",
      dob: "2003-05-16",
      country: "Germany",
      ethnicity: "White European",
      address: "Lindenstraße 4, Berlin",
      disabilities: "Physical Access (Ramp)",
      funds: "State Subsidy",
      criminal: "No",
      docs: ["Passport", "Transcript", "IELTS"],
    },
    {
      id: 14,
      session: "June 2026",
      body: "City & Guilds",
      course: "Advanced Networking",
      first: "Min-Jun",
      last: "Kim",
      email: "mj.kim@seoulnet.kr",
      dob: "2002-10-27",
      country: "South Korea",
      ethnicity: "Korean",
      address: "Gangnam-daero 55, Seoul",
      disabilities: "None",
      funds: "Bank Loan",
      criminal: "No",
      docs: ["National ID", "High School Transcripts"],
    },
    {
      id: 15,
      session: "September 2026",
      body: "Pearson Edexcel",
      course: "Database Management Systems",
      first: "Chloe",
      last: "Dubois",
      email: "c.dubois@paris-student.fr",
      dob: "2004-09-12",
      country: "France",
      ethnicity: "White European",
      address: "88 Rue de Rivoli, Paris",
      disabilities: "Dyscalculia Assistance",
      funds: "Self-Funded",
      criminal: "No",
      docs: ["CV", "SOP", "Degree Certificate"],
    },
    {
      id: 16,
      session: "January 2027",
      body: "Anglia Ruskin University",
      course: "Computer Science and Engineering",
      first: "Tarek",
      last: "Haddad",
      email: "tarek.h@学.com",
      dob: "2003-04-04",
      country: "Lebanon",
      ethnicity: "Arab",
      address: "Hamra Street, Beirut",
      disabilities: "None",
      funds: "Family Sponsorship",
      criminal: "No",
      docs: ["Passport", "Transcript", "IELTS"],
    },
    {
      id: 17,
      session: "June 2026",
      body: "Anglia Ruskin University",
      course: "Database Management Systems",
      first: "Elena",
      last: "Petrov",
      email: "e.petrov@mail.bg",
      dob: "2005-07-19",
      country: "Bulgaria",
      ethnicity: "Slavic",
      address: "Vitosha Blvd 32, Sofia",
      disabilities: "None",
      funds: "Academic Scholarship",
      criminal: "No",
      docs: ["Passport", "Transcript", "Academic References"],
    },
    {
      id: 18,
      session: "September 2026",
      body: "City & Guilds",
      course: "Advanced Networking",
      first: "Muhammad",
      last: "Ali",
      email: "m.ali@pakistanedu.pk",
      dob: "2002-12-01",
      country: "Pakistan",
      ethnicity: "Punjabi",
      address: "Sector F-7, Islamabad",
      disabilities: "None",
      funds: "Family Sponsorship",
      criminal: "No",
      docs: ["National ID", "Higher Secondary Certificate"],
    },
    {
      id: 19,
      session: "January 2027",
      body: "Pearson Edexcel",
      course: "Fundamentals of Computing",
      first: "Anya",
      last: "Smirnova",
      email: "anya.s@fastmail.ru",
      dob: "2004-08-15",
      country: "Russia",
      ethnicity: "Slavic",
      address: "Tverskaya St 12, Moscow",
      disabilities: "None",
      funds: "Private Savings",
      criminal: "No",
      docs: ["CV", "SOP", "Degree Certificate"],
    },
    {
      id: 20,
      session: "September 2026",
      body: "Anglia Ruskin University",
      course: "Computer Science and Engineering",
      first: "Nguyen",
      last: "Minh",
      email: "minh.nguyen@hanoiedu.vn",
      dob: "2003-05-30",
      country: "Vietnam",
      ethnicity: "Kinh",
      address: "102 Hoan Kiem, Hanoi",
      disabilities: "None",
      funds: "Local Bank Loan",
      criminal: "No",
      docs: ["Passport", "Transcript", "IELTS"],
    },
  ];

  // Distribute applications to agents
  const agentEmails = [
    "michael.johnson@educonnect.co.uk",
    "sarah.lee@educonnect.co.uk",
    "james.porter@educonnect.co.uk",
    "d.warner@beaconacademic.com",
    "r.chen@beaconacademic.com",
    "a.ross@beaconacademic.com",
    "priya.sharma@apexgateway.in",
    "r.kumar@apexgateway.in",
    "n.patel@apexgateway.in",
    "a.diallo@zenithpathways.com",
    "e.obi@zenithpathways.com",
    "b.musa@zenithpathways.com",
    "e.rostova@eurolink.de",
    "l.dubois@eurolink.de",
    "s.werner@eurolink.de",
  ];

  for (let i = 0; i < applicationsData.length; i++) {
    const data = applicationsData[i];
    const agentEmail = agentEmails[i % agentEmails.length];
    const agentUser = allAgentUsers[agentEmail];

    const session = sessions[data.session];
    const body = awardingBodies[data.body];
    const course =
      sessionCourses[`${data.session}-${data.course}-${data.body}`];

    if (!course) {
      console.error(
        `Course not found: ${data.session}-${data.course}-${data.body}`,
      );
      continue;
    }

    const appId = `APP-${2026000 + data.id}`;
    let application = await prisma.application.findUnique({
      where: { applicationId: appId },
    });

    if (!application) {
      application = await prisma.application.create({
        data: {
          applicationId: appId,
          status: ApplicationStatus.PENDING,
          stage: ApplicationStage.NEW,
          personalInformation: {
            create: {
              firstName: data.first,
              lastName: data.last,
              email: data.email,
              dateOfBirth: new Date(data.dob),
              currentAddress: data.address,
              countryOfResidence: data.country,
              ethnicity: data.ethnicity,
            },
          },
          courseSelection: {
            create: {
              sessionId: session.id,
              awardingBodyId: body.id,
              courseId: course.id,
            },
          },
          disabilityAndAccessibility: {
            create: {
              disabilityAndAccessibility: { value: data.disabilities },
            },
          },
          fund: {
            create: {
              source: data.funds,
            },
          },
          criminalBackground: {
            create: {
              offenseOrPenalty:
                data.criminal.toUpperCase() === "YES" ? YesNo.YES : YesNo.NO,
            },
          },
          supportingDocument: {
            create: {
              supportingDocumentAttachments: {
                create: data.docs.map((docName) => ({
                  name: docName,
                  attachment: {
                    create: {
                      paths: {
                        [docName]: `path/to/${docName.toLowerCase().replace(/ /g, "_")}.pdf`,
                      },
                    },
                  },
                })),
              },
            },
          },
        },
      });
    }

    // Link application to agent
    const userPortalCategory = await prisma.userPortalCategory.findFirst({
      where: { userId: agentUser.id, portalCategoryId: agentCategory.id },
    });

    let actorId: string | undefined;

    if (userPortalCategory) {
      const upcr = await prisma.userPortalCategoryRole.findFirst({
        where: { userPortalCategoryId: userPortalCategory.id },
      });

      if (upcr) {
        actorId = upcr.id;
        await prisma.userPortalCategoryRoleApplication.upsert({
          where: {
            userPortalCategoryRoleId_applicationId: {
              userPortalCategoryRoleId: upcr.id,
              applicationId: application.id,
            },
          },
          update: {},
          create: {
            userPortalCategoryRoleId: upcr.id,
            applicationId: application.id,
          },
        });
      }
    }

    // 8.1 Create/Find Student
    const studentPassword = await bcrypt.hash("Student#2026Pass", 10);
    let student = await prisma.student.findUnique({
      where: { email: data.email },
    });

    if (!student) {
      student = await prisma.student.create({
        data: {
          firstName: data.first,
          lastName: data.last,
          email: data.email,
          password: studentPassword,
          address: data.address,
          accountStatus: accountStatus.ACTIVE,
        },
      });
    }

    // 8.2 Link Student to Course (StudentCourse)
    await prisma.studentCourse.upsert({
      where: {
        studentId_sessionCourseId: {
          studentId: student.id,
          sessionCourseId: course.id,
        },
      },
      update: {
        enrollmentStatus: EnrollmentStatus.ACTIVE,
      },
      create: {
        studentId: student.id,
        sessionCourseId: course.id,
        enrollmentStatus: EnrollmentStatus.ACTIVE,
      },
    });

    // 8.3 Create Enrollment Records
    const enrollment = await prisma.studentEnrollments.upsert({
      where: { applicationId: application.id },
      update: {},
      create: {
        applicationId: application.id,
      },
    });

    await prisma.registeredStudent.upsert({
      where: { applicationId: application.id },
      update: {
        studentEnrollmentId: enrollment.id,
      },
      create: {
        applicationId: application.id,
        studentEnrollmentId: enrollment.id,
      },
    });

    // 8.4 Create Payment Records and History
    const paymentRecord = await prisma.paymentRecord.create({
      data: {
        applicantId: application.id,
        totalFee: 5000,
        paidAmount: 1000,
        remainingAmount: 4000,
        paymentPlan: PaymentPlan.INSTALLMENT,
        paymentStatus: PaymentStatus.PENDING,
        paymentHistories: {
          create: {
            amount: 1000,
            paymentMethod: PaymentMethod.BANK_TRANSFER,
            status: PaymentHistoryStatus.PAID,
            paymentDate: new Date(),
            reference: "Initial Seed Payment",
          },
        },
      },
    });

    // 8.5 Create Application History (Log)
    if (actorId) {
      await prisma.applicationLog.create({
        data: {
          applicationId: application.id,
          actorId: actorId,
          type: "APPLICATION_CREATED",
          value:
            "Application seeded with student, enrollment, and payment records.",
        },
      });
    }
  }

  // 9. CModules and Lessons
  logSection("9", "Modules, Lessons & Contents");
  const cModulesData = [
    {
      title: "Introduction to Computer Science",
      code: "CS101",
      type: CourseType.DEGREE_COURSE,
      moduleType: "DEGREE",
      ab: "Anglia Ruskin University",
      credit: 15,
    },
    {
      title: "Data Structures",
      code: "CS102",
      type: CourseType.DEGREE_COURSE,
      moduleType: "DEGREE",
      ab: "Anglia Ruskin University",
      credit: 15,
    },
    {
      title: "Algorithms",
      code: "CS103",
      type: CourseType.DEGREE_COURSE,
      moduleType: "DEGREE",
      ab: "Anglia Ruskin University",
      credit: 15,
    },
    {
      title: "Database Systems",
      code: "CS201",
      type: CourseType.DIPLOMA_COURSE,
      moduleType: "DIPLOMA",
      ab: "Pearson Edexcel",
      credit: 15,
    },
    {
      title: "Operating Systems",
      code: "CS202",
      type: CourseType.DIPLOMA_COURSE,
      moduleType: "DIPLOMA",
      ab: "Pearson Edexcel",
      credit: 15,
    },
    {
      title: "Computer Networks",
      code: "CS203",
      type: CourseType.DIPLOMA_COURSE,
      moduleType: "DIPLOMA",
      ab: "Pearson Edexcel",
      credit: 15,
    },
    {
      title: "Software Engineering",
      code: "CS301",
      type: CourseType.DEGREE_COURSE,
      moduleType: "DEGREE",
      ab: "Anglia Ruskin University",
      credit: 15,
    },
    {
      title: "Artificial Intelligence",
      code: "CS302",
      type: CourseType.DEGREE_COURSE,
      moduleType: "DEGREE",
      ab: "Anglia Ruskin University",
      credit: 15,
    },
    {
      title: "Machine Learning",
      code: "CS303",
      type: CourseType.DEGREE_COURSE,
      moduleType: "DEGREE",
      ab: "Anglia Ruskin University",
      credit: 15,
    },
    {
      title: "Web Development",
      code: "CS304",
      type: CourseType.DEGREE_COURSE,
      moduleType: "DEGREE",
      ab: "Anglia Ruskin University",
      credit: 15,
    },
    {
      title: "Cloud Computing",
      code: "CS305",
      type: CourseType.DEGREE_COURSE,
      moduleType: "DEGREE",
      ab: "Anglia Ruskin University",
      credit: 15,
    },
    {
      title: "Cyber Security",
      code: "CS401",
      type: CourseType.DIPLOMA_COURSE,
      moduleType: "DIPLOMA",
      ab: "City & Guilds",
      credit: 15,
    },
    {
      title: "Database Design & Implementation",
      code: "CS501",
      type: CourseType.DIPLOMA_COURSE,
      moduleType: "DIPLOMA",
      ab: "Anglia Ruskin University",
      credit: 15,
    },
    {
      title: "SQL & Data Modeling",
      code: "CS502",
      type: CourseType.DIPLOMA_COURSE,
      moduleType: "DIPLOMA",
      ab: "Anglia Ruskin University",
      credit: 15,
    },
    {
      title: "Computing Fundamentals",
      code: "CS601",
      type: CourseType.DIPLOMA_COURSE,
      moduleType: "DIPLOMA",
      ab: "Anglia Ruskin University",
      credit: 15,
    },
    {
      title: "Introduction to Programming",
      code: "CS602",
      type: CourseType.DIPLOMA_COURSE,
      moduleType: "DIPLOMA",
      ab: "Anglia Ruskin University",
      credit: 15,
    },
    {
      title: "Computing Essentials",
      code: "CS701",
      type: CourseType.DIPLOMA_COURSE,
      moduleType: "DIPLOMA",
      ab: "Pearson Edexcel",
      credit: 15,
    },
    {
      title: "Programming Basics",
      code: "CS702",
      type: CourseType.DIPLOMA_COURSE,
      moduleType: "DIPLOMA",
      ab: "Pearson Edexcel",
      credit: 15,
    },
  ];

  const lessonsData9 = [
    {
      title: "Binary and Hexadecimal",
      code: "L101",
      outcome: "Understand binary systems",
      type: LessonType.DEGREE,
      ab: "Anglia Ruskin University",
      moduleCode: "CS101",
    },
    {
      title: "Linked Lists",
      code: "L102",
      outcome: "Implement linked lists",
      type: LessonType.DEGREE,
      ab: "Anglia Ruskin University",
      moduleCode: "CS102",
    },
    {
      title: "Sorting Algorithms",
      code: "L103",
      outcome: "Analyze sorting efficiency",
      type: LessonType.DEGREE,
      ab: "Anglia Ruskin University",
      moduleCode: "CS103",
    },
    {
      title: "SQL Basics",
      code: "L201",
      outcome: "Write simple SQL queries",
      type: LessonType.DIPLOMA,
      ab: "Pearson Edexcel",
      moduleCode: "CS201",
    },
    {
      title: "Process Management",
      code: "L202",
      outcome: "Understand CPU scheduling",
      type: LessonType.DIPLOMA,
      ab: "Pearson Edexcel",
      moduleCode: "CS202",
    },
    {
      title: "OSI Model",
      code: "L203",
      outcome: "Explain the 7 layers of OSI",
      type: LessonType.DIPLOMA,
      ab: "Pearson Edexcel",
      moduleCode: "CS203",
    },
    {
      title: "Agile Methodologies",
      code: "L301",
      outcome: "Apply Scrum principles",
      type: LessonType.DEGREE,
      ab: "Anglia Ruskin University",
      moduleCode: "CS301",
    },
    {
      title: "Neural Networks",
      code: "L302",
      outcome: "Build a simple perceptron",
      type: LessonType.DEGREE,
      ab: "Anglia Ruskin University",
      moduleCode: "CS302",
    },
    {
      title: "Regression Analysis",
      code: "L303",
      outcome: "Perform linear regression",
      type: LessonType.DEGREE,
      ab: "Anglia Ruskin University",
      moduleCode: "CS303",
    },
    {
      title: "Full Stack Web Development",
      code: "L304",
      outcome: "Build full stack web applications",
      type: LessonType.DEGREE,
      ab: "Anglia Ruskin University",
      moduleCode: "CS304",
    },
    {
      title: "Cloud Architecture",
      code: "L305",
      outcome: "Design cloud-based solutions",
      type: LessonType.DEGREE,
      ab: "Anglia Ruskin University",
      moduleCode: "CS305",
    },
    {
      title: "Network Security Protocols",
      code: "L401",
      outcome: "Implement SSL/TLS",
      type: LessonType.DIPLOMA,
      ab: "City & Guilds",
      moduleCode: "CS401",
    },
    {
      title: "Relational Database Design",
      code: "L501",
      outcome: "Design normalized relational databases",
      type: LessonType.DIPLOMA,
      ab: "Anglia Ruskin University",
      moduleCode: "CS501",
    },
    {
      title: "SQL Query Optimization",
      code: "L502",
      outcome: "Write and optimize SQL queries",
      type: LessonType.DIPLOMA,
      ab: "Anglia Ruskin University",
      moduleCode: "CS502",
    },
    {
      title: "Computer Hardware Basics",
      code: "L601",
      outcome: "Identify computer hardware components",
      type: LessonType.DIPLOMA,
      ab: "Anglia Ruskin University",
      moduleCode: "CS601",
    },
    {
      title: "Programming Logic and Design",
      code: "L602",
      outcome: "Apply logical reasoning to programming",
      type: LessonType.DIPLOMA,
      ab: "Anglia Ruskin University",
      moduleCode: "CS602",
    },
    {
      title: "IT Fundamentals",
      code: "L701",
      outcome: "Understand core IT concepts",
      type: LessonType.DIPLOMA,
      ab: "Pearson Edexcel",
      moduleCode: "CS701",
    },
    {
      title: "Programming Concepts",
      code: "L702",
      outcome: "Understand basic programming constructs",
      type: LessonType.DIPLOMA,
      ab: "Pearson Edexcel",
      moduleCode: "CS702",
    },
  ];

  const cModules: Record<string, any> = {};
  for (const cm of cModulesData) {
    const ab = awardingBodies[cm.ab];
    if (!ab) continue;
    cModules[cm.code] = await prisma.cModule.upsert({
      where: { code: cm.code },
      update: {
        credit: cm.credit,
        estimatedTimeToComplete: cm.credit * 10 * 60,
      },
      create: {
        title: cm.title,
        code: cm.code,
        courseType: cm.type,
        moduleType: cm.moduleType,
        credit: cm.credit,
        estimatedTimeToComplete: cm.credit * 10 * 60,
        awardingBodyId: ab.id,
        status: CModuleStatus.ACTIVE,
      },
    });
  }

  for (const ld of lessonsData9) {
    const ab = awardingBodies[ld.ab];
    let lesson = await prisma.lesson.findFirst({
      where: { code: ld.code },
    });
    if (!lesson) {
      lesson = await prisma.lesson.create({
        data: {
          title: ld.title,
          code: ld.code,
          outcome: ld.outcome,
          type: ld.type,
          estimatedTimeToComplete: 120,
          awardingBodyId: ab?.id,
        },
      });
    }

    const cm = cModules[ld.moduleCode];
    if (cm && lesson) {
      await prisma.moduleLesson.upsert({
        where: {
          cModuleId_lessonId: {
            cModuleId: cm.id,
            lessonId: lesson.id,
          },
        },
        update: {},
        create: {
          cModuleId: cm.id,
          lessonId: lesson.id,
          index: 1,
        },
      });
    }
  }

  // 10. Assessments
  logSection("10", "Assessments (Quiz & Assignment)");
  const assessmentsData = [
    {
      name: "CS101 Quiz 1",
      code: "A101",
      category: AssessmentCategory.QUIZ,
      type: AssessmentType.DEGREE,
      moduleCode: "CS101",
      ab: "Anglia Ruskin University",
      totalPoints: 100,
      questionSize: 10,
      weight: 100,
    },
    {
      name: "CS102 Assignment 1",
      code: "A102",
      category: AssessmentCategory.ASSIGNMENT,
      type: AssessmentType.DEGREE,
      moduleCode: "CS102",
      ab: "Anglia Ruskin University",
      totalPoints: 100,
      weight: 100,
    },
    {
      name: "CS103 Quiz 1",
      code: "A103",
      category: AssessmentCategory.QUIZ,
      type: AssessmentType.DEGREE,
      moduleCode: "CS103",
      ab: "Anglia Ruskin University",
      totalPoints: 100,
      questionSize: 10,
      weight: 100,
    },
    {
      name: "CS201 Assignment 1",
      code: "A201",
      category: AssessmentCategory.ASSIGNMENT,
      type: AssessmentType.DIPLOMA,
      moduleCode: "CS201",
      ab: "Pearson Edexcel",
      totalPoints: 100,
      weight: 100,
    },
    {
      name: "CS202 Quiz 1",
      code: "A202",
      category: AssessmentCategory.QUIZ,
      type: AssessmentType.DIPLOMA,
      moduleCode: "CS202",
      ab: "Pearson Edexcel",
      totalPoints: 100,
      questionSize: 10,
      weight: 100,
    },
    {
      name: "CS203 Assignment 1",
      code: "A203",
      category: AssessmentCategory.ASSIGNMENT,
      type: AssessmentType.DIPLOMA,
      moduleCode: "CS203",
      ab: "Pearson Edexcel",
      totalPoints: 100,
      weight: 100,
    },
    {
      name: "CS301 Quiz 1",
      code: "A301",
      category: AssessmentCategory.QUIZ,
      type: AssessmentType.DEGREE,
      moduleCode: "CS301",
      ab: "Anglia Ruskin University",
      totalPoints: 100,
      questionSize: 10,
      weight: 100,
    },
    {
      name: "CS302 Assignment 1",
      code: "A302",
      category: AssessmentCategory.ASSIGNMENT,
      type: AssessmentType.DEGREE,
      moduleCode: "CS302",
      ab: "Anglia Ruskin University",
      totalPoints: 100,
      weight: 100,
    },
    {
      name: "CS303 Quiz 1",
      code: "A303",
      category: AssessmentCategory.QUIZ,
      type: AssessmentType.DEGREE,
      moduleCode: "CS303",
      ab: "Anglia Ruskin University",
      totalPoints: 100,
      questionSize: 10,
      weight: 100,
    },
    {
      name: "CS304 Web Development Project",
      code: "A304",
      category: AssessmentCategory.ASSIGNMENT,
      type: AssessmentType.DEGREE,
      moduleCode: "CS304",
      ab: "Anglia Ruskin University",
      totalPoints: 50,
      weight: 50,
    },
    {
      name: "CS305 Cloud Computing Quiz",
      code: "A305",
      category: AssessmentCategory.QUIZ,
      type: AssessmentType.DEGREE,
      moduleCode: "CS305",
      ab: "Anglia Ruskin University",
      totalPoints: 100,
      questionSize: 10,
      weight: 100,
    },
    {
      name: "CS401 Assignment 1",
      code: "A401",
      category: AssessmentCategory.ASSIGNMENT,
      type: AssessmentType.DIPLOMA,
      moduleCode: "CS401",
      ab: "City & Guilds",
      totalPoints: 100,
      weight: 100,
    },
  ];

  for (const ad of assessmentsData) {
    const ab = awardingBodies[ad.ab];
    let assessment = await prisma.assessment.findFirst({
      where: { assessmentCode: ad.code },
    });

    if (!assessment) {
      assessment = await prisma.assessment.create({
        data: {
          nameOrTitle: ad.name,
          assessmentCode: ad.code,
          assessmentCategory: ad.category,
          assessmentType: ad.type,
          descriptionOrInstructions: "Please complete this assessment.",
          status: AssessmentStatus.PUBLISHED,
          availableStartDate: new Date(),
          availableEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          timeLimit: ad.category === AssessmentCategory.QUIZ ? 30 : 120,
          totalPointsOrWeight: ad.totalPoints,
          questionSize: ad.questionSize,
          weight: ad.weight ?? 100,
          attempts: ad.category === AssessmentCategory.QUIZ ? 2 : 1,
          lateSubmissions: true,
          awardingBodyId: ab?.id,
        },
      });
    }

    const cm = cModules[ad.moduleCode];
    if (cm && assessment) {
      await prisma.moduleAssessment.upsert({
        where: {
          cModuleId_assessmentId: {
            cModuleId: cm.id,
            assessmentId: assessment.id,
          },
        },
        update: {},
        create: {
          cModuleId: cm.id,
          assessmentId: assessment.id,
          index: 1,
        },
      });
    }
  }

  // 10.1 Create Quiz Questions for each quiz assessment
  logSection("10.1", "Quiz Questions");
  const quizQuestionsSeed: Array<{
    code: string;
    questions: Array<{
      type:
        | "MULTIPLE_CHOICE"
        | "MULTIPLE_SELECT"
        | "TRUE_FALSE"
        | "FILL_BLANK"
        | "MATCHING"
        | "NUMERICAL_ENTRY"
        | "ORDERING";
      questionText: string;
      point: number;
      partialMark?: boolean;
      options?: any;
      answer: any;
    }>;
  }> = [
    {
      code: "A101",
      questions: [
        {
          type: "MULTIPLE_CHOICE",
          questionText:
            "Which algorithm finds the shortest path in a weighted graph?",
          point: 10,
          options: [
            { id: "a", text: "Dijkstra's Algorithm" },
            { id: "b", text: "Bellman-Ford" },
            { id: "c", text: "Kruskal's Algorithm" },
            { id: "d", text: "Prim's Algorithm" },
          ],
          answer: "a",
        },
        {
          type: "MULTIPLE_CHOICE",
          questionText: "What is the worst-case time complexity of Quick Sort?",
          point: 10,
          options: [
            { id: "a", text: "O(n log n)" },
            { id: "b", text: "O(n²)" },
            { id: "c", text: "O(n)" },
            { id: "d", text: "O(log n)" },
          ],
          answer: "b",
        },
        {
          type: "MULTIPLE_SELECT",
          questionText:
            "Which of the following are characteristics of dynamic programming?",
          point: 10,
          partialMark: true,
          options: [
            { id: "a", text: "Overlapping subproblems" },
            { id: "b", text: "Optimal substructure" },
            { id: "c", text: "Greedy choice property" },
            { id: "d", text: "Stores intermediate results" },
          ],
          answer: ["a", "b", "d"],
        },
        {
          type: "TRUE_FALSE",
          questionText: "Heap Sort has a time complexity of O(n log n).",
          point: 10,
          answer: true,
        },
        {
          type: "TRUE_FALSE",
          questionText: "Linear search requires the data to be sorted.",
          point: 10,
          answer: false,
        },
        {
          type: "FILL_BLANK",
          questionText: "The time complexity of linear search is ______.",
          point: 10,
          answer: "O(n)",
        },
        {
          type: "MATCHING",
          questionText: "Match each algorithm to its description.",
          point: 10,
          options: {
            leftSide: [
              { id: "l1", text: "Binary Search" },
              { id: "l2", text: "Bubble Sort" },
              { id: "l3", text: "DFS" },
            ],
            rightSide: [
              { id: "r1", text: "Divides search space in half" },
              { id: "r2", text: "Swaps adjacent elements" },
              { id: "r3", text: "Uses stack or recursion" },
            ],
          },
          answer: [
            { leftSideId: "l1", rightSideId: "r1" },
            { leftSideId: "l2", rightSideId: "r2" },
            { leftSideId: "l3", rightSideId: "r3" },
          ],
        },
        {
          type: "ORDERING",
          questionText: "Arrange the steps of Merge Sort in correct order.",
          point: 10,
          options: [
            { id: "o1", text: "Split array" },
            { id: "o2", text: "Divide into halves" },
            { id: "o3", text: "Combine sorted halves" },
            { id: "o4", text: "Merge subarrays" },
          ],
          answer: ["o1", "o2", "o4", "o3"],
        },
        {
          type: "MULTIPLE_CHOICE",
          questionText: "What is the time complexity of binary search?",
          point: 10,
          options: [
            { id: "a", text: "O(n)" },
            { id: "b", text: "O(log n)" },
            { id: "c", text: "O(n²)" },
            { id: "d", text: "O(1)" },
          ],
          answer: "b",
        },
        {
          type: "MULTIPLE_SELECT",
          questionText: "Which of the following are O(n²) sorting algorithms?",
          point: 10,
          partialMark: true,
          options: [
            { id: "a", text: "Bubble Sort" },
            { id: "b", text: "Merge Sort" },
            { id: "c", text: "Selection Sort" },
            { id: "d", text: "Insertion Sort" },
          ],
          answer: ["a", "c", "d"],
        },
      ],
    },
    {
      code: "A202",
      questions: [
        {
          type: "MULTIPLE_CHOICE",
          questionText: "Which tool is commonly used in data science?",
          point: 10,
          options: [
            { id: "a", text: "Python" },
            { id: "b", text: "Excel" },
            { id: "c", text: "Tableau" },
            { id: "d", text: "All of the above" },
          ],
          answer: "d",
        },
        {
          type: "MULTIPLE_CHOICE",
          questionText: "What is the first step in data analysis?",
          point: 10,
          options: [
            { id: "a", text: "Data collection" },
            { id: "b", text: "Data visualization" },
            { id: "c", text: "Modeling" },
            { id: "d", text: "Deployment" },
          ],
          answer: "a",
        },
        {
          type: "MULTIPLE_SELECT",
          questionText:
            "Which of the following are stages in the data analysis pipeline?",
          point: 10,
          partialMark: true,
          options: [
            { id: "a", text: "Data cleaning" },
            { id: "b", text: "Data visualization" },
            { id: "c", text: "Modeling" },
            { id: "d", text: "Hardware setup" },
          ],
          answer: ["a", "b", "c"],
        },
        {
          type: "TRUE_FALSE",
          questionText: "Data visualization helps in interpreting data.",
          point: 10,
          answer: true,
        },
        {
          type: "TRUE_FALSE",
          questionText: "Excel is not used in data science at all.",
          point: 10,
          answer: false,
        },
        {
          type: "FILL_BLANK",
          questionText: "Data cleaning removes ______ from datasets.",
          point: 10,
          answer: "errors and noise",
        },
        {
          type: "MATCHING",
          questionText: "Match each tool to its primary use.",
          point: 10,
          options: {
            leftSide: [
              { id: "l1", text: "Python" },
              { id: "l2", text: "Excel" },
              { id: "l3", text: "Tableau" },
            ],
            rightSide: [
              { id: "r1", text: "Programming & analysis" },
              { id: "r2", text: "Spreadsheet calculations" },
              { id: "r3", text: "Data visualization" },
            ],
          },
          answer: [
            { leftSideId: "l1", rightSideId: "r1" },
            { leftSideId: "l2", rightSideId: "r2" },
            { leftSideId: "l3", rightSideId: "r3" },
          ],
        },
        {
          type: "NUMERICAL_ENTRY",
          questionText: "Calculate the mean of 2, 4, and 6.",
          point: 10,
          answer: { correctValue: 4, tolerance: 0 },
        },
        {
          type: "ORDERING",
          questionText: "Arrange the data analysis lifecycle in order.",
          point: 10,
          options: [
            { id: "o1", text: "Collect" },
            { id: "o2", text: "Clean" },
            { id: "o3", text: "Analyze" },
            { id: "o4", text: "Visualize" },
          ],
          answer: ["o1", "o2", "o3", "o4"],
        },
        {
          type: "MULTIPLE_CHOICE",
          questionText: "What does computational thinking primarily involve?",
          point: 10,
          options: [
            { id: "a", text: "Decomposition" },
            { id: "b", text: "Pattern recognition" },
            { id: "c", text: "Abstraction" },
            { id: "d", text: "All of the above" },
          ],
          answer: "d",
        },
      ],
    },
    {
      code: "A301",
      questions: [
        {
          type: "MULTIPLE_CHOICE",
          questionText: "What is a variable in programming?",
          point: 10,
          options: [
            { id: "a", text: "A storage location for data" },
            { id: "b", text: "A type of loop" },
            { id: "c", text: "A function" },
            { id: "d", text: "An operator" },
          ],
          answer: "a",
        },
        {
          type: "MULTIPLE_CHOICE",
          questionText: "What is the output of print(2+3) in Python?",
          point: 10,
          options: [
            { id: "a", text: "2" },
            { id: "b", text: "3" },
            { id: "c", text: "5" },
            { id: "d", text: "23" },
          ],
          answer: "c",
        },
        {
          type: "MULTIPLE_SELECT",
          questionText: "Which of the following are programming paradigms?",
          point: 10,
          partialMark: true,
          options: [
            { id: "a", text: "Object-oriented" },
            { id: "b", text: "Functional" },
            { id: "c", text: "Procedural" },
            { id: "d", text: "Electrical" },
          ],
          answer: ["a", "b", "c"],
        },
        {
          type: "TRUE_FALSE",
          questionText: "Python is a compiled language.",
          point: 10,
          answer: false,
        },
        {
          type: "TRUE_FALSE",
          questionText: "Loops allow repeated execution of code blocks.",
          point: 10,
          answer: true,
        },
        {
          type: "FILL_BLANK",
          questionText: "The 'if' statement is used for ______ in programming.",
          point: 10,
          answer: "decision making",
        },
        {
          type: "MATCHING",
          questionText: "Match each keyword to its purpose.",
          point: 10,
          options: {
            leftSide: [
              { id: "l1", text: "if" },
              { id: "l2", text: "for" },
              { id: "l3", text: "print" },
            ],
            rightSide: [
              { id: "r1", text: "Decision making" },
              { id: "r2", text: "Looping" },
              { id: "r3", text: "Output" },
            ],
          },
          answer: [
            { leftSideId: "l1", rightSideId: "r1" },
            { leftSideId: "l2", rightSideId: "r2" },
            { leftSideId: "l3", rightSideId: "r3" },
          ],
        },
        {
          type: "NUMERICAL_ENTRY",
          questionText: "Calculate 10% of 200.",
          point: 10,
          answer: { correctValue: 20, tolerance: 0 },
        },
        {
          type: "ORDERING",
          questionText: "Arrange the program execution cycle in order.",
          point: 10,
          options: [
            { id: "o1", text: "Write code" },
            { id: "o2", text: "Compile" },
            { id: "o3", text: "Execute" },
            { id: "o4", text: "Debug" },
          ],
          answer: ["o1", "o2", "o3", "o4"],
        },
        {
          type: "MULTIPLE_SELECT",
          questionText: "Which of the following are Python data types?",
          point: 10,
          partialMark: true,
          options: [
            { id: "a", text: "int" },
            { id: "b", text: "float" },
            { id: "c", text: "string" },
            { id: "d", text: "circuit" },
          ],
          answer: ["a", "b", "c"],
        },
      ],
    },
    {
      code: "A103",
      questions: [
        {
          type: "MULTIPLE_CHOICE",
          questionText: "Which data structure uses LIFO principle?",
          point: 10,
          options: [
            { id: "a", text: "Queue" },
            { id: "b", text: "Stack" },
            { id: "c", text: "Array" },
            { id: "d", text: "Linked List" },
          ],
          answer: "b",
        },
        {
          type: "MULTIPLE_CHOICE",
          questionText:
            "What is the time complexity of accessing an array element by index?",
          point: 10,
          options: [
            { id: "a", text: "O(1)" },
            { id: "b", text: "O(n)" },
            { id: "c", text: "O(log n)" },
            { id: "d", text: "O(n²)" },
          ],
          answer: "a",
        },
        {
          type: "MULTIPLE_SELECT",
          questionText: "Which of the following are linear data structures?",
          point: 10,
          partialMark: true,
          options: [
            { id: "a", text: "Array" },
            { id: "b", text: "Tree" },
            { id: "c", text: "Linked List" },
            { id: "d", text: "Stack" },
          ],
          answer: ["a", "c", "d"],
        },
        {
          type: "TRUE_FALSE",
          questionText: "A queue follows First-In-First-Out (FIFO) order.",
          point: 10,
          answer: true,
        },
        {
          type: "TRUE_FALSE",
          questionText: "Hash tables provide O(1) average-case lookup.",
          point: 10,
          answer: true,
        },
        {
          type: "FILL_BLANK",
          questionText:
            "A ______ is a node-based data structure where each node points to the next.",
          point: 10,
          answer: "linked list",
        },
        {
          type: "MATCHING",
          questionText: "Match data structure to its property.",
          point: 10,
          options: {
            leftSide: [
              { id: "l1", text: "Stack" },
              { id: "l2", text: "Queue" },
              { id: "l3", text: "Hash Table" },
            ],
            rightSide: [
              { id: "r1", text: "LIFO order" },
              { id: "r2", text: "FIFO order" },
              { id: "r3", text: "Key-value pairs" },
            ],
          },
          answer: [
            { leftSideId: "l1", rightSideId: "r1" },
            { leftSideId: "l2", rightSideId: "r2" },
            { leftSideId: "l3", rightSideId: "r3" },
          ],
        },
        {
          type: "NUMERICAL_ENTRY",
          questionText:
            "How many nodes are in a perfect binary tree of height 3?",
          point: 10,
          answer: { correctValue: 7, tolerance: 0 },
        },
        {
          type: "ORDERING",
          questionText: "Arrange the steps of depth-first search.",
          point: 10,
          options: [
            { id: "o1", text: "Visit node" },
            { id: "o2", text: "Push to stack" },
            { id: "o3", text: "Pop from stack" },
            { id: "o4", text: "Explore neighbors" },
          ],
          answer: ["o1", "o2", "o4", "o3"],
        },
        {
          type: "MULTIPLE_CHOICE",
          questionText:
            "Which algorithm is used to find the shortest path in an unweighted graph?",
          point: 10,
          options: [
            { id: "a", text: "Dijkstra" },
            { id: "b", text: "BFS" },
            { id: "c", text: "DFS" },
            { id: "d", text: "Kruskal" },
          ],
          answer: "b",
        },
      ],
    },
    {
      code: "A303",
      questions: [
        {
          type: "MULTIPLE_CHOICE",
          questionText: "What does puzzle-based learning primarily improve?",
          point: 10,
          options: [
            { id: "a", text: "Logical thinking" },
            { id: "b", text: "Typing speed" },
            { id: "c", text: "Memory" },
            { id: "d", text: "Hardware knowledge" },
          ],
          answer: "a",
        },
        {
          type: "MULTIPLE_CHOICE",
          questionText: "What is the 5th Fibonacci number?",
          point: 10,
          options: [
            { id: "a", text: "3" },
            { id: "b", text: "5" },
            { id: "c", text: "8" },
            { id: "d", text: "13" },
          ],
          answer: "b",
        },
        {
          type: "MULTIPLE_SELECT",
          questionText:
            "Which skills are enhanced by solving programming puzzles?",
          point: 10,
          partialMark: true,
          options: [
            { id: "a", text: "Logic building" },
            { id: "b", text: "Creativity" },
            { id: "c", text: "Critical thinking" },
            { id: "d", text: "Public speaking" },
          ],
          answer: ["a", "b", "c"],
        },
        {
          type: "TRUE_FALSE",
          questionText: "Puzzles enhance logical reasoning skills.",
          point: 10,
          answer: true,
        },
        {
          type: "TRUE_FALSE",
          questionText: "Recursion is never useful for solving puzzles.",
          point: 10,
          answer: false,
        },
        {
          type: "FILL_BLANK",
          questionText: "Algorithms are used to solve ______ step by step.",
          point: 10,
          answer: "problems",
        },
        {
          type: "MATCHING",
          questionText: "Match each puzzle to its primary skill.",
          point: 10,
          options: {
            leftSide: [
              { id: "l1", text: "Sudoku" },
              { id: "l2", text: "Maze" },
              { id: "l3", text: "Chess" },
            ],
            rightSide: [
              { id: "r1", text: "Logic" },
              { id: "r2", text: "Pathfinding" },
              { id: "r3", text: "Strategy" },
            ],
          },
          answer: [
            { leftSideId: "l1", rightSideId: "r1" },
            { leftSideId: "l2", rightSideId: "r2" },
            { leftSideId: "l3", rightSideId: "r3" },
          ],
        },
        {
          type: "NUMERICAL_ENTRY",
          questionText: "What is the value of 2^10?",
          point: 10,
          answer: { correctValue: 1024, tolerance: 0 },
        },
        {
          type: "ORDERING",
          questionText: "Arrange the puzzle-solving process in order.",
          point: 10,
          options: [
            { id: "o1", text: "Understand problem" },
            { id: "o2", text: "Plan solution" },
            { id: "o3", text: "Implement solution" },
            { id: "o4", text: "Test and verify" },
          ],
          answer: ["o1", "o2", "o3", "o4"],
        },
        {
          type: "MULTIPLE_CHOICE",
          questionText:
            "Which approach is best for solving the Tower of Hanoi?",
          point: 10,
          options: [
            { id: "a", text: "Iteration" },
            { id: "b", text: "Recursion" },
            { id: "c", text: "Greedy" },
            { id: "d", text: "Divide and conquer" },
          ],
          answer: "b",
        },
      ],
    },
    {
      code: "A305",
      questions: [
        {
          type: "MULTIPLE_CHOICE",
          questionText:
            "Which cloud service model provides virtualized computing resources over the internet?",
          point: 10,
          options: [
            { id: "a", text: "IaaS" },
            { id: "b", text: "PaaS" },
            { id: "c", text: "SaaS" },
            { id: "d", text: "FaaS" },
          ],
          answer: "a",
        },
        {
          type: "MULTIPLE_CHOICE",
          questionText: "What does AWS S3 primarily provide?",
          point: 10,
          options: [
            { id: "a", text: "Object storage" },
            { id: "b", text: "Virtual machines" },
            { id: "c", text: "Database hosting" },
            { id: "d", text: "DNS management" },
          ],
          answer: "a",
        },
        {
          type: "MULTIPLE_SELECT",
          questionText: "Which of the following are cloud deployment models?",
          point: 10,
          partialMark: true,
          options: [
            { id: "a", text: "Public cloud" },
            { id: "b", text: "Private cloud" },
            { id: "c", text: "Hybrid cloud" },
            { id: "d", text: "Local cloud" },
          ],
          answer: ["a", "b", "c"],
        },
        {
          type: "TRUE_FALSE",
          questionText:
            "Horizontal scaling means adding more resources to a single node.",
          point: 10,
          answer: false,
        },
        {
          type: "TRUE_FALSE",
          questionText:
            "Serverless computing still uses servers managed by the cloud provider.",
          point: 10,
          answer: true,
        },
        {
          type: "FILL_BLANK",
          questionText:
            "The practice of distributing workloads across multiple computing resources is called load ______.",
          point: 10,
          answer: "balancing",
        },
        {
          type: "MATCHING",
          questionText: "Match each cloud provider to its primary service.",
          point: 10,
          options: {
            leftSide: [
              { id: "l1", text: "AWS" },
              { id: "l2", text: "Azure" },
              { id: "l3", text: "GCP" },
            ],
            rightSide: [
              { id: "r1", text: "EC2 / S3" },
              { id: "r2", text: "Virtual Machines / Azure Functions" },
              { id: "r3", text: "Compute Engine / Cloud Storage" },
            ],
          },
          answer: [
            { leftSideId: "l1", rightSideId: "r1" },
            { leftSideId: "l2", rightSideId: "r2" },
            { leftSideId: "l3", rightSideId: "r3" },
          ],
        },
        {
          type: "NUMERICAL_ENTRY",
          questionText:
            "How many nines of availability does 99.99% uptime represent?",
          point: 10,
          answer: { correctValue: 4, tolerance: 0 },
        },
        {
          type: "ORDERING",
          questionText: "Arrange the steps of deploying a cloud application.",
          point: 10,
          options: [
            { id: "o1", text: "Write code" },
            { id: "o2", text: "Containerize" },
            { id: "o3", text: "Deploy to cloud" },
            { id: "o4", text: "Monitor and scale" },
          ],
          answer: ["o1", "o2", "o3", "o4"],
        },
        {
          type: "MULTIPLE_CHOICE",
          questionText:
            "Which technology is commonly used for container orchestration?",
          point: 10,
          options: [
            { id: "a", text: "Kubernetes" },
            { id: "b", text: "Docker Compose" },
            { id: "c", text: "Terraform" },
            { id: "d", text: "Ansible" },
          ],
          answer: "a",
        },
      ],
    },
  ];

  for (const qs of quizQuestionsSeed) {
    const assessment = await prisma.assessment.findFirst({
      where: { assessmentCode: qs.code },
    });
    if (!assessment) continue;

    for (let i = 0; i < qs.questions.length; i++) {
      const q = qs.questions[i];
      await prisma.quizQuestion.upsert({
        where: { id: `${assessment.id}-q${i}` },
        update: {
          type: q.type,
          questionText: q.questionText,
          point: q.point,
          options: q.options ?? Prisma.JsonNull,
          answer: q.answer as Prisma.InputJsonValue,
          partialMark: q.partialMark ?? null,
        },
        create: {
          id: `${assessment.id}-q${i}`,
          type: q.type,
          questionText: q.questionText,
          point: q.point,
          options: q.options ?? Prisma.JsonNull,
          answer: q.answer as Prisma.InputJsonValue,
          partialMark: q.partialMark ?? null,
          assessmentId: assessment.id,
        },
      });
    }
  }

  // 10.2 Create Assignment Questions with Rubric Criteria
  logSection("10.2", "Assignment Questions & Rubrics");
  const assignmentQuestionsSeed: Array<{
    code: string;
    questions: Array<{
      questionText: string;
      point: number;
      rubricName: string;
      rubricDescription: string;
      rubricCriteria: Array<{
        name: string;
        description: string;
        weight: number;
        levels: Array<{ name: string; description: string; weight: number }>;
      }>;
    }>;
  }> = [
    {
      // Semester 1 Assignment: Technical Accuracy + Documentation
      code: "A102",
      questions: [
        {
          questionText:
            "Implement a linked list data structure with insert, delete, and search operations. Provide full documentation.",
          point: 100,
          rubricName: "Data Structure Implementation Rubric",
          rubricDescription:
            "Evaluates code quality, correctness, and documentation of the linked list implementation.",
          rubricCriteria: [
            {
              name: "Technical Accuracy",
              description: "Correctness and efficiency of the implementation",
              weight: 50,
              levels: [
                {
                  name: "Excellent",
                  description: "Flawless logic, fully functional",
                  weight: 50,
                },
                {
                  name: "Satisfactory",
                  description: "Functions with minor bugs",
                  weight: 30,
                },
                {
                  name: "Needs Improvement",
                  description: "Critical errors, non-functional",
                  weight: 10,
                },
              ],
            },
            {
              name: "Documentation",
              description: "Quality of comments and documentation",
              weight: 50,
              levels: [
                {
                  name: "Excellent",
                  description: "Exceptionally well-commented",
                  weight: 50,
                },
                {
                  name: "Satisfactory",
                  description: "Adequately commented",
                  weight: 30,
                },
                {
                  name: "Needs Improvement",
                  description: "No documentation or comments",
                  weight: 10,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      // Semester 2 Assignment: System Architecture + Problem Solving
      code: "A201",
      questions: [
        {
          questionText:
            "Design and implement a database schema for a university management system. Submit your ER diagram and SQL implementation.",
          point: 100,
          rubricName: "Database Design Rubric",
          rubricDescription:
            "Evaluates system architecture and problem-solving approach.",
          rubricCriteria: [
            {
              name: "System Architecture",
              description: "Quality of database schema design and scalability",
              weight: 50,
              levels: [
                {
                  name: "Excellent",
                  description: "Optimal structure, highly scalable",
                  weight: 50,
                },
                {
                  name: "Satisfactory",
                  description: "Acceptable design, minor bottlenecks",
                  weight: 30,
                },
                {
                  name: "Needs Improvement",
                  description: "Poorly structured, unscalable",
                  weight: 10,
                },
              ],
            },
            {
              name: "Problem Solving",
              description: "Effectiveness of the solution approach",
              weight: 50,
              levels: [
                {
                  name: "Excellent",
                  description: "Creative and effective solutions",
                  weight: 50,
                },
                {
                  name: "Satisfactory",
                  description: "Standard approach used",
                  weight: 30,
                },
                {
                  name: "Needs Improvement",
                  description: "Fails to address core problem",
                  weight: 10,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      // Semester 3 Assignment: Analytical Rigor + Execution Quality
      code: "A203",
      questions: [
        {
          questionText:
            "Analyze a given network traffic dataset and design a secure network architecture. Submit your analysis report and design document.",
          point: 100,
          rubricName: "Network Analysis Rubric",
          rubricDescription:
            "Evaluates analytical depth and execution quality.",
          rubricCriteria: [
            {
              name: "Analytical Rigor",
              description: "Depth of data analysis and evaluation",
              weight: 50,
              levels: [
                {
                  name: "Excellent",
                  description: "Deep, critical evaluation of data",
                  weight: 50,
                },
                {
                  name: "Satisfactory",
                  description: "Generic analysis with basic trends",
                  weight: 30,
                },
                {
                  name: "Needs Improvement",
                  description: "Superfluous or incorrect data usage",
                  weight: 10,
                },
              ],
            },
            {
              name: "Execution Quality",
              description: "Professional standards and completeness",
              weight: 50,
              levels: [
                {
                  name: "Excellent",
                  description: "Professional standards, deployment ready",
                  weight: 50,
                },
                {
                  name: "Satisfactory",
                  description: "Working model but rough execution",
                  weight: 30,
                },
                {
                  name: "Needs Improvement",
                  description: "Incomplete or broken execution",
                  weight: 10,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      // AI Assignment: Innovation & Scope + Presentation & Defense
      code: "A302",
      questions: [
        {
          questionText:
            "Build an AI model to solve a real-world classification problem. Submit your model, code, and a presentation video explaining your approach.",
          point: 100,
          rubricName: "AI Project Rubric",
          rubricDescription:
            "Evaluates innovation, scope, and presentation quality.",
          rubricCriteria: [
            {
              name: "Innovation & Scope",
              description: "Originality and complexity of the problem solved",
              weight: 50,
              levels: [
                {
                  name: "Excellent",
                  description: "Complex problem solved elegantly",
                  weight: 50,
                },
                {
                  name: "Satisfactory",
                  description: "Met basic project scope",
                  weight: 30,
                },
                {
                  name: "Needs Improvement",
                  description: "Substandard scope, unfinished build",
                  weight: 10,
                },
              ],
            },
            {
              name: "Presentation & Defense",
              description:
                "Quality of presentation and ability to explain decisions",
              weight: 50,
              levels: [
                {
                  name: "Excellent",
                  description: "Flawless delivery and explanations",
                  weight: 50,
                },
                {
                  name: "Satisfactory",
                  description: "Clear but missed minor points",
                  weight: 30,
                },
                {
                  name: "Needs Improvement",
                  description: "Unable to justify design choices",
                  weight: 10,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      // Cyber Security Assignment: Innovation & Scope + Presentation & Defense
      code: "A401",
      questions: [
        {
          questionText:
            "Implement a security protocol for a web application. Submit your implementation, threat model, and security audit report.",
          point: 100,
          rubricName: "Cyber Security Project Rubric",
          rubricDescription:
            "Evaluates security implementation and documentation quality.",
          rubricCriteria: [
            {
              name: "Innovation & Scope",
              description: "Complexity of security solution",
              weight: 50,
              levels: [
                {
                  name: "Excellent",
                  description: "Advanced security measures implemented",
                  weight: 50,
                },
                {
                  name: "Satisfactory",
                  description: "Basic security measures in place",
                  weight: 30,
                },
                {
                  name: "Needs Improvement",
                  description: "Incomplete security implementation",
                  weight: 10,
                },
              ],
            },
            {
              name: "Presentation & Defense",
              description: "Quality of threat model and audit report",
              weight: 50,
              levels: [
                {
                  name: "Excellent",
                  description: "Comprehensive threat analysis",
                  weight: 50,
                },
                {
                  name: "Satisfactory",
                  description: "Adequate documentation provided",
                  weight: 30,
                },
                {
                  name: "Needs Improvement",
                  description: "Missing critical documentation",
                  weight: 10,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      // Semester 4 Assignment: Frontend + Backend Integration
      code: "A304",
      questions: [
        {
          questionText:
            "Build a full-stack web application with user authentication and data persistence. Submit your source code, API documentation, and a deployment guide.",
          point: 100,
          rubricName: "Full-Stack Development Rubric",
          rubricDescription:
            "Evaluates frontend implementation and backend integration quality.",
          rubricCriteria: [
            {
              name: "Frontend Implementation",
              description: "Quality of UI/UX and client-side logic",
              weight: 50,
              levels: [
                {
                  name: "Excellent",
                  description:
                    "Polished UI with responsive design and robust client logic",
                  weight: 50,
                },
                {
                  name: "Satisfactory",
                  description: "Functional UI with minor design issues",
                  weight: 30,
                },
                {
                  name: "Needs Improvement",
                  description: "Broken or non-functional frontend",
                  weight: 10,
                },
              ],
            },
            {
              name: "Backend Integration",
              description: "API design, data persistence, and security",
              weight: 50,
              levels: [
                {
                  name: "Excellent",
                  description: "Well-structured APIs with secure data handling",
                  weight: 50,
                },
                {
                  name: "Satisfactory",
                  description: "Working backend with minor security gaps",
                  weight: 30,
                },
                {
                  name: "Needs Improvement",
                  description: "Incomplete or insecure backend implementation",
                  weight: 10,
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  for (const aq of assignmentQuestionsSeed) {
    const assessment = await prisma.assessment.findFirst({
      where: { assessmentCode: aq.code },
    });
    if (!assessment) continue;

    for (let qi = 0; qi < aq.questions.length; qi++) {
      const q = aq.questions[qi];
      const assignmentQuestionId = `${assessment.id}-aq-${aq.code}-q${qi}`;
      const assignmentQuestion = await prisma.assignmentQuestion.upsert({
        where: { id: assignmentQuestionId },
        update: {
          questionText: q.questionText,
          point: q.point,
          submissionType: {
            type: "FILE_UPLOAD",
            maxFileSize: 50,
            acceptedTypes: ["pdf", "zip", "doc"],
          },
          rubricName: q.rubricName,
          rubricDescription: q.rubricDescription,
        },
        create: {
          id: assignmentQuestionId,
          questionText: q.questionText,
          point: q.point,
          submissionType: {
            type: "FILE_UPLOAD",
            maxFileSize: 50,
            acceptedTypes: ["pdf", "zip", "doc"],
          },
          rubricName: q.rubricName,
          rubricDescription: q.rubricDescription,
          assessmentId: assessment.id,
        },
      });

      const rubricCriteriaOrder: Array<{
        rubricCriteriaId: string;
        index: number;
      }> = [];
      for (let i = 0; i < q.rubricCriteria.length; i++) {
        const rc = q.rubricCriteria[i];
        const rcId = `${assignmentQuestion.id}-rc-${i}`;
        const created = await prisma.rubricCriteria.upsert({
          where: { id: rcId },
          update: {
            name: rc.name,
            description: rc.description,
            weight: rc.weight,
            levels: rc.levels as Prisma.InputJsonValue,
          },
          create: {
            id: rcId,
            name: rc.name,
            description: rc.description,
            weight: rc.weight,
            levels: rc.levels as Prisma.InputJsonValue,
            assignmentQuestionId: assignmentQuestion.id,
          },
        });
        rubricCriteriaOrder.push({ rubricCriteriaId: created.id, index: i });
      }

      await prisma.assignmentQuestion.update({
        where: { id: assignmentQuestion.id },
        data: { rubricCriteriaOrder },
      });
    }
  }

  // 10.3 Add Lesson Contents (Video + Notes per the Course Setup spec)
  logSection("10.3", "Lesson Contents");
  const lessonsList = await prisma.lesson.findMany({
    include: { lessonContents: { include: { content: true } } },
  });
  for (const lesson of lessonsList) {
    const existingContentCount = lesson.lessonContents.length;
    if (existingContentCount >= 2) continue;

    // Add lecture video content
    const videoContent = await prisma.content.upsert({
      where: { id: `${lesson.id}-video` },
      update: {},
      create: {
        id: `${lesson.id}-video`,
        title: `${lesson.title} - Lecture Video`,
        description: `Lecture video for ${lesson.title}`,
        type: "video",
        paths: [`videos/${lesson.code || lesson.id.toLowerCase()}.mp4`],
      },
    });
    await prisma.lessonContent.upsert({
      where: {
        lessonId_contentId: { lessonId: lesson.id, contentId: videoContent.id },
      },
      update: {},
      create: { lessonId: lesson.id, contentId: videoContent.id, index: 0 },
    });

    // Add lecture notes content
    const notesContent = await prisma.content.upsert({
      where: { id: `${lesson.id}-notes` },
      update: {},
      create: {
        id: `${lesson.id}-notes`,
        title: `${lesson.title} - Lecture Notes`,
        description: `Lecture notes for ${lesson.title}`,
        type: "document",
        paths: [`notes/${lesson.code || lesson.id.toLowerCase()}.pdf`],
      },
    });
    await prisma.lessonContent.upsert({
      where: {
        lessonId_contentId: { lessonId: lesson.id, contentId: notesContent.id },
      },
      update: {},
      create: { lessonId: lesson.id, contentId: notesContent.id, index: 1 },
    });
  }

  // 11. Link CModules to Courses (CourseModule)
  logSection("11", "Course-Module Links");
  const courseModuleLinks: Array<{
    courseKey: string;
    modules: Array<{ code: string; semesterNumber: number }>;
  }> = [
    {
      courseKey: "Computer Science and Engineering-Anglia Ruskin University",
      modules: [
        { code: "CS101", semesterNumber: 1 },
        { code: "CS102", semesterNumber: 1 },
        { code: "CS103", semesterNumber: 2 },
        { code: "CS301", semesterNumber: 2 },
        { code: "CS302", semesterNumber: 3 },
        { code: "CS303", semesterNumber: 3 },
        { code: "CS304", semesterNumber: 4 },
        { code: "CS305", semesterNumber: 4 },
      ],
    },
    {
      courseKey: "Database Management Systems-Pearson Edexcel",
      modules: [
        { code: "CS201", semesterNumber: 1 },
        { code: "CS202", semesterNumber: 2 },
      ],
    },
    {
      courseKey: "Advanced Networking-City & Guilds",
      modules: [
        { code: "CS203", semesterNumber: 1 },
        { code: "CS401", semesterNumber: 2 },
      ],
    },
    {
      courseKey: "Database Management Systems-Anglia Ruskin University",
      modules: [
        { code: "CS501", semesterNumber: 1 },
        { code: "CS502", semesterNumber: 2 },
      ],
    },
    {
      courseKey: "Fundamentals of Computing-Anglia Ruskin University",
      modules: [
        { code: "CS601", semesterNumber: 1 },
        { code: "CS602", semesterNumber: 2 },
      ],
    },
    {
      courseKey: "Fundamentals of Computing-Pearson Edexcel",
      modules: [
        { code: "CS701", semesterNumber: 1 },
        { code: "CS702", semesterNumber: 2 },
      ],
    },
  ];

  for (const link of courseModuleLinks) {
    const course = courses[link.courseKey];
    if (!course) continue;

    for (let i = 0; i < link.modules.length; i++) {
      const { code: mCode, semesterNumber } = link.modules[i];
      const cm = cModules[mCode];
      if (!cm) continue;

      await prisma.courseModule.upsert({
        where: {
          courseId_cModuleId: {
            courseId: course.id,
            cModuleId: cm.id,
          },
        },
        update: { semesterNumber },
        create: {
          courseId: course.id,
          cModuleId: cm.id,
          index: i + 1,
          semesterNumber,
        },
      });
    }
  }

  // 12. Update SessionCourse with comprehensive snapshots
  logSection("12", "SessionCourse Snapshots");
  const facultyUsersList = Object.values(allFacultyUsers);
  for (const sName in sessions) {
    const session = sessions[sName];
    for (const cKey in courses) {
      const course = courses[cKey];
      const sessionCourse = await prisma.sessionCourse.findUnique({
        where: {
          sessionId_courseId: { sessionId: session.id, courseId: course.id },
        },
      });
      if (!sessionCourse) continue;

      const courseModules = await prisma.courseModule.findMany({
        where: { courseId: course.id },
        include: {
          cModule: {
            include: {
              moduleLessons: {
                include: {
                  lesson: {
                    include: {
                      lessonContents: {
                        include: { content: true },
                        orderBy: { index: "asc" },
                      },
                    },
                  },
                },
                orderBy: { index: "asc" },
              },
              moduleAssessments: {
                include: {
                  assessment: {
                    include: {
                      quizQuestions: true,
                      assignmentQuestions: {
                        include: { rubricCriteria: true },
                      },
                    },
                  },
                },
                orderBy: { index: "asc" },
              },
            },
          },
        },
        orderBy: { index: "asc" },
      });

      const facultyToAssign =
        facultyUsersList[Math.floor(Math.random() * facultyUsersList.length)];

      const courseSnapshot = {
        id: course.id,
        title: course.title,
        courseType: course.courseType,
        totalCredits: course.totalCredits,
        modules: courseModules.map((cm) => ({
          id: cm.cModule.id,
          title: cm.cModule.title,
          moduleType: cm.cModule.moduleType,
          credit: cm.cModule.credit,
          index: cm.index,
          semesterNumber: cm.semesterNumber,
          faculty: [
            {
              role: FacultyRole.TEACHER,
              userId: facultyToAssign.id,
              moduleId: cm.cModuleId,
              assignedAt: new Date().toISOString(),
            },
          ],
          moduleLessons: cm.cModule.moduleLessons.map((ml) => ({
            index: ml.index,
            lesson: {
              id: ml.lesson.id,
              title: ml.lesson.title,
              code: ml.lesson.code,
              outcome: ml.lesson.outcome,
              type: ml.lesson.type,
              estimatedTimeToComplete: ml.lesson.estimatedTimeToComplete,
              lessonContents: ml.lesson.lessonContents.map((lc) => ({
                index: lc.index,
                content: {
                  id: lc.content.id,
                  title: lc.content.title,
                  description: lc.content.description,
                  type: lc.content.type,
                  paths: lc.content.paths,
                },
              })),
            },
          })),
          moduleAssessments: cm.cModule.moduleAssessments.map((ma) => ({
            index: ma.index,
            assessment: {
              id: ma.assessment.id,
              nameOrTitle: ma.assessment.nameOrTitle,
              assessmentCode: ma.assessment.assessmentCode,
              assessmentCategory: ma.assessment.assessmentCategory,
              descriptionOrInstructions:
                ma.assessment.descriptionOrInstructions,
              timeLimit: ma.assessment.timeLimit,
              totalPointsOrWeight: ma.assessment.totalPointsOrWeight,
              weight: ma.assessment.weight,
              passingScore: ma.assessment.passingScore,
              attempts: ma.assessment.attempts,
              lateSubmissions: ma.assessment.lateSubmissions,
              dueDate: ma.assessment.dueDate,
              availableStartDate: ma.assessment.availableStartDate,
              availableEndDate: ma.assessment.availableEndDate,
              questionSize: ma.assessment.questionSize,
              quizQuestions:
                ma.assessment.assessmentCategory === "QUIZ"
                  ? ma.assessment.quizQuestions.map((qq) => ({
                      id: qq.id,
                      type: qq.type,
                      questionText: qq.questionText,
                      point: qq.point,
                      options: qq.options,
                      answer: qq.answer,
                    }))
                  : [],
              assignmentQuestions:
                ma.assessment.assessmentCategory === "ASSIGNMENT"
                  ? ma.assessment.assignmentQuestions.map((aq) => ({
                      id: aq.id,
                      questionText: aq.questionText,
                      point: aq.point,
                      submissionType: aq.submissionType,
                      rubricName: aq.rubricName,
                      rubricDescription: aq.rubricDescription,
                      rubricCriteria: aq.rubricCriteria.map((rc) => ({
                        id: rc.id,
                        name: rc.name,
                        description: rc.description,
                        weight: rc.weight,
                        levels: rc.levels,
                      })),
                    }))
                  : [],
            },
          })),
        })),
      };

      await prisma.sessionCourse.update({
        where: { id: sessionCourse.id },
        data: { courseSnapshot: courseSnapshot as Prisma.InputJsonValue },
      });
    }
  }

  logElapsed();
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║        Seed Completed Successfully!       ║
  ╚═══════════════════════════════════════════╝
  `);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
