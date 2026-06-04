// export const DeleteObjectKey = (obj: Record<string, unknown>, keys: string[]) => {
//   keys.forEach((key) => {
//     if (obj[key] == null || obj[key] === "") {
//       delete obj[key];
//     }
//   });
// };

export const DeleteEmptyKeys = (obj: Record<string, unknown>): void => {
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (value == null || value === "") {
      delete obj[key];
    }
  });
};
