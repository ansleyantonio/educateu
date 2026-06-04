type CourseAssign = {
  userId: string;
  courseId: string;
  courseModuleId: string[];
  role: string[];
};

function hasDuplicateCourseIdAndRole(assignments: CourseAssign[]): boolean {
  const seen = new Set<string>();

  for (const item of assignments) {
    const key = `${item.courseId}-${item.role.sort().join(",")}`;

    if (seen.has(key)) {
      return true; // Duplicate found
    }

    seen.add(key);
  }

  return false; // No duplicates
}

export default hasDuplicateCourseIdAndRole;
