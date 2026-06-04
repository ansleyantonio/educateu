type Props = {
  formData: {
    faculty?: string;
    course?: string;
    intake?: string;
    yearOfCourse?: string;
  };
};

const Course_selection_step_3 = ({ formData }: Props) => {
  const { faculty, course, intake, yearOfCourse } = formData;

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2">
      <div>
        <label className="cusFormLabel">Faculty</label>
        <p className="text-muted-foreground">{faculty}</p>
      </div>
      <div>
        <label className="cusFormLabel">Course</label>
        <p className="text-muted-foreground">{course}</p>
      </div>
      <div>
        <label className="cusFormLabel">Intake</label>
        <p className="text-muted-foreground">{intake}</p>
      </div>
      <div>
        <label className="cusFormLabel">Year of Course</label>
        <p className="text-muted-foreground">{yearOfCourse}</p>
      </div>
    </div>
  );
};

export default Course_selection_step_3;
