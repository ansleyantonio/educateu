/* eslint-disable @typescript-eslint/no-explicit-any */

// Function to save data to local storage
export function saveDataToLocalStorage(data: any) {
  if (Array.isArray(data)) {
    localStorage.setItem("data", JSON.stringify(data));
  } else {
    console.error("Data must be an array of objects.");
  }
}

// Function to get data by id from local storage
export function getDataById(id: string): any {
  const dataString = localStorage.getItem("data");
  if (!dataString) return null;

  try {
    const data: any = JSON.parse(dataString);
    if (Array.isArray(data)) {
      return data.find((item) => item.id === id) || null;
    }
    console.error("Stored data is not in the expected array format.");
    return null;
  } catch (error) {
    console.error("Error parsing localStorage data:", error);
    return null;
  }
}
