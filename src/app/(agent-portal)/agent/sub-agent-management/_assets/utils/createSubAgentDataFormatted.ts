/* eslint-disable @typescript-eslint/no-explicit-any */

// import { subAgentCreateFormSchemaType } from "../interface/subAgentCreateSchema";
//
// export function createSubAgentDataFormatted(
//   input: subAgentCreateFormSchemaType
// ) {
//   if (!input || typeof input !== "object") {
//     throw new Error("Invalid input object");
//   }
//
//   const transformedData = {
//     email: input.email,
//     password: input.password,
//     mobile: input.mobile,
//     username: input.username,
//     firstName: input.firstName || "",
//     lastName: input.lastName || "",
//     address: input.address || "",
//     userRoles: [
//       {
//         roleData: {
//           internalReference: input.internalReference || "",
//           userStatus: input.status || "active",
//           companyName: input.companyName || "",
//           reportingTo: input.reportingTo,
//         },
//       },
//     ],
//   };
//
//   return transformedData;
// }
