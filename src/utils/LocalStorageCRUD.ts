const STORAGE_KEY = "data";

// Retrieve all data from local storage
const getAllData = (): { id: string; completeStepList: string[] }[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
};

// Save entire data array to local storage
const saveData = (data: { id: string; completeStepList: string[] }[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Get data by ID
export const getDataById = (
  id: string,
): { id: string; completeStepList: string[] } | null => {
  return getAllData().find((item) => item.id === id) || null;
};

// Remove duplicates from the completeStepList
const removeDuplicates = (list: string[]): string[] => {
  return [...new Set(list)]; // Use Set to filter out duplicates
};

// Create or Update (Upsert) data by ID
export const saveOrUpdateDataById = (
  id: string,
  completeStepList: string[],
): void => {
  // Remove duplicates from the completeStepList
  const uniqueStepList = removeDuplicates(completeStepList);

  const data = getAllData();
  const existingItem = data.find((item) => item.id === id);

  if (existingItem) {
    // Update existing item with unique steps
    existingItem.completeStepList = uniqueStepList;
  } else {
    // Check for duplicate IDs before adding
    if (data.some((item) => item.id === id)) {
      console.error("ID already exists! Cannot add duplicate ID.");
      return;
    }

    // Add new item with unique steps
    data.push({ id, completeStepList: uniqueStepList });
  }

  saveData(data);
};

// Get completeStepList by ID (returns [] if not found or null)
export const getCompleteStepList = (id: string): string[] => {
  const data = getDataById(id);
  return data ? data.completeStepList : [];
};
