/* eslint-disable @typescript-eslint/no-explicit-any */
export function extractEnrollmentIds(data: any[]): string[] {
  // console.log("data -----", data);
  return data.map((item) => item?.id);
}
