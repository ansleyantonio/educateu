export interface IFilter {
  [key: string]: unknown;
}

export const buildQueryParams = (
  filter: IFilter | null,
  page: number,
  search: string,
  status?: string,
  pageSize?: string
) => {
  const params = new URLSearchParams();

  if (filter) {
    Object.entries(filter).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, v));
      } else if (value) {
        params.append(key, value.toString());
      }
    });
  }

  if (search) params.append("search", search);
  params.append("page", page.toString());

  if (status && status !== "all") params.append("status", status);
  if (pageSize) params.append("pageSize", pageSize);

  return params.toString();
};
