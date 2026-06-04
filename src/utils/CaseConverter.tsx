export const CamelToTitle = (s: string) =>
  s.replace(/([A-Z])/g, " $1").replace(/\b\w/g, (c) => c.toUpperCase());

export const TitleToCamel = (s: string) =>
  s.replace(/(?:^\w|\s\w)/g, (m, i) =>
    i ? m.trim().toUpperCase() : m.toLowerCase(),
  );

export const SnakeToTitle = (s: string) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const KebabToTitle = (s: string) =>
  s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const formatStackedText = (s: string) => {
  return s
    .replace(/([a-z])([A-Z])/g, "$1 $2") // add space between lower→upper
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2") // handle multiple uppercase
    .replace(/^./, (str) => str.toUpperCase()); // capitalize first letter
};
// formatStackedText("NationalIdentification") // "National Identification"
// formatStackedText("userProfileData")        // "User Profile Data"
// formatStackedText("APIResponseHandler")     // "API Response Handler"


// Helper function to convert kebab-case to camelCase
export const kebabToCamel = (str: string): string => {
  return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
};
