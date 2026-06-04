// /* eslint-disable @typescript-eslint/no-explicit-any */
// import axios from "axios";
// import toast from "react-hot-toast";
// import { FileItem, UploadState } from "../type/interface";

// // Calculate time left based on upload speed
// const calculateTimeLeft = (file: FileItem, currentProgress: number): string => {
//   if (!file.uploadStartTime || !file.lastProgressTime) return "calculating...";

//   const timeElapsed = (Date.now() - file.uploadStartTime) / 1000;
//   if (timeElapsed < 1 || currentProgress < 5) return "calculating...";

//   const uploadSpeed = currentProgress / timeElapsed;
//   const remainingProgress = 100 - currentProgress;
//   const secondsLeft = Math.ceil(remainingProgress / uploadSpeed);

//   if (secondsLeft < 60) return `${secondsLeft} seconds left`;
//   if (secondsLeft < 3600) return `${Math.ceil(secondsLeft / 60)} minutes left`;
//   return `${Math.ceil(secondsLeft / 3600)} hours left`;
// };

// // Upload file with progress tracking
// const uploadFileToServer = async (
//   file: File,
//   fileItem: FileItem,
//   token: string,
//   setFiles: any
// ): Promise<string> => {
//   const formData = new FormData();
//   formData.append("file", file);

//   return new Promise((resolve, reject) => {
//     axios
//       .post(`${process.env.NEXT_PUBLIC_API_URL}/uploads`, formData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "multipart/form-data",
//         },
//         onUploadProgress: (progressEvent) => {
//           if (progressEvent.total) {
//             const progress = Math.round(
//               (progressEvent.loaded * 100) / progressEvent.total
//             );
//             const timeLeft = calculateTimeLeft(fileItem, progress);

//             setFiles((prev: any) =>
//               prev?.map((f: any) =>
//                 f.id === fileItem.id
//                   ? {
//                       ...f,
//                       progress,
//                       timeLeft,
//                       lastProgressTime: Date.now(),
//                     }
//                   : f
//               )
//             );
//           }
//         },
//       })
//       .then((response) => resolve(response.data?.data?.path))
//       .catch((error) => reject(error));
//   });
// };

// const getFileType = (fileName: string): "pdf" | "image" | "other" => {
//   const extension = fileName.split(".").pop()?.toLowerCase();
//   if (extension === "pdf") return "pdf";
//   if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || ""))
//     return "image";
//   return "other";
// };

// const handleFileChange = async (
//   e: React.ChangeEvent<HTMLInputElement>,
//   setFiles: any,
//   token: string,
//   form: any,
//   setUploads: any,
//   fieldName?: keyof UploadState
// ) => {
//   if (e.target.files && e.target.files.length > 0) {
//     const newFiles = Array.from(e.target.files);
//     const uploadedPaths: string[] = [];
//     const newFileItems: FileItem[] = [];

//     for (const newFile of newFiles) {
//       const fileSize = (newFile.size / (1024 * 1024)).toFixed(1);
//       const fileType = getFileType(newFile.name);
//       const now = Date.now();

//       const newFileItem: FileItem = {
//         id: Date.now().toString(),
//         name: newFile.name,
//         size: `${fileSize}MB`,
//         progress: 0,
//         status: "uploading",
//         timeLeft: "calculating...",
//         type: fileType,
//         uploadStartTime: now,
//         lastProgressTime: now,
//         fieldName,
//       };

//       newFileItems.push(newFileItem);
//       setFiles((prev: any) => [...prev, newFileItem]);

//       try {
//         const path = await uploadFileToServer(
//           newFile,
//           newFileItem,
//           setFiles,
//           token
//         );
//         uploadedPaths.push(path);

//         setFiles((prev: any) =>
//           prev?.map((file: any) =>
//             file.id === newFileItem.id
//               ? {
//                   ...file,
//                   progress: 100,
//                   status: "complete",
//                   timeLeft: undefined,
//                   path: path,
//                 }
//               : file
//           )
//         );
//       } catch (error) {
//         setFiles((prev: any) =>
//           prev?.filter((file: any) => file.id !== newFileItem.id)
//         );
//         toast.error(`Failed to upload ${newFile.name}`);
//       }
//     }

//     // Update form value with all paths if this is a specific field upload
//     if (fieldName && uploadedPaths.length > 0) {
//       const currentValues =
//         (form.getValues(`supportingDocument.${fieldName}`) as string[]) || [];
//       form.setValue(`supportingDocument.${fieldName}` as const, [
//         ...currentValues,
//         ...uploadedPaths,
//       ]);

//       setUploads((prev: any) => ({
//         ...prev,
//         [fieldName]: {
//           files: [...prev[fieldName].files, ...newFiles],
//           previews: [
//             ...prev[fieldName].previews,
//             ...uploadedPaths.map(
//               (p) => `${process.env.NEXT_PUBLIC_API_URL}${p}`
//             ),
//           ],
//         },
//       }));
//     }
//   }
// };

// const handleDragOver = (e: React.DragEvent) => {
//   e.preventDefault();
// };

// const handleDrop = (
//   e: React.DragEvent,
//   handleFileChange: any,
//   fieldName?: keyof UploadState
// ) => {
//   e.preventDefault();
//   if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
//     const fileInput = document.createElement("input");
//     fileInput.type = "file";
//     fileInput.files = e.dataTransfer.files;
//     const event = new Event("change", { bubbles: true });
//     Object.defineProperty(event, "target", { value: fileInput });
//     handleFileChange(
//       event as unknown as React.ChangeEvent<HTMLInputElement>,
//       fieldName
//     );
//   }
// };

// const removeFile = (
//   id: string,
//   files: any,
//   form: any,
//   setUploads: any,
//   setFiles: any
// ) => {
//   const fileToRemove = files?.find((file: any) => file.id === id);
//   if (fileToRemove?.fieldName) {
//     const currentValues =
//       (form.getValues(
//         `supportingDocument.${fileToRemove.fieldName}`
//       ) as string[]) || [];
//     const updatedValues = currentValues.filter(
//       (path: string) => path !== fileToRemove.path
//     );

//     form.setValue(
//       `supportingDocument.${fileToRemove.fieldName}` as const,
//       updatedValues
//     );

//     setUploads((prev: any) => {
//       const index = prev[fileToRemove.fieldName!].previews.findIndex(
//         (p: any) =>
//           p === `${process.env.NEXT_PUBLIC_API_URL}${fileToRemove.path}`
//       );

//       if (index === -1) return prev;

//       const newFiles = [...prev[fileToRemove.fieldName!].files];
//       const newPreviews = [...prev[fileToRemove.fieldName!].previews];
//       newFiles.splice(index, 1);
//       newPreviews.splice(index, 1);

//       return {
//         ...prev,
//         [fileToRemove.fieldName!]: {
//           files: newFiles,
//           previews: newPreviews,
//         },
//       };
//     });
//   }
//   setFiles(files.filter((file: any) => file.id !== id));
// };

// const replaceFile = async (
//   id: string,
//   files: any,
//   setFiles: any,
//   form: any,
//   setUploads: any
// ) => {
//   const fileToReplace = files?.find((file: any) => file.id === id);
//   if (!fileToReplace?.fieldName) return;

//   const fileInput = document.createElement("input");
//   fileInput.type = "file";
//   fileInput.accept = ".pdf,.jpg,.jpeg,.png";

//   fileInput.onchange = async (e) => {
//     const target = e.target as HTMLInputElement;
//     if (target.files && target.files.length > 0) {
//       const newFile = target.files[0];
//       const fileSize = (newFile.size / (1024 * 1024)).toFixed(1);
//       const fileType = getFileType(newFile.name);
//       const now = Date.now();

//       const fileIndex = files.findIndex((file: any) => file.id === id);
//       const tempId = `temp-${now}`;

//       // Replace the old file in place (maintain position)
//       setFiles((prev: any) => {
//         const updated = [...prev];
//         updated[fileIndex] = {
//           id: tempId,
//           name: newFile.name,
//           size: `${fileSize}MB`,
//           progress: 0,
//           status: "uploading",
//           timeLeft: "calculating...",
//           type: fileType,
//           uploadStartTime: now,
//           lastProgressTime: now,
//           fieldName: fileToReplace.fieldName,
//         };
//         return updated;
//       });

//       try {
//         const path = await uploadFileToServer(newFile, {
//           id: tempId,
//           name: newFile.name,
//           size: `${fileSize}MB`,
//           type: fileType,
//           fieldName: fileToReplace.fieldName,
//           uploadStartTime: now,
//           lastProgressTime: now,
//         });

//         // Replace the temp uploading file with the final uploaded data (maintain position)
//         setFiles((prev: any) => {
//           const updated = [...prev];
//           const index = updated.findIndex((f) => f.id === tempId);
//           if (index !== -1) {
//             updated[index] = {
//               ...updated[index],
//               id: Date.now().toString(),
//               progress: 100,
//               status: "complete",
//               timeLeft: undefined,
//               path: path,
//             };
//           }
//           return updated;
//         });

//         // Update form value
//         if (fileToReplace.fieldName) {
//           const currentValues =
//             form.getValues(`supportingDocument.${fileToReplace.fieldName}`) ||
//             [];

//           const updatedValues = fileToReplace.path
//             ? currentValues
//                 .filter((val: string) => val !== fileToReplace.path)
//                 .concat(path)
//             : [...currentValues, path];

//           form.setValue(
//             `supportingDocument.${fileToReplace.fieldName}` as const,
//             updatedValues
//           );
//         }

//         // Update uploads state
//         setUploads((prev:any) => {
//           const fieldUploads = prev[fileToReplace.fieldName!];
//           const index = fileToReplace.path
//             ? fieldUploads.previews.findIndex(
//                 (p:any) =>
//                   p ===
//                   `${process.env.NEXT_PUBLIC_API_URL}${fileToReplace.path}`
//               )
//             : -1;

//           const newFiles = [...fieldUploads.files];
//           const newPreviews = [...fieldUploads.previews];

//           if (index !== -1) {
//             newFiles[index] = newFile;
//             newPreviews[index] = `${process.env.NEXT_PUBLIC_API_URL}${path}`;
//           } else {
//             newFiles.push(newFile);
//             newPreviews.push(`${process.env.NEXT_PUBLIC_API_URL}${path}`);
//           }

//           return {
//             ...prev,
//             [fileToReplace.fieldName!]: {
//               files: newFiles,
//               previews: newPreviews,
//             },
//           };
//         });
//       } catch (error) {
//         // Revert on error
//         setFiles((prev:any) => prev.filter((file:any) => file.id !== tempId));
//         toast.error(`Failed to replace file`);
//       }
//     }
//   };

//   fileInput.click();
// };
