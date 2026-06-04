/**
 * ➤ Returns strict ISO 8601 string from local time input
 * ➤ Input must be local time, output is strict ISO UTC
 * Example: "2025-06-17T14:30:00.000Z"
 */
function localToISO(date: Date | string): string {
  // Strict validation - reject any ISO-like input
  if (typeof date === "string") {
    if (date.includes("Z")) {
      throw new Error("Input must be local time, not ISO format with Z");
    }
    if (date.includes("T") && date.length > 16) {
      throw new Error("Input appears to be ISO format, expected local time");
    }
  }

  const localDate = new Date(date);
  if (isNaN(localDate.getTime())) {
    throw new Error("Invalid Date");
  }

  // Additional validation - ensure this is a local date, not UTC
  const timezoneOffset = localDate.getTimezoneOffset();
  const testUTC = new Date(localDate.toISOString());
  const offsetDiff = Math.abs(testUTC.getTime() - localDate.getTime());
  if (offsetDiff > 60000) {
    // More than 1 minute difference suggests timezone issue
    throw new Error("Input date may already be in UTC format");
  }

  // Convert local time to strict UTC ISO 8601 format
  const utcDate = new Date(localDate.getTime() - timezoneOffset * 60000);

  const isoString = utcDate.toISOString();

  // Validate output is proper ISO format
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(isoString)) {
    throw new Error("Failed to generate valid ISO string");
  }

  return isoString;
}

/**
 * ➤ Converts "10:30 AM" + reference date into strict ISO 8601 string
 * ➤ Inputs must be local time, output is strict ISO UTC
 * Example: "2025-06-17T04:30:00.000Z"
 */
function toISOFromTime(
  referenceDate: Date | string,
  timeString: string,
): string {
  // Validate reference date is local (not ISO)
  if (typeof referenceDate === "string" && referenceDate.includes("Z")) {
    throw new Error("Reference date must be local time, not ISO format");
  }

  const baseDate = new Date(referenceDate);
  if (isNaN(baseDate.getTime())) throw new Error("Invalid reference date");

  // Strict time format validation (12-hour with AM/PM required)
  const timeMatch = timeString.trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (!timeMatch) {
    throw new Error(
      `Invalid time format: ${timeString}. Must be "HH:MM AM/PM"`,
    );
  }

  const [, h, m, meridiem] = timeMatch;
  let hours = parseInt(h, 10);
  const minutes = parseInt(m, 10);

  // Validate time ranges
  if (hours < 1 || hours > 12) throw new Error("Hours must be between 1-12");
  if (minutes < 0 || minutes > 59)
    throw new Error("Minutes must be between 0-59");
  if (!meridiem) throw new Error("AM/PM designation required");

  // Convert to 24-hour format
  if (meridiem.toLowerCase() === "pm" && hours < 12) hours += 12;
  if (meridiem.toLowerCase() === "am" && hours === 12) hours = 0;

  // Create proper UTC date from local components
  const localDate = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
    hours,
    minutes,
  );

  // Convert to strict ISO UTC
  const utcDate = new Date(
    localDate.getTime() - localDate.getTimezoneOffset() * 60000,
  );

  const isoString = utcDate.toISOString();

  // Validate strict ISO format
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(isoString)) {
    throw new Error("Failed to generate valid ISO string");
  }

  return isoString;
}

/**
 * ➤ Returns "Jun 2025"
 * ➤ If local: true, converts ISO to local time first
 */
function toMonthYear(
  input: string | number | Date,
  options: { local?: boolean } = {},
): string {
  const { local = false } = options;

  let date = new Date(input);
  if (isNaN(date.getTime())) return "Invalid Date";

  // Convert ISO to local time if requested
  if (local && typeof input === "string" && input.includes("Z")) {
    date = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * ➤ Returns "2:30 PM"
 * ➤ If local: true, converts ISO to local time first
 */
function time12h(
  input: string | Date,
  options: { local?: boolean } = {},
  showRelative: boolean | "day" = false,
): string {
  const { local = false } = options;

  let date = new Date(input);
  if (isNaN(date.getTime())) return "Invalid Date";

  // Convert ISO to local time if requested
  if (local && typeof input === "string" && input.includes("Z")) {
    date = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  }

  const timeString = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);

  if (showRelative === false) {
    return timeString;
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (showRelative === "day" && diffDays > 7) {
    const dateString = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    }).format(date);
    return `${dateString}, ${timeString}`;
  }

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const inputDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  if (inputDate.getTime() === today.getTime()) {
    return `Today, ${timeString}`;
  } else if (inputDate.getTime() === today.getTime() - 86400000) {
    return `Yesterday, ${timeString}`;
  } else if (diffDays < 7) {
    const dayName = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
    }).format(date);
    return `${dayName}, ${timeString}`;
  } else {
    const dateString = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    }).format(date);
    return `${dateString}, ${timeString}`;
  }
}

/**
 * ➤ Returns "14:30"
 * ➤ If local: true, converts ISO to local time first
 */
function time24h(
  input: string | Date,
  options: { local?: boolean } = {},
): string {
  const { local = false } = options;

  let date = new Date(input);
  if (isNaN(date.getTime())) return "Invalid Date";

  // Convert ISO to local time if requested
  if (local && typeof input === "string" && input.includes("Z")) {
    date = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  }

  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/**
 * ➤ Returns date in different formats
 * ➤ If local: true, converts ISO to local time first
 */
function customFormatDate(
  input: Date | string,
  format: "YYYY-MM-DD" | "DD-MM-YYYY" | "YYYY" = "YYYY-MM-DD",
  options: { local?: boolean } = {},
): string {
  const { local = false } = options;

  let date = new Date(input);
  if (isNaN(date.getTime())) return "Invalid Date";

  // Convert ISO to local time if requested
  if (local && typeof input === "string" && input.includes("Z")) {
    date = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  }

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  switch (format) {
    case "YYYY":
      return y.toString();
    case "DD-MM-YYYY":
      return `${d}-${m}-${y}`;
    default:
      return `${y}-${m}-${d}`;
  }
}

/**
 * ➤ Returns "24 August 2025, 03:30 PM"
 * ➤ If local: true, converts ISO to local time first
 */
function fullDateTime(
  input: Date | string,
  options: { showTime?: boolean; local?: boolean } = {},
): string {
  const { showTime = true, local = false } = options;

  let date = new Date(input);
  if (isNaN(date.getTime())) return "Invalid Date";

  // Convert ISO to local time if requested
  if (local && typeof input === "string" && input.includes("Z")) {
    date = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    ...(showTime && {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  }).format(date);
}

/**
 * ➤ Returns duration between two dates
 * Example: "2 years 3 months"
 */
function duration(start: Date | string, end?: Date | string | null): string {
  // Handle null/undefined end date
  const e = !end || end === "no" ? new Date() : new Date(end);
  const s = new Date(start);

  if (isNaN(s.getTime()) || isNaN(e.getTime())) return "Invalid Date";
  if (e < s) return "End date is before start date";

  // Rest of the calculation remains the same...
  let years = e.getFullYear() - s.getFullYear();
  let months = e.getMonth() - s.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  const diffMs = e.getTime() - s.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diffMs / (1000 * 60 * 60)) % 24;
  const minutes = Math.floor(diffMs / (1000 * 60)) % 60;
  const seconds = Math.floor(diffMs / 1000) % 60;

  if (years > 0) {
    return months > 0
      ? `${years} year${years > 1 ? "s" : ""} ${months} month${
          months > 1 ? "s" : ""
        }`
      : `${years} year${years > 1 ? "s" : ""}`;
  }

  if (months > 0) {
    return `${months} month${months > 1 ? "s" : ""}`;
  }

  if (days > 0) {
    return hours > 0
      ? `${days} day${days > 1 ? "s" : ""} ${hours} hour${hours > 1 ? "s" : ""}`
      : `${days} day${days > 1 ? "s" : ""}`;
  }

  if (hours > 0) {
    return minutes > 0
      ? `${hours} hour${hours > 1 ? "s" : ""} ${minutes} minute${
          minutes > 1 ? "s" : ""
        }`
      : `${hours} hour${hours > 1 ? "s" : ""}`;
  }

  if (minutes > 0) {
    return seconds > 0
      ? `${minutes} minute${minutes > 1 ? "s" : ""} ${seconds} second${
          seconds > 1 ? "s" : ""
        }`
      : `${minutes} minute${minutes > 1 ? "s" : ""}`;
  }

  return `${seconds} second${seconds !== 1 ? "s" : ""}`;
}

function localDateToISOWithZ(date?: Date | null): string | null {
  if (!date) return null;

  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  const utcDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  return utcDate.toISOString();
}

function mergeDateAndTime(dateObj: Date, timeObj: Date): Date {
  const datePart = dateObj.toISOString().split("T")[0]; // "YYYY-MM-DD"
  const timePart = timeObj.toISOString().split("T")[1]; // "HH:MM:SS.sssZ"
  return new Date(`${datePart}T${timePart}`);
}

const getDateFormat = (type?: "date" | "time" | "year" | "month" | "week") => {
  switch (type) {
    case "time":
      return "HH:mm";
    case "year":
      return "YYYY";
    case "month":
      return "YYYY-MM";
    case "week":
      return "YYYY-[W]WW";
    default:
      return "YYYY-MM-DD";
  }
};

// 20-10-2025 at 10:07 am
function localDateTime(input: string | Date): string {
  const date = new Date(input);
  if (isNaN(date.getTime())) return "Invalid Date";

  // --- Date part (DD-MM-YYYY) ---
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  // --- Time part (hh:mm am/pm) ---
  const time = date
    .toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase()
    .replace(" ", ""); // remove space between time + am/pm (optional)

  return `${day}-${month}-${year} at ${time}`;
}

const dateFormat = {
  getDateFormat,
  toMonthYear,
  time12h,
  time24h,
  toISOFromTime,
  localToISO,
  customFormatDate,
  fullDateTime,
  duration,
  localDateToISOWithZ,
  mergeDateAndTime,
  localDateTime,
};

export default dateFormat;
