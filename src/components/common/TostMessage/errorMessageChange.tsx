/* eslint-disable @typescript-eslint/no-explicit-any */

export const ToastMessageChange = (message: string | any) => {
  console.log("message change error message", message);
  switch (message) {
    case `Prisma: Unique constraint failed on field "name"`:
      message =
        "duplicate data found please change the title/Session/AwardingBody & try again";
      break;
    case `Prisma: Unique constraint failed on field "courseType"`:
      message =
        "duplicate data found please change the title/Session/AwardingBody  & try again";
      break;
    case `Course total credits is less than modules total credits`:
      message =
        "Please ensure the assigned module credit is within the course credit.";
      break;

    default:
      message = message;
      break;
  }
  return message;
};
