import { IFacultyForm } from "../schemas/facultySchema";

export const FacultyDefaultValue = (
  defaultValues: Partial<IFacultyForm> = {}
): IFacultyForm => {
  return {
    username: defaultValues.username || "",
    firstName: defaultValues.firstName || "",
    lastName: defaultValues.lastName || "",
    email: defaultValues.email || "",
    mobile: defaultValues.mobile || "",
    password: defaultValues.password || "",
    confirmPassword: defaultValues.confirmPassword || "",
    photo: defaultValues.photo || "",
    facultyStatus: defaultValues.facultyStatus || "ACTIVE",
    userStatus: defaultValues.userStatus || "ACTIVE",
  };
};
