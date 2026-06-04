import {
  PrismaClient,
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
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // 1. Portal Categories
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

  // 2. Modules for Agent Portal
  const agentModules = [
    { name: "agent-awarding-bodies", groupName: "agent-awarding-bodies" },
    { name: "application-management", groupName: "application-management" },
    { name: "awarding-bodies", groupName: "awarding-bodies" },
    { name: "commissions", groupName: "commissions" },
    { name: "marketing-link", groupName: "marketing-link" },
    { name: "sub-agent-management", groupName: "sub-agent-management" },
    { name: "agent-notification-log", groupName: "agent-notification-log" },
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

  // 3. Roles for Agent Portal
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

  // 4. Sessions
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
  const coursesData = [
    {
      title: "Computer Science and Engineering",
      type: CourseType.DEGREE_COURSE,
      ab: "Anglia Ruskin University",
    },
    {
      title: "Database Management Systems",
      type: CourseType.DIPLOMA_COURSE,
      ab: "Anglia Ruskin University",
    },
    {
      title: "Database Management Systems",
      type: CourseType.DIPLOMA_COURSE,
      ab: "Pearson Edexcel",
    },
    {
      title: "Advanced Networking",
      type: CourseType.DIPLOMA_COURSE,
      ab: "City & Guilds",
    },
    {
      title: "Fundamentals of Computing",
      type: CourseType.DIPLOMA_COURSE,
      ab: "Anglia Ruskin University",
    },
    {
      title: "Fundamentals of Computing",
      type: CourseType.DIPLOMA_COURSE,
      ab: "Pearson Edexcel",
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
      courses[`${c.title}-${c.ab}`] = existing;
    } else {
      courses[`${c.title}-${c.ab}`] = await prisma.course.create({
        data: {
          title: c.title,
          courseType: c.type,
          awardingBodyId: ab.id,
          status: "PUBLISHED",
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

  // 8. Applications Data
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

    if (userPortalCategory) {
      const upcr = await prisma.userPortalCategoryRole.findFirst({
        where: { userPortalCategoryId: userPortalCategory.id },
      });

      if (upcr) {
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
  }

  // 9. CModules and Lessons
  const cModulesData = [
    {
      title: "Introduction to Computer Science",
      code: "CS101",
      type: CourseType.DEGREE_COURSE,
      ab: "Anglia Ruskin University",
    },
    {
      title: "Data Structures",
      code: "CS102",
      type: CourseType.DEGREE_COURSE,
      ab: "Anglia Ruskin University",
    },
    {
      title: "Algorithms",
      code: "CS103",
      type: CourseType.DEGREE_COURSE,
      ab: "Anglia Ruskin University",
    },
    {
      title: "Database Systems",
      code: "CS201",
      type: CourseType.DIPLOMA_COURSE,
      ab: "Pearson Edexcel",
    },
    {
      title: "Operating Systems",
      code: "CS202",
      type: CourseType.DIPLOMA_COURSE,
      ab: "Pearson Edexcel",
    },
    {
      title: "Computer Networks",
      code: "CS203",
      type: CourseType.DIPLOMA_COURSE,
      ab: "Pearson Edexcel",
    },
    {
      title: "Software Engineering",
      code: "CS301",
      type: CourseType.DEGREE_COURSE,
      ab: "Anglia Ruskin University",
    },
    {
      title: "Artificial Intelligence",
      code: "CS302",
      type: CourseType.DEGREE_COURSE,
      ab: "Anglia Ruskin University",
    },
    {
      title: "Machine Learning",
      code: "CS303",
      type: CourseType.DEGREE_COURSE,
      ab: "Anglia Ruskin University",
    },
    {
      title: "Cyber Security",
      code: "CS401",
      type: CourseType.DIPLOMA_COURSE,
      ab: "City & Guilds",
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
      title: "Network Security Protocols",
      code: "L401",
      outcome: "Implement SSL/TLS",
      type: LessonType.DIPLOMA,
      ab: "City & Guilds",
      moduleCode: "CS401",
    },
  ];

  const cModules: Record<string, any> = {};
  for (const cm of cModulesData) {
    const ab = awardingBodies[cm.ab];
    if (!ab) continue;
    cModules[cm.code] = await prisma.cModule.upsert({
      where: { code: cm.code },
      update: {},
      create: {
        title: cm.title,
        code: cm.code,
        courseType: cm.type,
        moduleType: "CORE",
        estimatedTimeToComplete: 40,
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
          estimatedTimeToComplete: 2,
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
  const assessmentsData = [
    {
      name: "CS101 Quiz 1",
      code: "A101",
      category: AssessmentCategory.QUIZ,
      type: AssessmentType.DEGREE,
      moduleCode: "CS101",
      ab: "Anglia Ruskin University",
    },
    {
      name: "CS102 Assignment 1",
      code: "A102",
      category: AssessmentCategory.ASSIGNMENT,
      type: AssessmentType.DEGREE,
      moduleCode: "CS102",
      ab: "Anglia Ruskin University",
    },
    {
      name: "CS103 Quiz 1",
      code: "A103",
      category: AssessmentCategory.QUIZ,
      type: AssessmentType.DEGREE,
      moduleCode: "CS103",
      ab: "Anglia Ruskin University",
    },
    {
      name: "CS201 Assignment 1",
      code: "A201",
      category: AssessmentCategory.ASSIGNMENT,
      type: AssessmentType.DIPLOMA,
      moduleCode: "CS201",
      ab: "Pearson Edexcel",
    },
    {
      name: "CS202 Quiz 1",
      code: "A202",
      category: AssessmentCategory.QUIZ,
      type: AssessmentType.DIPLOMA,
      moduleCode: "CS202",
      ab: "Pearson Edexcel",
    },
    {
      name: "CS203 Assignment 1",
      code: "A203",
      category: AssessmentCategory.ASSIGNMENT,
      type: AssessmentType.DIPLOMA,
      moduleCode: "CS203",
      ab: "Pearson Edexcel",
    },
    {
      name: "CS301 Quiz 1",
      code: "A301",
      category: AssessmentCategory.QUIZ,
      type: AssessmentType.DEGREE,
      moduleCode: "CS301",
      ab: "Anglia Ruskin University",
    },
    {
      name: "CS302 Assignment 1",
      code: "A302",
      category: AssessmentCategory.ASSIGNMENT,
      type: AssessmentType.DEGREE,
      moduleCode: "CS302",
      ab: "Anglia Ruskin University",
    },
    {
      name: "CS303 Quiz 1",
      code: "A303",
      category: AssessmentCategory.QUIZ,
      type: AssessmentType.DEGREE,
      moduleCode: "CS303",
      ab: "Anglia Ruskin University",
    },
    {
      name: "CS401 Assignment 1",
      code: "A401",
      category: AssessmentCategory.ASSIGNMENT,
      type: AssessmentType.DIPLOMA,
      moduleCode: "CS401",
      ab: "City & Guilds",
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
          timeLimit: 60,
          totalPointsOrWeight: 100,
          attempts: 1,
          lateSubmissions: false,
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

  // 11. Link CModules to Courses (CourseModule)
  const courseModuleLinks = [
    {
      courseKey: "Computer Science and Engineering-Anglia Ruskin University",
      moduleCodes: ["CS101", "CS102", "CS103", "CS301", "CS302", "CS303"],
    },
    {
      courseKey: "Database Management Systems-Pearson Edexcel",
      moduleCodes: ["CS201", "CS202"],
    },
    {
      courseKey: "Advanced Networking-City & Guilds",
      moduleCodes: ["CS203", "CS401"],
    },
  ];

  for (const link of courseModuleLinks) {
    const course = courses[link.courseKey];
    if (!course) continue;

    for (const mCode of link.moduleCodes) {
      const cm = cModules[mCode];
      if (!cm) continue;

      await prisma.courseModule.upsert({
        where: {
          courseId_cModuleId: {
            courseId: course.id,
            cModuleId: cm.id,
          },
        },
        update: {},
        create: {
          courseId: course.id,
          cModuleId: cm.id,
          index: link.moduleCodes.indexOf(mCode) + 1,
        },
      });
    }
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
