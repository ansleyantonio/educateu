export const getPagination = (page: number = 1, pageSize: number = 10) => {
  const offset = (page - 1) * pageSize;
  const limit = pageSize;
  return { offset, limit };
};
