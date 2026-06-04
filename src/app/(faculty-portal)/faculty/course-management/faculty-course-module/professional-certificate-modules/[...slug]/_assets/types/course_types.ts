export interface Milestone {
  id: string;
  title: string;
  details: string;
  duration: string;
  modules: Module[];
  isSelected?: boolean;
}

export interface Module {
  id: string;
  title: string;
  details: string;
  duration: string;
  lectures: Lecture[];
}

export interface Lecture {
  id: string;
  title: string;
  link: string;
  duration: string;
}

export const demoMilestones: Milestone[] = [
  {
    id: "001",
    title: "Frontend Development Roadmap",
    details: "Master the core frontend technologies and frameworks.",
    duration: "40h",
    isSelected: false,
    modules: [
      {
        id: "M1",
        title: "HTML & CSS Fundamentals",
        details: "Learn the building blocks of web development.",
        duration: "10h",
        lectures: [
          { id: "L1", title: "HTML Basics", link: "#", duration: "2h" },
          { id: "L2", title: "CSS Selectors", link: "#", duration: "2h" },
          { id: "L3", title: "Flexbox & Grid", link: "#", duration: "2h" },
          { id: "L4", title: "Responsive Design", link: "#", duration: "2h" },
          { id: "L5", title: "CSS Animations", link: "#", duration: "1h" },
          { id: "L6", title: "CSS Variables", link: "#", duration: "1h" },
        ],
      },
      {
        id: "M2",
        title: "JavaScript Essentials",
        details: "Understand JavaScript fundamentals and ES6+ concepts.",
        duration: "12h",
        lectures: [
          { id: "L1", title: "JavaScript Syntax", link: "#", duration: "2h" },
          { id: "L2", title: "Functions & Scope", link: "#", duration: "2h" },
          { id: "L3", title: "Asynchronous JS", link: "#", duration: "2h" },
          { id: "L4", title: "DOM Manipulation", link: "#", duration: "2h" },
          { id: "L5", title: "Event Handling", link: "#", duration: "2h" },
          { id: "L6", title: "Modules & Bundlers", link: "#", duration: "2h" },
        ],
      },
      {
        id: "M3",
        title: "React.js Basics",
        details: "Learn React and build interactive UI components.",
        duration: "18h",
        lectures: [
          {
            id: "L1",
            title: "Introduction to React",
            link: "#",
            duration: "2h",
          },
          { id: "L2", title: "JSX & Components", link: "#", duration: "3h" },
          { id: "L3", title: "State & Props", link: "#", duration: "3h" },
          { id: "L4", title: "React Hooks", link: "#", duration: "3h" },
          { id: "L5", title: "Routing with React", link: "#", duration: "3h" },
          { id: "L6", title: "React Forms", link: "#", duration: "4h" },
        ],
      },
    ],
  },
  {
    id: "002",
    title: "Backend Development with Node.js",
    details: "Learn how to build scalable backend applications using Node.js.",
    duration: "35h",
    isSelected: false,
    modules: [
      {
        id: "M1",
        title: "Node.js Fundamentals",
        details:
          "Learn about Node.js architecture and asynchronous programming.",
        duration: "12h",
        lectures: [
          { id: "L1", title: "Intro to Node.js", link: "#", duration: "2h" },
          {
            id: "L2",
            title: "File System & Modules",
            link: "#",
            duration: "2h",
          },
          {
            id: "L3",
            title: "Event Loop & Streams",
            link: "#",
            duration: "2h",
          },
          {
            id: "L4",
            title: "Package Management (npm)",
            link: "#",
            duration: "2h",
          },
          { id: "L5", title: "Error Handling", link: "#", duration: "2h" },
          {
            id: "L6",
            title: "Debugging Node.js Apps",
            link: "#",
            duration: "2h",
          },
        ],
      },
      {
        id: "M2",
        title: "Building RESTful APIs",
        details: "Understand REST principles and create APIs with Express.js.",
        duration: "13h",
        lectures: [
          {
            id: "L1",
            title: "Introduction to REST",
            link: "#",
            duration: "2h",
          },
          { id: "L2", title: "Express.js Basics", link: "#", duration: "2h" },
          {
            id: "L3",
            title: "Routing & Middleware",
            link: "#",
            duration: "2h",
          },
          {
            id: "L4",
            title: "Handling Requests & Responses",
            link: "#",
            duration: "2h",
          },
          { id: "L5", title: "API Authentication", link: "#", duration: "2h" },
          { id: "L6", title: "Testing APIs", link: "#", duration: "3h" },
        ],
      },
      {
        id: "M3",
        title: "Database Management",
        details:
          "Learn how to integrate and manage databases in a backend application.",
        duration: "10h",
        lectures: [
          { id: "L1", title: "SQL vs NoSQL", link: "#", duration: "2h" },
          { id: "L2", title: "MongoDB Basics", link: "#", duration: "2h" },
          { id: "L3", title: "Mongoose ORM", link: "#", duration: "2h" },
          { id: "L4", title: "PostgreSQL Basics", link: "#", duration: "2h" },
          { id: "L5", title: "Database Indexing", link: "#", duration: "1h" },
          {
            id: "L6",
            title: "Data Backup & Security",
            link: "#",
            duration: "1h",
          },
        ],
      },
    ],
  },
];
