/**
 * Formats a time limit in minutes to a human-readable string
 * @param timeLimit - Time limit in minutes (can be undefined or null)
 * @returns Formatted string like "30 Minutes", "1 Hour", "2 Hours", or "N/A"
 */
export const formatTimeLimit = (
  timeLimit: number | undefined | null
): string => {
  if (!timeLimit) {
    return "N/A";
  }

  if (timeLimit < 60) {
    return `${timeLimit} Minute${timeLimit !== 1 ? "s" : ""}`;
  }

  const hours = Math.floor(timeLimit / 60);
  return `${hours} Hour${hours !== 1 ? "s" : ""}`;
};
