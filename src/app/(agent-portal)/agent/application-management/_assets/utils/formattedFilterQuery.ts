/* eslint-disable @typescript-eslint/no-unused-vars */
export const formattedFilterQuery = (filters: Record<string, string>) => {
  const query = Object.entries(filters)
    .filter(([_, value]) => value) // Ignore empty or undefined values
    .map(([key, value]) => {
      const [mainKey, subKey] = key.split("_");
      if (subKey) {
        // For keys with sub-keys, format as `filter[mainKey][subKey]`
        return `filter[${mainKey}][${subKey}]=${encodeURIComponent(value)}`;
      } else {
        // For keys without sub-keys, format as `filter[key]`
        return `filter[${key}]=${encodeURIComponent(value)}`;
      }
    })
    .join("&");
  return query;
};
