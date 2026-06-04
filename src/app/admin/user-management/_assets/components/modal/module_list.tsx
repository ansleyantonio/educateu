// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
// } from "@/components/ui/form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { Loader2 } from "lucide-react";
// import { useEffect } from "react";
// import { useForm } from "react-hook-form";
// import toast from "react-hot-toast";
// import { z } from "zod";
// import { AssignModule } from "../../query_controller/assignModule";
// import { filterPermissionsData } from "../../utils/assignModuleAvailableDataFormate";

// // Permission labels mapping
// const permissionLabels: Record<string, string> = {
//   GET: "Read",
//   POST: "Edit",
//   DELETE: "Delete",
// };

// // Define module permission types
// interface ModulePermission {
//   moduleId: string;
//   modulePermission: string[];
// }

// interface CategoryPermission {
//   categoryId: string;
//   modules: ModulePermission[];
// }

// interface ModuleListProps {
//   token: string | undefined;
//   id: string[];
//   data: {
//     userModules: {
//       portalCategorieName: string;
//       portalCategorieId: string;
//       modules: {
//         moduleName: string;
//         moduleId: string;
//         availableModulePermission: string[];
//         assignedModulePermissions: string[];
//       }[];
//     }[];
//   };
//   isLoading: boolean;
//   closeModal?: () => void;
// }

// // Define Zod validation schema
// const FormSchema = z.object({
//   categories: z.array(
//     z.object({
//       categoryId: z.string().optional(),
//       modules: z.array(
//         z.object({
//           moduleId: z.string().optional(),
//           modulePermission: z.array(z.string().optional()).optional(),
//         })
//       ),
//     })
//   ),
// });

// export function ModuleList({
//   token,
//   id,
//   data,
//   isLoading,
//   closeModal,
// }: ModuleListProps) {
//   const queryClient = useQueryClient();

//   console.log("data llll", data);

//   const form = useForm<z.infer<typeof FormSchema>>({
//     resolver: zodResolver(FormSchema),
//     defaultValues: { categories: [] },
//   });

//   const assignMutation = useMutation({
//     mutationFn: (formData: any) => AssignModule(formData),
//     onSuccess: (data) => {
//       queryClient.invalidateQueries({ queryKey: ["assign-module"] });
//       toast.success(data.message);
//       if (closeModal) {
//         closeModal();
//       } // add null check here
//     },

//     onError: (error) => toast.error(error.message),
//   });

//   // data = data && assignModulePermissionsDataFormat(data);
//   // Pre-fill form with default values from backend data
//   useEffect(() => {
//     if (data?.userModules) {
//       const defaultCategories = data.userModules.map((category) => ({
//         categoryId: category.portalCategorieId,
//         modules: category.modules.map((module) => ({
//           moduleId: module.moduleId,
//           modulePermission: module.assignedModulePermissions,
//         })),
//       }));

//       form.reset({
//         categories: defaultCategories,
//       });
//     }
//   }, [data, form]);

//   const onSubmit = (values: z.infer<typeof FormSchema>) => {
//     const payload = {
//       userId: typeof id === "string" ? [id] : [...id],
//       portalCategories: values.categories,
//     };

//     // Format the payload

//     // Log the payload for debugging
//     console.log("Submitted Payload:", values);

//     const AssignModuleList = filterPermissionsData(payload);
//     // console.log("Submitted Data:", payload);
//     // console.log("Submitted AssignModuleList:", AssignModuleList);
//     const body = {
//       AssignModuleList: AssignModuleList,
//       token: token,
//     };

//     console.log("body", body);
//     assignMutation.mutate(body);
//   };

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center h-[300px]">
//         <Loader2 size={55} strokeWidth={2} className="animate-spin" />
//       </div>
//     );
//   }

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//         {data?.userModules?.map((category) => (
//           <div key={category.portalCategorieId}>
//             <h2 className="text-lg font-semibold mb-4">
//               {category.portalCategorieName}
//             </h2>
//             {category.modules.map((module) => {
//               const modulePermissions =
//                 form
//                   .watch("categories")
//                   .find((c) => c.categoryId === category.portalCategorieId)
//                   ?.modules.find((m) => m.moduleId === module.moduleId)
//                   ?.modulePermission || [];

//               // Check if all available permissions are selected
//               const defaultPermissions = ["GET", "POST", "DELETE"];

//               const areAllPermissionsSelected = defaultPermissions.every(
//                 (permission) => modulePermissions.includes(permission)
//               );

//               return (
//                 <div
//                   key={module.moduleId}
//                   className="flex justify-between mb-4"
//                 >
//                   <div className="flex items-center space-x-3">
//                     {/* Module-level checkbox */}
//                     <Checkbox
//                       checked={areAllPermissionsSelected}
//                       onCheckedChange={(checked) => {
//                         const updatedCategories = form.getValues("categories");
//                         const categoryIndex = updatedCategories.findIndex(
//                           (c) => c.categoryId === category.portalCategorieId
//                         );

//                         if (checked) {
//                           // If the module-level checkbox is checked, add all available permissions
//                           if (categoryIndex === -1) {
//                             updatedCategories.push({
//                               categoryId: category.portalCategorieId,
//                               modules: [
//                                 {
//                                   moduleId: module.moduleId,
//                                   modulePermission: defaultPermissions,
//                                 },
//                               ],
//                             });
//                           } else {
//                             const moduleIndex = updatedCategories[
//                               categoryIndex
//                             ].modules.findIndex(
//                               (m) => m.moduleId === module.moduleId
//                             );

//                             if (moduleIndex === -1) {
//                               updatedCategories[categoryIndex].modules.push({
//                                 moduleId: module.moduleId,
//                                 modulePermission: defaultPermissions,
//                               });
//                             } else {
//                               updatedCategories[categoryIndex].modules[
//                                 moduleIndex
//                               ].modulePermission = defaultPermissions;
//                             }
//                           }
//                         } else {
//                           // If the module-level checkbox is unchecked, remove all permissions
//                           if (categoryIndex !== -1) {
//                             const moduleIndex = updatedCategories[
//                               categoryIndex
//                             ].modules.findIndex(
//                               (m) => m.moduleId === module.moduleId
//                             );

//                             if (moduleIndex !== -1) {
//                               updatedCategories[categoryIndex].modules.splice(
//                                 moduleIndex,
//                                 1
//                               );
//                             }
//                           }
//                         }

//                         form.setValue("categories", updatedCategories);
//                       }}
//                     />
//                     <h3 className="text-sm font-semibold capitalize">
//                       {module.moduleName}
//                     </h3>
//                   </div>
//                   <div className="flex space-x-4">
//                     {defaultPermissions.map((permission) => (
//                       <FormField
//                         key={`${module.moduleId}-${permission}`}
//                         control={form.control}
//                         name="categories"
//                         render={() => {
//                           const isPermissionSelected =
//                             modulePermissions.includes(permission);
//                           return (
//                             <FormItem className="flex items-center space-x-2">
//                               <FormControl>
//                                 {/* Permission-level checkbox */}
//                                 <Checkbox
//                                   checked={isPermissionSelected}
//                                   onCheckedChange={(checked) => {
//                                     const updatedCategories =
//                                       form.getValues("categories");
//                                     const categoryIndex =
//                                       updatedCategories.findIndex(
//                                         (c) =>
//                                           c.categoryId ===
//                                           category.portalCategorieId
//                                       );

//                                     if (categoryIndex === -1) {
//                                       updatedCategories.push({
//                                         categoryId: category.portalCategorieId,
//                                         modules: [
//                                           {
//                                             moduleId: module.moduleId,
//                                             modulePermission: [permission],
//                                           },
//                                         ],
//                                       });
//                                     } else {
//                                       const moduleIndex = updatedCategories[
//                                         categoryIndex
//                                       ].modules.findIndex(
//                                         (m) => m.moduleId === module.moduleId
//                                       );

//                                       if (moduleIndex === -1) {
//                                         updatedCategories[
//                                           categoryIndex
//                                         ].modules.push({
//                                           moduleId: module.moduleId,
//                                           modulePermission: [permission],
//                                         });
//                                       } else {
//                                         const permissions =
//                                           updatedCategories[categoryIndex]
//                                             .modules[moduleIndex]
//                                             .modulePermission;

//                                         if (checked) {
//                                           permissions?.push(permission);
//                                         } else {
//                                           updatedCategories[
//                                             categoryIndex
//                                           ].modules[
//                                             moduleIndex
//                                           ].modulePermission =
//                                             permissions?.filter(
//                                               (p) => p !== permission
//                                             );
//                                         }
//                                       }
//                                     }

//                                     form.setValue(
//                                       "categories",
//                                       updatedCategories
//                                     );
//                                   }}
//                                 />
//                               </FormControl>
//                               <FormLabel className="text-sm font-normal">
//                                 {permissionLabels[permission]}
//                               </FormLabel>
//                             </FormItem>
//                           );
//                         }}
//                       />
//                     ))}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         ))}
//         <Button type="submit" variant="primary">
//           {assignMutation.isPending ? "Saving..." : "Save"}
//         </Button>
//       </form>
//     </Form>
//   );
// }

/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { AssignModule } from "../../query_controller/assignModule";
import { filterPermissionsData } from "../../utils/assignModuleAvailableDataFormate";

// Permission labels mapping
const permissionLabels: Record<string, string> = {
  GET: "Read",
  POST: "Edit",
  DELETE: "Delete",
};

// Define module permission types
interface ModulePermission {
  moduleId: string;
  modulePermission: string[];
}

interface CategoryPermission {
  portalCategoryId: string; // Updated to match the payload
  modules: ModulePermission[];
}

interface ModuleListProps {
  token: string | undefined;
  id: string[];
  data: {
    userModules: {
      portalCategorieName: string;
      portalCategorieId: string;
      modules: {
        moduleName: string;
        moduleId: string;
        availableModulePermission: string[];
        assignedModulePermissions: string[];
      }[];
    }[];
  };
  isLoading: boolean;
  closeModal?: () => void;
}

// Define Zod validation schema
const FormSchema = z.object({
  categories: z.array(
    z.object({
      portalCategoryId: z.string().optional(), // Updated to match the payload
      modules: z.array(
        z.object({
          moduleId: z.string().optional(),
          modulePermission: z.array(z.string().optional()).optional(),
        })
      ),
    })
  ),
});

export function ModuleList({
  token,
  id,
  data,
  isLoading,
  closeModal,
}: ModuleListProps) {
  const queryClient = useQueryClient();

  console.log("data llll", data);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { categories: [] },
  });

  const assignMutation = useMutation({
    mutationFn: (formData: any) => AssignModule(formData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["assign-module"] });
      toast.success(data.message);
      if (closeModal) {
        closeModal();
      }
    },
    onError: (error) => toast.error(error.message),
  });

  useEffect(() => {
    if (data?.userModules) {
      const defaultCategories = data.userModules.map((category) => ({
        portalCategoryId: category.portalCategorieId, // Updated to match the payload
        modules: category.modules.map((module) => ({
          moduleId: module.moduleId,
          modulePermission: module.assignedModulePermissions,
        })),
      }));

      form.reset({
        categories: defaultCategories,
      });
    }
  }, [data, form]);

  const onSubmit = (values: z.infer<typeof FormSchema>) => {
    console.log("submit form ", values);
    const payload = {
      userId: typeof id === "string" ? [id] : [...id],
      portalCategories: values.categories,
    };

    console.log("Submitted Payload:", payload);

    const AssignModuleList = filterPermissionsData(payload);
    const body = {
      AssignModuleList: AssignModuleList,
      token: token,
    };

    console.log("body", body);
    assignMutation.mutate(body);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <Loader2 size={55} strokeWidth={2} className="animate-spin" />
      </div>
    );
  }

  // Fallback UI when userModules is empty
  if (!data?.userModules || data.userModules.length === 0) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <p className="text-gray-500">No modules available for this user.</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {data.userModules.map((category) => (
          <div key={category.portalCategorieId}>
            <h2 className="text-lg font-semibold mb-4">
              {category.portalCategorieName}
            </h2>
            {category.modules.map((module) => {
              const modulePermissions =
                form
                  .watch("categories")
                  .find(
                    (c) => c.portalCategoryId === category.portalCategorieId
                  )
                  ?.modules.find((m) => m.moduleId === module.moduleId)
                  ?.modulePermission || [];

              const defaultPermissions = ["GET", "POST", "DELETE"];
              const areAllPermissionsSelected = defaultPermissions.every(
                (permission) => modulePermissions.includes(permission)
              );

              return (
                <div
                  key={module.moduleId}
                  className="flex justify-between mb-4"
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={areAllPermissionsSelected}
                      onCheckedChange={(checked) => {
                        const updatedCategories = form.getValues("categories");
                        const categoryIndex = updatedCategories.findIndex(
                          (c) =>
                            c.portalCategoryId === category.portalCategorieId
                        );

                        if (checked) {
                          if (categoryIndex === -1) {
                            updatedCategories.push({
                              portalCategoryId: category.portalCategorieId,
                              modules: [
                                {
                                  moduleId: module.moduleId,
                                  modulePermission: defaultPermissions,
                                },
                              ],
                            });
                          } else {
                            const moduleIndex = updatedCategories[
                              categoryIndex
                            ].modules.findIndex(
                              (m) => m.moduleId === module.moduleId
                            );

                            if (moduleIndex === -1) {
                              updatedCategories[categoryIndex].modules.push({
                                moduleId: module.moduleId,
                                modulePermission: defaultPermissions,
                              });
                            } else {
                              updatedCategories[categoryIndex].modules[
                                moduleIndex
                              ].modulePermission = defaultPermissions;
                            }
                          }
                        } else {
                          if (categoryIndex !== -1) {
                            const moduleIndex = updatedCategories[
                              categoryIndex
                            ].modules.findIndex(
                              (m) => m.moduleId === module.moduleId
                            );

                            if (moduleIndex !== -1) {
                              updatedCategories[categoryIndex].modules.splice(
                                moduleIndex,
                                1
                              );
                            }
                          }
                        }

                        form.setValue("categories", updatedCategories);
                      }}
                    />
                    <h3 className="text-sm font-semibold capitalize">
                      {module.moduleName}
                    </h3>
                  </div>
                  <div className="flex space-x-4">
                    {defaultPermissions.map((permission) => (
                      <FormField
                        key={`${module.moduleId}-${permission}`}
                        control={form.control}
                        name="categories"
                        render={() => {
                          const isPermissionSelected =
                            modulePermissions.includes(permission);
                          return (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Checkbox
                                  checked={isPermissionSelected}
                                  onCheckedChange={(checked) => {
                                    const updatedCategories =
                                      form.getValues("categories");
                                    const categoryIndex =
                                      updatedCategories.findIndex(
                                        (c) =>
                                          c.portalCategoryId ===
                                          category.portalCategorieId
                                      );

                                    if (categoryIndex === -1) {
                                      updatedCategories.push({
                                        portalCategoryId:
                                          category.portalCategorieId,
                                        modules: [
                                          {
                                            moduleId: module.moduleId,
                                            modulePermission: [permission],
                                          },
                                        ],
                                      });
                                    } else {
                                      const moduleIndex = updatedCategories[
                                        categoryIndex
                                      ].modules.findIndex(
                                        (m) => m.moduleId === module.moduleId
                                      );

                                      if (moduleIndex === -1) {
                                        updatedCategories[
                                          categoryIndex
                                        ].modules.push({
                                          moduleId: module.moduleId,
                                          modulePermission: [permission],
                                        });
                                      } else {
                                        const permissions =
                                          updatedCategories[categoryIndex]
                                            .modules[moduleIndex]
                                            .modulePermission;

                                        if (checked) {
                                          permissions?.push(permission);
                                        } else {
                                          updatedCategories[
                                            categoryIndex
                                          ].modules[
                                            moduleIndex
                                          ].modulePermission =
                                            permissions?.filter(
                                              (p) => p !== permission
                                            );
                                        }
                                      }
                                    }

                                    form.setValue(
                                      "categories",
                                      updatedCategories
                                    );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {permissionLabels[permission]}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <Button type="submit" variant="primary">
          {assignMutation.isPending ? "Saving..." : "Save"}
        </Button>
      </form>
    </Form>
  );
}
