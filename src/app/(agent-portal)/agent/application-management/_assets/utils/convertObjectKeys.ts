function convertObjectKeys(
  inputObject: Record<string, string>
): Record<string, string> {
  const convertedObject: Record<string, string> = {};

  for (const key in inputObject) {
    if (Object.hasOwnProperty.call(inputObject, key)) {
      // Replace underscores with hyphens in keys
      const newKey = key.replace(/_/g, "-");
      convertedObject[newKey] = inputObject[key];
    }
  }

  return convertedObject;
}
export default convertObjectKeys;
