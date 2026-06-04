function FormatFileSize(sizeInMB: number): string {
  const sizeInKB = sizeInMB * 1024; // Convert MB → KB
  const sizeInGB = sizeInMB / 1024; // Convert MB → GB

  if (sizeInGB >= 1) {
    return `${sizeInGB.toFixed(2)} GB`;
  } else if (sizeInMB >= 1) {
    return `${sizeInMB.toFixed(2)} MB`;
  } else {
    return `${sizeInKB.toFixed(2)} KB`;
  }
}

export default FormatFileSize;
