"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const CourseManagement = () => {
  const router = useRouter();

  useEffect(() => {
    router.push("course-management/course-session");
  }, [router]);

  return null;
};

export default CourseManagement;
