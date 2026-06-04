import { PageWithBreadcrumb } from "@/components/Breadcrumb/PageWithBreadcrumb";
import AssignLessonTab from "./_assets/assign_lessons/lesson_assignments";

const Lesson = ({ params }: { params: { slug: string } }) => {
  const id = params.slug;
  return (
    <PageWithBreadcrumb
      items={[
        { title: "Home", href: "/faculty" },
        {
          title: "Course-Management",
          href: "/faculty/course-management/module",
        },
        { title: "Module" },
        { title: id },
      ]}
    >
      <div className="flex justify-end">
        {/* <Button variant={"primary"}>
          <PlusIcon className="mr-2 w-4 h-4" />
          Create Lesson
        </Button> */}
      </div>
      <AssignLessonTab availableLessons={false} id={id} />
      {/* <AssignLessonTab availableLessons={true} id={id} /> */}
      {/* <FacultyAssignLessonTab id={id} /> */}
    </PageWithBreadcrumb>
  );
};

export default Lesson;
